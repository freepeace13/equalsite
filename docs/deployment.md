# Equalsite — production deployment

Status: **proposal, not yet applied** — nothing is deployed today. This is the target
architecture for the first production launch, written for a **solo operator on a
~$40–60/mo budget**. For product/data-model context see `architecture`; for the plan
model and financial assumptions (`~$40/mo` fixed-cost baseline, break-even math) see
`monetization` §6, which this doc is designed to fit under.

---

## 1. Shape: single VPS, Docker Compose, staged for growth

Everything runs as containers on one box — the same shape as the existing
`compose.yaml`, hardened for production. The two changes that matter most:

1. `horizon` and `crawler:listen` become their own `restart: always` services, not
   manual commands. Today neither is automatic — `composer dev` runs `queue:listen`
   locally, and the root `CLAUDE.md` explicitly warns `crawler:listen` "isn't part of
   the `web` container's supervisord processes" in the dev Compose stack. In production
   this is not optional: if `crawler:listen` dies, live progress silently stops
   reaching the browser (audits still complete, but users see nothing move).
2. `memcached` is dropped. It's an unused Sail scaffold default — `.env.example`
   already sets `CACHE_STORE=database` / `SESSION_DRIVER=database`, not memcached — and
   isn't worth the RAM on an 8GB box.

**Why not a PaaS (Railway/Render/Fly)?** Playwright/Chromium is RAM-heavy and
long-running. Compute-metered PaaS billing gets expensive fast for that workload —
a flat-rate VPS gives far more headroom per dollar for a solo operator at this stage.
Revisit if/when autoscaling actually becomes worth the premium (Stage 2, §9).

## 2. Compute & provider

**Hetzner Cloud CPX31** (4 vCPU / 8GB RAM / 160GB NVMe), currently ~$18–25/mo
depending on region — roughly half of the equivalent Vultr tier assumed in
`monetization.md`. Switching costs nothing beyond a DNS cutover; the Docker Compose
ops model is identical on either provider.

8GB is sized for MySQL + Redis + Soketi + Laravel (PHP-FPM) + a **concurrency-capped**
Playwright worker running alongside each other. Cap BullMQ worker concurrency
explicitly (start at 2) — unbounded Chromium instances are the realistic OOM risk on
this box, not MySQL or Redis.

Pricing fluctuates — confirm current numbers on Hetzner's pricing page before
provisioning.

## 3. Service topology (production `compose.yaml`)

| Service | Image/build | Restart policy | Notes |
|---|---|---|---|
| `web` | `apps/web` Dockerfile | `always` | PHP-FPM + nginx, serves the Laravel/Inertia app |
| `horizon` | same image as `web` | `always` | `php artisan horizon` — **new service**, required for queue processing |
| `crawler-listen` | same image as `web` | `always` | `php artisan crawler:listen` — **new service**, required for live progress |
| `crawler-api` | `services/playwright-spider` Dockerfile | `always` | Express API, enqueues BullMQ jobs |
| `crawler-worker` | `services/playwright-spider` Dockerfile | `always` | Playwright + axe-core, concurrency capped |
| `mysql` | `mysql:8.4` | `always` | self-hosted at this stage, see §9 for managed-DB migration trigger |
| `redis` | `redis:alpine` | `always` | queues, cache, sessions, crawler progress stream |
| `soketi` | `quay.io/soketi/soketi` | `always` | Pusher-protocol WebSocket server |
| `caddy` | `caddy:alpine` | `always` | edge reverse proxy, automatic TLS |
| `backup` | small cron image | `always` (cron loop) | nightly `mysqldump` → object storage, see §7 |

## 4. Required app-config changes (not just infra)

The dev `.env.example` defaults are **not** production-safe as-is:

- `QUEUE_CONNECTION=redis` — **Horizon only supports the Redis driver.** The
  `database` value in `.env.example` is fine for local Sail dev but Horizon will not
  run against it; this must be `redis` in production or the `horizon` service above
  does nothing.
- `CACHE_STORE=redis`, `SESSION_DRIVER=redis` — moves cache/session churn off MySQL
  onto Redis, which is already a hard dependency for the queue.
- `FILESYSTEM_DISK=s3` pointed at object storage (§6) instead of `local` — anything
  written to local disk is lost on a container rebuild/redeploy.
- `APP_ENV=production`, `APP_DEBUG=false` — standard, but worth stating explicitly
  since `.env.example` ships `APP_DEBUG=true`.
- `PADDLE_SANDBOX=false` with live Paddle credentials once the vendor account is
  approved for live payments (`.env.example` currently ships sandbox placeholders —
  see `monetization` §4).

## 5. Edge, TLS, DNS

- **Caddy** as the reverse proxy in front of `web` and `soketi`. Automatic Let's
  Encrypt TLS with a handful of lines of config — no certbot renewal cron to babysit,
  which matters for a solo operator.
- **Cloudflare** for DNS (free tier). Proxied (orange-cloud) for the main app domain
  for free DDoS/WAF coverage. If WebSocket proxying through Cloudflare causes issues
  with Soketi, fall back to DNS-only (grey-cloud) for that specific hostname —
  Cloudflare's free tier does support WS, but it's the first thing to rule out if
  live-progress connections misbehave in production specifically.

## 6. Object storage & email

