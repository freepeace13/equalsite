# @equalsite/web

The main Equalsite application — a **Laravel 13** backend with a **React 19** frontend via **Inertia.js 3**. Handles user authentication, audit orchestration, real-time scan progress, artifact ingestion, violation persistence, and accessibility reporting.

---

## Responsibilities

| Concern | Implementation |
|---------|----------------|
| User auth | Laravel Fortify — registration, login, email verification, password reset, two-factor authentication |
| Audit orchestration | Create/cancel audits via `SpiderClient` HTTP calls to the crawler API |
| Live progress | Consumes Redis Streams (`crawler:listen`) → Laravel events → Soketi broadcast |
| Artifact processing | Receives zipped crawler datasets, extracts axe JSON, upserts violations |
| Reporting | Health score calculation, severity breakdown, remediation cluster UI |
| Background jobs | Laravel Horizon supervises queue workers |

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Runtime | PHP 8.3+ |
| Framework | Laravel 13 |
| Frontend bridge | Inertia.js 3 |
| UI | React 19, Tailwind CSS 4, Radix UI, shadcn-style components |
| Build | Vite 8, `@laravel/vite-plugin-wayfinder` |
| Auth | Laravel Fortify |
| Real-time | Laravel Echo + Soketi (Pusher protocol) |
| Queues | Laravel Horizon (Redis-backed metrics), database queue driver |
| Testing | Pest 4 |
| Lint / format | Laravel Pint, ESLint, Prettier |

---

## Application architecture

```
app/
├── Actions/                  # Single-purpose action classes
│   ├── Audit/                # CreateAudit, CancelAudit, UnzipCrawlerArtifacts
│   └── CreateAuditViolation.php
├── Console/Commands/
│   └── ConsumeCrawlerStreams.php   # artisan crawler:listen
├── Events/Audit/             # Domain events (broadcast via Soketi)
├── Http/Controllers/
│   └── Audit/                # ScanningController, ReportController
├── Jobs/
│   └── ProcessAuditArtifacts.php
├── Listeners/                # Stream event → DB state + broadcast
├── Models/
│   ├── Audit.php
│   └── Violation.php
├── Services/
│   ├── HealthScoreCalculator.php
│   └── ReportPresenter.php
└── Support/
    ├── RedisStream.php       # XREADGROUP consumer loop
    └── Spider/               # HTTP client for crawler API
```

### Data model

**`audits`** — one row per scan. Tracks `url`, `domain`, `status`, `crawler_id`, and `custom_data` (JSON for progress %, scanned URLs, queue position).

**`audit_violations`** — one row per unique axe rule per audit. Stores impact level, description, help URL, failure summary, and affected DOM nodes (via `AsNodeCollection` cast). Columns for AI-generated summaries are scaffolded for future use.

### Event pipeline

The `crawler:listen` artisan command blocks on a Redis Stream consumer group and dispatches Laravel events:

| Stream event | Laravel handler | Effect |
|--------------|-----------------|--------|
| `audit.queued` | `AuditQueueStateListener` | Stores queue position in `custom_data` |
| `audit.progress` | `AuditProgressListener` | Updates progress percentage |
| `audit.page.*` | `AuditPageSubscriber` | Tracks per-URL scan state |
| `audit.started` / `failed` / `completed` | `AuditStatusSubscriber` | Updates `audits.status` |

All audit events implementing `ShouldBroadcast` are pushed to the `audit-{id}-scanning` WebSocket channel for the live progress page.

### Spider integration

```php
// config/services.php
'crawler' => [
    'host' => env('CRAWLER_HOST', 'crawler-api'),
    'port' => env('CRAWLER_PORT', 3000),
    'secret' => env('CRAWLER_SECRET'),
],
```

`SpiderClient` uses an `Http::spider()` macro to call `POST /api/v1/audit`, `DELETE /api/v1/audit/{id}`, and `GET /api/v1/download/{id}`. On `audit.completed`, `AuditStatusSubscriber` downloads the finished artifact zip from the crawler-api, extracts it via `UnzipCrawlerArtifacts`, and dispatches `ProcessAuditArtifacts` to parse it into violation records — Laravel pulls the data rather than the crawler pushing it.

