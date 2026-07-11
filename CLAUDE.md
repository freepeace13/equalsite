# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Equalsite is a full-stack web accessibility auditing platform: users submit a URL, a headless-browser
crawler runs WCAG checks via axe-core on every page, progress streams live to the browser, and the
result is a scored, remediation-oriented report.

It's a **pnpm + Turbo monorepo**:

- `apps/web` — `@equalsite/web`: Laravel 13 + React 19 (Inertia.js 3). User-facing app: auth, audit
  orchestration, live progress, artifact ingestion, reporting.
- `services/playwright-spider` — `@equalsite/playwright-spider`: Node/Express 5 API + BullMQ worker
  that runs Playwright/Crawlee crawls and axe-core scans.
- `packages/types` — `@equalsite/types`: shared TS contracts (API payloads, stream events, WS payloads)
  consumed by both `apps/web`'s React code and the crawler service.
- `packages/ui` — `@equalsite/ui`: shared shadcn-style React component library (Button, StatusBadge,
  SeverityBadge, ProgressBar, MetricCard, StatPair, Callout, Collapsible), developed and visually
  verified in Storybook. Not yet wired into `apps/web` as a dependency — see
  `packages/ui/README.md` for development guidelines before adding a component here.
- `packages/eslint-config`, `packages/tsconfig` — shared lint/TS bases.

## Architecture — how the two services talk

```
Browser (React/Inertia) → Laravel HTTP API → SpiderClient (HTTP, Bearer CRAWLER_SECRET)
    → crawler-api (Express) → enqueue BullMQ job → crawler-worker
    → Playwright + Crawlee crawl → axe-core scan per page
    → XADD progress events to Redis Stream (equalsite:crawler:events)
Laravel `php artisan crawler:listen` blocks on XREADGROUP, turns stream events into
Laravel domain events, and broadcasts them over Soketi (Pusher-protocol WebSocket) to the browser.
On completion the worker zips Crawlee datasets and POSTs them (multipart, Bearer auth) to
Laravel's `/api/crawler/callback`, which queues `ProcessAuditArtifacts` to parse axe JSON and
upsert `audit_violations`.
```

Key implication: **`php artisan crawler:listen` must be running** for live progress/status updates to
reach the browser — it's not automatic like a normal queue worker. In Docker Compose it needs to be
started manually (see Setup below); it isn't part of the `web` container's supervisord processes.

Cross-service HTTP calls (`Laravel → crawler-api`, `crawler-worker → Laravel callback`) are all
authenticated with a shared `CRAWLER_SECRET` bearer token.

