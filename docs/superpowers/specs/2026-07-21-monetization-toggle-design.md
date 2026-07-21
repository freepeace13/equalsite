# Monetization toggle (`MONETIZATION_ENABLED`) — Design

## Problem

Equalsite currently gates scan limits (site cap, page cap, crawl depth, rescan
frequency, history retention) by plan (`free` vs `pro`), enforced through
`App\Support\Plan\PlanLimits`, and offers Paddle-backed billing via
`BillingController`. The business wants to turn monetization off for now —
every user (including guests) gets unrestricted, Pro-level scans — while
being able to turn it back on later with a single env var, without touching
billing/subscription data.

## Goal

Add `MONETIZATION_ENABLED=true|false` (default `true`, i.e. today's
behavior unchanged). When `false`:

- All scan limits behave as if every user were on the Pro plan.
- The Billing settings page and any "Upgrade to Pro" UI are hidden.
- Existing Paddle subscriptions keep syncing in the background (a user with
  a live subscription can still cancel it), so nothing about billing data
  itself changes — only enforcement and UI visibility.

Out of scope: this is pre-launch, not yet deployed to production, so no
migration or backfill of existing data is needed. Queue priority
(`PlanLimits::queuePriority()`) is already unused by the BullMQ job creation
path and needs no changes here.

## Approach

Extend `App\Support\Plan\PlanLimits::for()` — the single documented seam
between `config('plans.*')` and the rest of the app (`AuditPolicy`,
`AuditCreateRequest`, `CreateAudit`, `ShowController` all already read
through it) — to ignore the plan it's given and resolve against `Plan::Pro`
whenever monetization is disabled. Every downstream enforcement point (site
cap, page cap, crawl depth, rescan frequency, history retention) needs zero
changes because they all already call `PlanLimits::for($user->plan)` and
trust its output. This also transparently covers guest/anonymous audits,
since they resolve *some* plan through the same seam.

Two alternatives were considered and rejected:

- **Flip every user's `plan` column to `pro`.** Mutates real billing data,
  isn't reversible by an env var alone, and destroys the record of who's an
  actual paying subscriber.
- **New middleware that overwrites `$request->user()->plan` per request.**
  Duplicates logic outside the documented `PlanLimits` seam and doesn't
  cover the guest audit path, which has no user object to mutate.

## Changes

### 1. Backend enforcement bypass

- `apps/web/config/plans.php`: add a top-level `'enabled' => env('MONETIZATION_ENABLED', true),`
  key, a sibling of `free`/`pro` (not nested inside either).
- `apps/web/.env.example`: add `MONETIZATION_ENABLED=true` near the
  `# Laravel cashier-paddle` block, matching the existing `PADDLE_SANDBOX`
  boolean convention.
- `apps/web/app/Support/Plan/PlanLimits.php`:
  ```php
  public static function for(Plan $plan): self
  {
      return new self(config('plans.enabled') ? $plan : Plan::Pro);
  }
  ```

### 2. Frontend consistency (unlock UI, hide upgrade prompts)

- `apps/web/app/Http/Middleware/HandleInertiaRequests.php`: share a new
  top-level prop `'monetizationEnabled' => fn () => config('plans.enabled'),`
  alongside the existing `auth` share.
- New helper `apps/web/resources/js/lib/plan.ts`:
  ```ts
  export function resolveIsPro(
    user: { plan?: string } | null | undefined,
    monetizationEnabled: boolean,
  ): boolean {
    return !monetizationEnabled || user?.plan === 'pro';
  }
  ```
- Update the two places that currently compute `isPro = auth.user?.plan === 'pro'`
  directly to use `resolveIsPro(auth.user, monetizationEnabled)` instead,
  reading `monetizationEnabled` from the new shared prop:
  - `apps/web/resources/js/components/form/audit-request-form.tsx:44`
  - `apps/web/resources/js/pages/welcome.tsx:60`
- `apps/web/resources/js/components/form/advance-settings.tsx` needs no
  change — it already takes `isPro` as a prop from its caller.

### 3. Hide the Billing settings page

- `apps/web/resources/js/layouts/settings/layout.tsx:24-27`: only include
  the "Billing" entry in `sidebarNavItems` when `monetizationEnabled` is
  true (same shared prop as above).
- New route middleware `EnsureMonetizationEnabled`, registered as the alias
  `monetization.enabled` in `apps/web/bootstrap/app.php`. Apply it to:
  - `GET settings/billing` (`BillingController::edit`)
  - `POST settings/billing/checkout` (`BillingController::checkout`)

  When the flag is off, redirect back to the dashboard with a flash message
  ("Billing is currently disabled."). Direct URL access is the only way to
  reach these once the nav link is hidden, so a friendly redirect (not a
  404) is enough.
- `DELETE settings/billing/subscription` (`BillingController::cancel`) is
  **deliberately left unguarded** — a user with a real pre-existing Paddle
  subscription must still be able to cancel it while the flag is off.
- `App\Listeners\Billing\SyncUserPlanFromSubscription` is **not** touched —
  webhook-driven `users.plan` updates keep happening regardless of the flag,
  since `PlanLimits` already ignores the stored plan while disabled and this
  keeps `users.plan` correct for whenever the flag flips back on.

### 4. Tests

- `apps/web/tests/Unit/Support/Plan/PlanLimitsTest.php`: add a case with
  `config(['plans.enabled' => false])` asserting `PlanLimits::for(Plan::Free)`
  returns Pro-tier values (site cap `null`, page cap `100`, all crawl
  depths, no rescan/history cap).
- `apps/web/tests/Unit/Actions/Audit/CreateAuditTest.php`: add a case where
  a free-plan user who'd normally trip `SiteCapExceededException` or
  `RescanTooSoonException` succeeds instead when `plans.enabled` is false.
- `apps/web/tests/Feature/Settings/BillingControllerTest.php`: add cases
  asserting `GET settings/billing` and `POST settings/billing/checkout`
  redirect (not render/process) when the flag is off, and that
  `DELETE settings/billing/subscription` still works regardless of the flag.
- No new frontend tests — no existing test harness covers the `isPro` UI
  logic to extend, and `resolveIsPro` is a two-line pure function whose
  correctness is covered behaviorally by the backend tests above.

## Non-goals

- No changes to `SiteCapExceededException`/`RescanTooSoonException` message
  copy — they simply never throw while disabled.
- No changes to `config/plans.php`'s numeric limits themselves.
- No production data migration/backfill (not yet deployed).
- No change to BullMQ queue priority behavior (already unused).