- **Backblaze B2** — S3-compatible, so it's a drop-in for the `AWS_*` env vars
  already scaffolded in `.env.example` (just point `AWS_ENDPOINT` at B2 and set
  `AWS_USE_PATH_STYLE_ENDPOINT=true`). ~$6/TB/mo, first 10GB free. Used for DB
  backups and any future exported artifacts (PDF reports, per `monetization.md` §5's
  phase-2 roadmap).
- **Resend** for transactional email (Fortify verification/reset, per
  `architecture.md` §2). Free tier covers 3,000 emails/mo — comfortably above what
  auth emails alone will generate at launch scale. Revisit only if volume grows past
  that, not preemptively.

## 7. Backups & disaster recovery

- **Nightly `mysqldump`**, compressed, pushed to Backblaze B2, retained 14 days
  (delete anything older via a B2 lifecycle rule, not manual cleanup).
- **Weekly Hetzner volume snapshot** as a second line of defense — cheap insurance
  (~20% of volume cost) against a bad deploy or host-level failure that a logical
  dump wouldn't catch cleanly.
- **Restore runbook**: `docker compose stop web horizon crawler-listen` → restore the
  latest `mysqldump` into the `mysql` container → `docker compose up -d` → confirm
  `/up` and spot-check a known audit record before resuming traffic. Test this restore
  path at least once before launch — an untested backup is not a backup.

## 8. CI/CD

Extends the existing `.github/workflows/tests.yml` and `lint.yml` (currently
test/lint-only, no deploy step). New workflow, triggered on push to `main` **after**
tests and lint pass:

1. Build the `web` and `crawler` Docker images.
2. Push both to **GHCR** (GitHub Container Registry — free, no extra account/billing
   relationship to set up).
3. SSH into the VPS (`appleboy/ssh-action`, deploy key scoped to this host only) and
   run: `docker compose pull`, `php artisan migrate --force` inside the `web`
   container, then `docker compose up -d`.
4. Post-deploy health check: curl the Laravel `/up` route and the crawler-api's
   health endpoint. Fail the workflow (and leave the previous containers as the last
   known-good state) if either doesn't return healthy.

No blue/green or zero-downtime tooling at this scale — a few seconds of downtime
during `docker compose up -d` is an acceptable trade for not maintaining a second
environment as a solo operator. Revisit if/when downtime actually costs something
measurable.

## 9. Debugging & observability

- **Sentry** (free tier, 5k errors/mo) in both Laravel and the Node crawler service —
  one place to see exceptions across the polyglot stack instead of grepping two sets
  of logs after the fact.
- **Horizon's dashboard** (already part of the stack once `QUEUE_CONNECTION=redis` is
  set) for queue depth, failed jobs, and throughput — no extra tooling needed for
  queue introspection.
- **UptimeRobot** (free) polling `/up` and a WS handshake against Soketi.
- **Healthchecks.io** (free) as a dead-man's-switch: `horizon` and `crawler:listen`
  ping it on a schedule; a missed ping alerts on the exact "silently died" failure
  mode called out in §1, which uptime monitoring alone won't catch since the rest of
  the app keeps responding normally while it's broken.
- Day-to-day log tailing stays `ssh` + `docker compose logs -f <service>` at this
  scale. A log aggregator (Loki, hosted APM) is a Stage 2 tool, not needed for one
  operator on one box.

## 10. Cost estimate

| Item | Cost |
|---|---|
| Hetzner CPX31 | ~$18–25/mo |
| Backblaze B2 (backups) | ~$1–2/mo |
| Domain (amortized) | ~$1/mo |
| Cloudflare / Sentry / UptimeRobot / Healthchecks.io / Resend / GHCR | $0 (free tiers) |
| **Total** | **~$20–28/mo** |

This lands under the $40–60/mo target and under the `~$40/mo` baseline already assumed
in `monetization.md` §6's break-even math, leaving buffer before those numbers need
revisiting.

## 11. Staged growth path

Mirrors the staging pattern already used in `monetization.md` §2 (queue priority
"defined but not yet wired ... revisit when contention becomes a problem") — don't
build ahead of demand, but know the next trigger and move.

- **Stage 1 — triggered by paying customers / queue contention** (the guardrails
  already flagged in `monetization.md` §2, e.g. free-tier wait times regularly
  exceeding a few minutes): move `crawler-worker` to its own VPS so a runaway or
  heavy crawl can't starve the web app's resources, and wire the already-defined
  BullMQ `queue_priority` values through `CreateAudit`/the crawler-api's job creation.
- **Stage 2 — triggered by real scale** (sustained concurrency beyond what one
  crawler box can hold, or MySQL/Redis becoming a bottleneck): managed MySQL and
  managed Redis (trades self-hosted control for automated failover/backups), an
  autoscaling crawler worker pool (e.g. Fly.io Machines or Fargate for bursty
  Playwright jobs specifically, keeping the rest of the stack where it is), a CDN in
  front of built Vite assets, and a proper metrics stack (Prometheus/Grafana or a
  hosted APM) once "SSH and tail logs" stops being fast enough to debug with.

## 12. Related docs

- `architecture` — user journey, auth, and state machines this deployment serves.
- `monetization` — plan model and the financial baseline (`~$40/mo` fixed costs,
  break-even subscriber counts) this proposal is sized against.
- Root `CLAUDE.md` — cross-service architecture (crawler ↔ Laravel) and the
  `crawler:listen` dependency this doc's §1 and §9 build on.
- `docker-native-engine-migration` — local dev Docker runbook; unrelated to this
  production deployment but the closest existing infra-runbook precedent for format.
