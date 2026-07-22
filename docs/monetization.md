# Equalsite — monetization strategy

This doc covers how Equalsite generates revenue to sustain itself. For product behavior see
`architecture`, for brand/UI see `style-guide`.

---

## 1. Model: priority-queue + access-scope freemium

- **Free** — capped pages per audit, single site per account, standard queue, limited history
  retention, re-scan frequency capped, crawl depth locked to shallow.
- **Pro (~$9–15/mo)** — higher page cap, multi-site, priority queue (planned — see §2), unlimited
  scans, full history, full crawl depth control.

### Plan limits (`config/plans.php`, read only through `App\Support\Plan\PlanLimits`)

| Limit | Free | Pro |
| :---- | :---- | :---- |
| Sites per account | 1 | unlimited (`null`) |
| Pages per audit | 50 | 100 |
| Crawl depth | shallow only (`CrawlDepth::Shallow`, depth 1) | shallow / standard (3) / deep (5) |
| Re-scan frequency | every `RESCAN_FREQUENCY_MINUTES` (env, default **60 minutes**) per site | no cap (still 1 in-flight per account) |
| Audit history retention | last 5 audits per site | unlimited (`null`) |
| Queue priority | `10` (config value only — not wired yet, see §2) | `1` (same) |

`config/plans.php` is a deploy-time constant, not runtime-editable — the one exception is
`free.rescan_frequency_minutes`, exposed via `RESCAN_FREQUENCY_MINUTES` for tuning the window without a
code change.

The re-scan-frequency cap does double duty: it protects the standard queue from being hammered
(complementing queue-priority monetization rather than duplicating it) and creates natural urgency on
its own — no manufactured scare messaging needed (see `style-guide` §1 on why lawsuit/legal-risk framing
was explicitly rejected as an urgency lever).

## 2. Implementation

Access-scope limits are enforced at audit-creation time in `Actions\Audit\CreateAudit`, reading
`$user->plan` through `PlanLimits::for()`:

- **Site cap** — `assertSiteCapAllowed()` throws `SiteCapExceededException` if a free account's
  distinct-domain count would exceed 1. Re-scanning an already-owned domain never counts against the
  cap.
- **Page cap / crawl depth** — `PlanLimits::pageCap()` / `clampCrawlDepth()` clamp the crawl parameters
  server-side regardless of what the (locked-for-free) advanced settings UI requests.
- **Re-scan frequency** — `assertRescanAllowed()` throws `RescanTooSoonException` (with the next
  available timestamp) if within the configured window for that domain. A second *concurrent* scan of
  the same domain (`AuditInProgressException`) is blocked regardless of plan.
- **History retention** — `Sites\ShowController` applies `PlanLimits::historyRetention()` as a query
  limit on the Site page's history list, not a deletion — old audits aren't destroyed, just not shown
  past the retention window on free plans.

**Queue priority is defined but not yet wired up.** `config/plans.php`'s `queue_priority` values exist
for a future BullMQ-priority pass, but nothing in `Actions\Audit\CreateAudit` or the crawler-api's job
creation currently reads them — every job is enqueued at the same priority today. This is a known gap,
not an oversight to "fix" incidentally; wire it through `SpiderOptions`/the crawler-api's BullMQ
`add()` call when queue contention actually becomes a problem worth solving.

Guardrails, still relevant once queue priority is wired up:

- Free-tier starvation trigger (revisit if free-tier wait times regularly exceed a few minutes).
- Rate-limit to 1 in-flight audit per account (currently enforced per-domain via
  `AuditInProgressException`, not yet per-account across all domains).
- Progress page should explain queue position honestly once priority exists to explain.

## 3. The `MONETIZATION_ENABLED` toggle

`MONETIZATION_ENABLED` (env, default `true`) is a single-flag kill switch for all plan enforcement —
added so the business can run without any gating pre-launch while keeping the ability to turn limits
back on without touching billing data. When `false`:

- `PlanLimits::for()` ignores the plan it's given and resolves every user as `Plan::Pro` — every scan
  runs unrestricted (site cap, page cap, crawl depth, re-scan frequency, history retention all become
  no-ops). This is the single seam every enforcement point already goes through, so no other code
  needed to change.