Why this shape (don't "simplify" it away without reading these first):
- Crawling is isolated behind its own API + worker because Playwright is resource-heavy and needs to
  scale independently of the PHP web app.
- Redis Streams (not webhooks) carry progress because they're durable/ordered/consumer-group based —
  Laravel can catch up after a restart without the crawler tracking delivery state.
- `@equalsite/types` is the single source of truth for event/payload shapes across PHP and the two
  Node runtimes, so changes to event contracts should happen there first, then be threaded through.

## Data model (apps/web)

- `audits` — one row per scan: `url`, `domain`, `status`, `crawler_id` (UUID — **this**, not the PK
  `id`, is what appears in the `/audit/{id}` route), `custom_data` JSON (progress %, scanned URLs,
  queue position).
- `audit_violations` — one row per unique axe rule per audit; impact, description, help URL, failure
  summary, affected DOM nodes (`AsNodeCollection` cast, deduplicated/merged across pages by
  `CreateAuditViolation`). Columns for AI-generated plain-English summaries exist but are unused
  (`OPENAI_*` scaffolding, not wired up).

## Commands

### Root (Turbo, runs across all workspaces)
```bash
pnpm install     # installs everything; builds @equalsite/types (prepare script)
pnpm dev         # turbo run dev --parallel (Vite, crawler API/worker, types watch)
pnpm build       # turbo run build
pnpm lint        # eslint --fix across packages
pnpm lintcheck   # eslint (no fix) across packages
pnpm test        # pest (web) + vitest (crawler) via turbo
```

### apps/web (Laravel + React) — run from `apps/web/`
```bash
composer dev            # serve + queue:listen + pail + vite, concurrently
composer test           # config:clear + pint --test + php artisan test
composer lint            # pint --parallel
composer lint:check      # pint --parallel --test
php artisan test --filter=SomeTestName   # run a single Pest test
pnpm dev / build / lint / lintcheck / typecheck   # frontend equivalents (typecheck = tsc --noEmit)
```
In Docker: `docker compose exec web php artisan test --no-coverage`. The `testing` DB needs a manual
one-time migration that `migrate --env=testing` does NOT trigger:
`docker compose exec web bash -c "DB_DATABASE=testing php artisan migrate --force"`.

### services/playwright-spider — run from `services/playwright-spider/`
```bash
pnpm dev            # API with tsx watch
pnpm dev:worker     # worker with tsx watch
pnpm test           # vitest
pnpm test <pattern> # run matching test file(s)
pnpm typecheck      # tsc --noEmit
pnpm build          # tsup → dist/server.js, dist/worker.js
```

### packages/types
Two consumption modes: production builds import `dist/` (built via tsup), dev/watch mode uses the
`source` export condition straight to `src/` so React and the crawler pick up edits without a rebuild.
Run `pnpm --filter @equalsite/types dev` to watch-build it. When adding an export, add it explicitly
(e.g. `./node/index`, not `./node`) — the shorthand collides with `@types/node` resolution during DTS
builds.

### packages/ui — run from `packages/ui/`
```bash
pnpm dev / storybook       # Storybook dev server on :6006
pnpm build-storybook       # static Storybook build (used to verify all stories compile)
pnpm build                 # tsup → dist/index.{js,mjs}
pnpm typecheck / lintcheck # tsc --noEmit / eslint (no fix)
```
Same dual `source`/`dist` consumption pattern as `packages/types`. Every component under
`src/components/ui/*.tsx` must have a sibling `*.stories.tsx` and an explicit named export from
`src/index.ts`. Read `packages/ui/README.md` before adding or changing a component — it covers
shadcn conventions, which colors must stay literal (severity/status) vs. theme-variable-driven, and
why `Collapsible` deliberately avoids Radix.

### Docker stack (root)
```bash
docker compose up -d --build
docker compose exec web php artisan migrate
docker compose exec web php artisan crawler:listen   # required for live progress — not automatic
```
Vite must run **on the host**, not in the container — the app embeds `http://127.0.0.1:5174/` asset
URLs, which only resolve from the host: `pnpm --filter @equalsite/web dev`.

To drive/screenshot the running app, use the `run-web` skill in `apps/web/.claude/skills/run-web/`
rather than hand-rolling Playwright — it already knows the login flow, the `/dashboard` vs
`/audit/create` post-login redirect quirk, and known-flaky tests.

## Conventions worth knowing before editing

- **Action classes over fat controllers** in `apps/web`: `app/Actions/Audit/` (`CreateAudit`,
  `CancelAudit`, `UnzipCrawlerArtifacts`) hold orchestration logic; controllers stay thin.
- Stream event → domain event wiring lives in `app/Listeners/` and is dispatched from
  `app/Console/Commands/ConsumeCrawlerStreams.php` (`crawler:listen`). If you add a new crawler event
  type, it needs an entry in `@equalsite/types` (`src/events.ts`), a case in the crawler worker
  (`src/audit/services/auditService.ts` and friends), and a listener in `app/Listeners/`.
- `ioredis` in `services/playwright-spider` is pinned to the exact version `5.10.1` — do not let it
  float, it must match BullMQ's peer dependency for TS compatibility.
- TS deprecation flags (e.g. `ignoreDeprecations: '6.0'`) belong in a package's tsup `dts.compilerOptions`,
  not the root `tsconfig.json` — putting them at the root breaks IDE validation.

## Project docs
- `docs/style-guide.md` — brand identity, color/type tokens, component
  patterns, and UX design principles. Read before any UI work.
- `docs/architecture.md` — user journey, state machines, data model, and
  engineering notes. Read before any backend/frontend logic work. As of v3
  this documents a target design — mandatory auth via Fortify, no more guest
  audits, a Dashboard/User Audits/Site page replacing the old lobby, and
  plan-gated limits — that is **ahead of the current codebase**: `audits.user_id`
  is still nullable and guest audits still work today. Don't assume a v3
  detail is live without checking the actual schema/routes first.
- `docs/monetization.md` — free/Pro plan model (queue priority + access-scope
  limits) that architecture.md's v3 sections reference throughout. Read
  before building plan-gating or billing-adjacent logic.
- `packages/ui/README.md` — development guidelines for the shared component
  library: shadcn/cva conventions, which colors must stay literal vs. theme-
  driven, Storybook conventions, and the component-addition checklist. Read
  before adding or changing anything under `packages/ui/src/components/ui/`.