---

## Frontend pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | `welcome` | Landing — "Test your site" |
| `/dashboard` | `dashboard` | Authenticated home (requires verified email) |
| `/audit/create` | `audit/scan-request` | Submit a URL for scanning |
| `/audit/{id}` | `audit/scan-progress` | Live progress with Echo WebSocket updates |
| `/audit/{id}/report` | `audit/report` | Completed audit — score, violations, remediation clusters |
| `/settings/*` | `settings/*` | Profile, security, appearance |

Reporting UI lives in `resources/js/components/reporting/` — remediation clusters, breadcrumbs, score gauge, and severity breakdowns. WebSocket event types are imported from `@equalsite/types` for end-to-end type safety with the crawler.

---

## Routes

```
POST   /audit                  → ScanningController@store
GET    /audit/{id}             → ScanningController@progress
DELETE /audit/{id}             → ScanningController@cancel
GET    /audit/{id}/report      → ReportController@show
```

Fortify handles all `/login`, `/register`, `/two-factor-challenge`, etc.

---

## Setup

### Docker (recommended)

From the monorepo root:

```bash
docker compose up -d --build
docker compose exec web php artisan migrate
docker compose exec web php artisan crawler:listen   # required for live events
```

The `web` container runs PHP's built-in server, Vite, and Horizon via supervisord.

### Native

```bash
cd apps/web
composer install
cp .env.example .env   # or use root .env
php artisan key:generate
php artisan migrate

# Run concurrently (or use composer dev script):
php artisan serve
php artisan queue:listen
php artisan crawler:listen
pnpm dev               # Vite dev server
```

Ensure `.env` points `CRAWLER_HOST`, `REDIS_HOST`, `DB_HOST`, and `PUSHER_HOST` at running services.

### Composer scripts

```bash
composer dev          # serve + queue + pail + vite (concurrently)
composer test         # pint + pest
composer lint         # pint --parallel
```

### Frontend scripts

```bash
pnpm dev              # Vite HMR
pnpm build            # Production asset build
pnpm typecheck        # tsc --noEmit
pnpm lint             # ESLint
```

Add dependencies from the monorepo root:

```bash
pnpm add <package> --filter web
```

---

## Key environment variables

| Variable | Purpose |
|----------|---------|
| `CRAWLER_HOST` / `CRAWLER_PORT` | Crawler API endpoint (Docker: `crawler-api:3000`) |
| `CRAWLER_SECRET` | Bearer token for all crawler-api requests (create/cancel/download) |
| `STREAM_NAME` | Redis stream consumed by `crawler:listen` |
| `PUSHER_*` / `VITE_PUSHER_*` | Soketi connection for Laravel Echo |
| `QUEUE_CONNECTION` | Default: `database` (Horizon still uses Redis for metrics) |

---

## Testing

```bash
# Inside Docker
docker compose exec web php artisan test

# Native
composer test
```

Tests use Pest with Laravel's testing helpers. Factories exist for `User` and `Audit`.

---

## Notable design choices

**Action classes over fat controllers** — `CreateAudit`, `CancelAudit`, and `UnzipCrawlerArtifacts` encapsulate orchestration logic, keeping controllers thin.

**Redis Stream consumer as a long-running artisan command** — Rather than polling or webhooks for every progress tick, a dedicated `crawler:listen` process maps durable stream events to Laravel's event system. This decouples the crawler's publish rate from HTTP request handling.

**Violation upserts with node fingerprints** — `CreateAuditViolation` deduplicates by rule ID and merges affected DOM nodes, so multi-page crawls produce consolidated violation records rather than duplicates per page.

**Shared types with the crawler** — `@equalsite/types` provides `EventEnum`, WebSocket payload types, and API contracts used directly in React components, ensuring the frontend and crawler agree on event shapes without manual sync.
