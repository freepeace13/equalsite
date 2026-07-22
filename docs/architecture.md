# Equalsite — system architecture & behavior

This doc covers how Equalsite behaves — page flow, state machines, data model, and engineering
decisions. For brand, color, typography, and component visuals, see `style-guide`. Every page and
component described below is a shipped React/Inertia page or `@equalsite/ui` component — there are no
separate static reference mockups anymore; the app itself is the reference.

---

## 1. Product framing

Equalsite is a WCAG 2.2 AA web accessibility diagnostic. Core flow:

audit request form → login/register modal → crawler (queued → processing →
complete/cancelled/failed) → audit result

Every audit belongs to an authenticated account — there is no anonymous/guest path. Free and Pro are
both real accounts; the difference is plan limits (see `monetization` doc) and (eventually) queue
priority, not whether sign-in is required.

## 2. User accounts & authentication

Auth uses **Laravel Fortify** (registration, password reset, email verification, 2FA) — not a custom
passwordless flow. A dashboard, per-site history, and billing all need real session security, which a
magic-link-only flow doesn't cover well once money and account-scoped data are involved.

Sequence:

1. **Audit request form submit** (`resources/js/pages/welcome.tsx`). Submitting with no session saves
   the pending form values (`lib/pending-audit.ts`) and opens `AuthModal` instead of hitting the
   server.
2. **Login/register modal** (`components/auth-modal.tsx`) — a single tabbed Login/Register modal, not
   two separate pages. There is no "skip, continue as guest" option.
3. On successful auth, the browser resubmits the saved audit request. `Audit\StoreController` creates
   the audit via `Actions\Audit\CreateAudit`, associates it with `user_id` (required, not nullable —
   see §6), and redirects to `audit.progress` — no intermediate lobby stop on first run.
4. From here on, the account's audits are always reachable via **Sites** (list) and the **Site page**
   (per-domain view) — see §3. There's no separate "logged in vs. guest" branching anywhere downstream.

`/login` and `/register` also exist as standalone routes (`pages/auth/login.tsx`,
`pages/auth/register.tsx`) rendering the same `AuthModal`, for direct navigation/deep-linking rather
than the submit-triggered overlay.

### 2.2 Billing & checkout

Billing runs on **Laravel Cashier Paddle** (`laravel/cashier-paddle`). The subscribe action is a
**client-side Paddle.js overlay**, not a page redirect:

1. `GET /settings/billing` (`Settings\BillingController::edit`) renders the current plan, active
   subscription (status, grace period, next payment), and the monthly/yearly price previews resolved
   by `Support\Billing\ResolvePlanPrices`.
2. Clicking "Subscribe" calls `POST /settings/billing/checkout` (`BillingController::checkout`), which
   returns JSON — `{ customerId, priceId }` — rather than an Inertia response, because the next step is
   a client-side JS widget (`window.Paddle.Checkout.open(...)`), not a page Paddle redirects to/from.
   The client only ever sends an `interval` ('monthly'/'yearly') enum; the server resolves the actual
   Paddle price ID, so a tampered request can't check out against an arbitrary price.
3. Paddle's webhook (`POST /paddle/webhook`, Cashier's own controller) fires `SubscriptionCreated` /
   `SubscriptionUpdated` / `SubscriptionCanceled` events. `Listeners\Billing\SyncUserPlanFromSubscription`
   derives `users.plan` from `$subscription->valid()` (the same predicate Cashier's own `subscribed()`
   uses) — never incrementally — so replayed webhook deliveries are naturally idempotent.