- The frontend reads a shared Inertia prop `monetizationEnabled` (`HandleInertiaRequests`) and derives
  `isPro` via `lib/plan.ts`'s `resolveIsPro(user, monetizationEnabled)` — used by the landing page and
  the audit-request form to unlock the crawl-depth UI regardless of the signed-in user's actual plan.
- The Billing settings nav link (`layouts/settings/layout.tsx`) is hidden, and
  `GET /settings/billing` / `POST /settings/billing/checkout` redirect back to the dashboard (via the
  `monetization.enabled` route middleware) when the flag is off.
- `DELETE /settings/billing/subscription` (cancel) is **deliberately left unguarded** — a user with a
  real pre-existing Paddle subscription can still cancel it while the flag is off.
- `Listeners\Billing\SyncUserPlanFromSubscription` keeps syncing `users.plan` from webhook events
  regardless of the flag, so `users.plan` stays correct for whenever monetization is turned back on.

This does not touch `config/plans.php`'s numeric limits, migrate any data, or change queue-priority
behavior (still unused either way).

## 4. Billing

**Paddle via Laravel Cashier** (`laravel/cashier-paddle` v2) as Merchant of Record, handling VAT/sales
tax globally. See `architecture` §2.2 for the actual checkout flow (client-side `Paddle.Checkout.open()`
overlay, JSON-returning `checkout` endpoint, webhook-driven plan sync). Webhook endpoint
`POST /paddle/webhook` is Cashier's own controller, signature-verified via `PADDLE_WEBHOOK_SECRET`.
`.env.example` ships `PADDLE_SANDBOX=false` as a placeholder — set to `true` and use Paddle Sandbox
credentials until the vendor account is approved for live payments.

## 5. Pricing

| Tier | Price | Included |
| :---- | :---- | :---- |
| Free | $0 | 1 site, 50 pages/audit, shallow crawl only, standard queue, last 5 audits/site |
| Pro | ~$9–15/mo | Multiple sites, 100 pages/audit, full crawl depth, priority queue (planned), unlimited scans, full history |

PDF export, scheduled re-scans/regression alerts, and agency/white-label reporting remain phase-2+/
phase-3 upsells — not built speculatively ahead of demand.

## 6. Financial model

- Fixed costs: ~$40/mo (Vultr, domain, email/misc).
- Net revenue per subscriber at $12/mo: ≈ $10.90/mo after Paddle fees.
- Break-even: 4 subscribers. $100/mo profit: 13. $300/mo profit: 32. $500/mo profit: 50.
- At 1% conversion, ~400 free scans/month reaches breakeven.
- Churn caveat: 5–10%/month is a realistic micro-SaaS range — plan for ongoing acquisition, not a
  one-time subscriber count.

## 7. Known unknowns / what to instrument

- Free-scan traffic volume, real conversion rate, real churn rate.
- **Free-tier limit tightness** — whether the single-site/60-minute-recheck/5-history combination is
  the right pressure point, or too restrictive/lax, is itself unmeasured. Instrument site-cap hit rate
  and re-scan-limit hit rate alongside the existing analytics (scans run, signups, upgrades, churn) so
  this can be tuned post-launch rather than guessed at now.

## 8. What's shipped vs. what's left

Shipped: `plan` flag on user accounts, all four access-scope checks (site cap, page cap, crawl-depth
clamp, re-scan frequency, history retention), Paddle checkout/webhook/cancel integration,
`MONETIZATION_ENABLED` kill switch, analytics-relevant events not yet instrumented.

Not yet built:

1. BullMQ job `priority` field actually driving queue order (values are defined in config, unused in
   the enqueue path — see §2).
2. Analytics instrumentation (scans run, signups, upgrades, churn, site-cap/re-scan-limit hit rates).
3. PDF/exportable reports, scheduled re-scans + regression alerts (phase 2).
4. Agency tier, white-label reports, API access, VPAT/ACR export (phase 3, only if phase 2 shows
   demand).

## 9. Related docs

- `architecture` §2.2 — the actual checkout/webhook flow and data model.
- `style-guide` — brand identity, UX design principles, and the rule against lawsuit/legal-risk framing
  as an urgency mechanism.