4. `DELETE /settings/billing/subscription` (`BillingController::cancel`) is a grace-period cancel
   (Cashier's default) — `users.plan` only flips back to free once the `subscription.canceled` webhook
   actually lands, not synchronously on the cancel request.

The Billing settings nav link and the `/settings/billing*` routes are hidden/redirected when
`MONETIZATION_ENABLED=false` — see `monetization` §4 for the full toggle behavior.

## 3. Pages

### 3.1 Dashboard (`pages/dashboard.tsx`, `DashboardController`)

Portfolio-level view across all of an account's sites. Four metrics, deliberately minimal rather than
a wall of charts:

1. **Sites tracked / audits run** — also doubles as plan-usage display (ties directly to the free-tier
   site cap, see `monetization`).
2. **Overall score trend** — one line chart, aggregate across all sites and all completed audits.
3. **Open critical issues** — count aggregated across sites' *latest completed* audit per domain, with
   the oldest open issue's age shown alongside it (e.g. "oldest open 12 days") — see §5 for how this
   age is actually computed.
4. **Quick wins available** — count of critical+serious violations, aggregated the same way.

Below the metrics, a "sites preview" strip (top 6 domains, most recent first) links out to the full
Sites list. Nothing else at launch — no industry benchmarking, no issue-category breakdowns.

### 3.2 Sites list (`pages/sites/index.tsx`, route `sites.index` → `/sites`)

Flat list, **grouped by domain** (one row per site, not per audit). Columns: domain, latest status,
latest score, audit count for that domain, last run date, and a link into the **Site page**.

#### 3.2.1 Showing in-progress audits

An active audit (`queued`/`processing`) renders via `LiveSiteRow`
(`components/scanning/live-site-row.tsx`) **inline in its row**, not via a separate banner:

- The score column shows a live progress bar + running page count instead of a score, since the score
  isn't known yet.
- The status column shows the same `processing`/`queued` `StatusBadge` used on the progress page,
  applied at row scale.
- The row's action link reads "view progress" instead of "view site" while active.

**Why inline over a banner:** a Pro account can have several sites mid-audit simultaneously. A single
banner doesn't scale past one — it either stacks awkwardly or hides all but one active audit. Row-level
status reuses the existing badge/progress-bar patterns already established on the progress page, so
this introduces no new visual vocabulary, just applies it at list scale.

### 3.3 Site page (`pages/sites/show.tsx`, route `sites.show` → `/sites/{domain}`)

Per-domain view (`Sites\ShowController`). Composition:

- **Current-audit card** (`components/scanning/current-audit-card.tsx`) — mini state machine (see
  §4.2): status badge, queue position or progress, cancel button, "view progress" link.
- **Score trend chart** (`components/reporting/score-trend-chart.tsx`) — line chart across that
  domain's audit history only (not aggregate), respecting the plan's history-retention limit.
- **Open-issues snapshot** — stat pair (critical count, quick-wins count) for the latest completed
  audit on this domain.
- **Audit history table** — history rows for this domain, capped by `PlanLimits::historyRetention()`.
- **"Run new audit" CTA** (`components/scanning/run-new-audit.tsx`) — disabled with a `title` tooltip
  and inline caption (e.g. "next scan available in 14h", from `ShowController::rescanAvailableAt`) when
  the free-tier re-scan cap is active, rather than hidden or silently grayed out — consistent with the
  style guide's "explain what happened and what to do next" rule for constrained states.

If an account has multiple sites mid-audit simultaneously, each is tracked on its own Site page; the
Sites list is the cross-site index (with the inline live-status treatment from §3.2.1).

## 4. State machines

### 4.1 Progress page (`pages/audit/progress.tsx`)

`queued` → `processing` → `complete`/`cancelled`/`failed`, complete shown in place via a revealed report
CTA rather than a separate screen.

- "Back to Site page" is always rendered (every audit belongs to an account with a Site page to return
  to).
- Driven by the Redis Stream events documented in the top-level `CLAUDE.md` (`audit.started`,
  `audit.progress`/`audit.page.completed`, `audit.completed`, `audit.failed`), consumed by
  `php artisan crawler:listen` and broadcast over Soketi. Queue position comes from BullMQ's queue
  depth for that job.

### 4.2 Site page current-audit card

Same lifecycle-in-miniature: `queued` → `processing` → `complete`/`cancelled`/`failed`. Compact summary
(status, queue position/progress bar, one action row) — "view progress" is still the link to the full
progress-page experience. Cancelling (`DELETE /audit/{id}`, `Audit\CancelController`) jumps straight to
the `cancelled` terminal state without navigating away.

## 5. Business logic

### Fix-time estimate

Hardcoded `axe rule ID → effort tier` lookup table (quick win / structural), maintained by hand. Drives
quick-wins-first sort per `style-guide` §7.

### Issue-age tracking

There is **no persisted `first_seen_at` column** on `audit_violations` (contrary to what an earlier
revision of this doc planned). Issue age is computed on request in `DashboardController::
oldestOpenCriticalAgeDays()`: for each currently-open critical rule ID, it walks that domain's completed
audit history ascending and finds the earliest audit that already reported the same rule ID, then diffs
that audit's `created_at` against now. This is recomputed on every Dashboard/Site-page load rather than
stored — correct today, but O(history × rules) per request; worth revisiting with a real
`first_seen_at` column if history size or dashboard traffic grows enough to matter.

## 6. Data model

- `audits.user_id` — **required (not nullable)**, `cascadeOnDelete`. Every audit belongs to an account;
  this was migrated from nullable in `2026_07_16_165808_make_user_id_required_on_audits_table`, which
  also deleted the (unreachable, pre-launch) orphaned rows that predated mandatory auth.
- `audits` also has composite indexes `(user_id, status)` and `(user_id, domain, created_at)` — every
  plan-limit check in `CreateAudit` and every Sites/Site-page query is scoped by `user_id` first, and
  these keep that scan-narrowed as history grows.
- "Sites" — derived from distinct `domain` values in an account's `audits`; no separate `sites` table.
- `users` has real Fortify auth columns (password hash, remember token, 2FA secret/recovery codes) plus
  Cashier Paddle's billable columns (`paddle_id`, etc. — see `Laravel\Paddle\Billable`).
- `users.plan` — `App\Value\Plan` enum (`free`/`pro`), synced from Paddle subscription state (see §2.2),
  read exclusively through `App\Support\Plan\PlanLimits::for()` — see `monetization` for limit values
  and the `MONETIZATION_ENABLED` bypass.
- `audit_violations` — one row per unique axe rule per audit, deduplicated/merged across pages by
  `CreateAuditViolation`. No `first_seen_at` column yet (see §5).

## 7. Engineering notes

1. Independent features are isolated into separate script blocks/React components so one feature's
   failure can't silently disable unrelated ones.
2. All `localStorage` access (e.g. `lib/pending-audit.ts`) goes through small helpers that catch and
   no-op on failure.
3. The `type="url"` input fix (`type="text" inputMode="url"` + JS normalization) applies to the URL
   field on the landing page (`welcome.tsx`).

## 8. Related docs

- `style-guide` — brand identity, color/type tokens, component patterns (including the inline
  live-status row pattern), UX design principles, and the no-legal-risk-framing rule (§1).
- `monetization` — free/Pro plan limits, the `MONETIZATION_ENABLED` bypass toggle, and the Paddle
  billing model.
- Root `CLAUDE.md` — cross-service architecture (crawler ↔ Laravel), commands, and conventions.
