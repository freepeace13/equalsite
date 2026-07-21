# Monetization Toggle (`MONETIZATION_ENABLED`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `MONETIZATION_ENABLED=true|false` env flag (default `true`) that, when `false`, makes every scan behave as if the user were on the Pro plan and hides the Billing settings UI — reversible by flipping the env var back, with no data migration.

**Architecture:** Extend `App\Support\Plan\PlanLimits::for()` — the single documented seam between `config('plans.*')` and every enforcement call site (`CreateAudit`, `AuditPolicy`, `ShowController`) — to resolve as `Plan::Pro` whenever `config('plans.enabled')` is false, regardless of the plan passed in. Share the same flag to the frontend via Inertia so `isPro`-gated UI (crawl-depth lock, upgrade copy) and the Billing settings page stay consistent with the relaxed backend behavior.

**Tech Stack:** Laravel 13, Pest 4, Inertia.js 3 (React 19/TypeScript), Laravel Cashier Paddle.

## Global Constraints

- Spec source: `docs/superpowers/specs/2026-07-21-monetization-toggle-design.md`.
- Default `MONETIZATION_ENABLED=true` — today's behavior must be unchanged when the var is unset.
- `App\Support\Plan\PlanLimits::for()` is the only place scan-limit enforcement logic changes; no call site (`CreateAudit`, `AuditPolicy`, `AuditCreateRequest`, `ShowController`) is touched.
- `App\Listeners\Billing\SyncUserPlanFromSubscription` is not touched — Paddle webhook → `users.plan` sync keeps running regardless of the flag.
- `DELETE settings/billing/subscription` (`BillingController::cancel`) stays reachable regardless of the flag — existing subscribers must always be able to cancel.
- Not yet deployed to production — no data backfill/migration needed.
- Run `vendor/bin/pint --dirty --format agent` on any modified PHP files before committing (per `apps/web/CLAUDE.md`).
- PHP: explicit return types and param type hints on every method touched; curly braces on all control structures.

---

### Task 1: `plans.enabled` config flag + `PlanLimits::for()` bypass

**Files:**
- Modify: `apps/web/config/plans.php`
- Modify: `apps/web/.env.example`
- Modify: `apps/web/app/Support/Plan/PlanLimits.php:18-21`
- Test: `apps/web/tests/Unit/Support/Plan/PlanLimitsTest.php`

**Interfaces:**
- Produces: `config('plans.enabled')` (bool, default `true`) — read by `PlanLimits::for()` in this task, and by the Inertia-shared prop in Task 3.
- Produces: `PlanLimits::for(Plan $plan): self` keeps its existing signature; only its internal resolution changes. Every later task (2, and indirectly 3-6) relies on this already being correct.

- [ ] **Step 1: Write the failing test**

Add to the end of `apps/web/tests/Unit/Support/Plan/PlanLimitsTest.php`:

```php
test('when monetization is disabled, every plan resolves with pro-tier limits', function () {
    config(['plans.enabled' => false]);

    expect(PlanLimits::for(Plan::Free)->siteCap())->toBeNull()
        ->and(PlanLimits::for(Plan::Free)->pageCap())->toBe(100)
        ->and(PlanLimits::for(Plan::Free)->allowedCrawlDepths())->toBe([
            CrawlDepth::Shallow,
            CrawlDepth::Standard,
            CrawlDepth::Deep,
        ])
        ->and(PlanLimits::for(Plan::Free)->rescanFrequencyMinutes())->toBeNull()
        ->and(PlanLimits::for(Plan::Free)->historyRetention())->toBeNull()
        ->and(PlanLimits::for(Plan::Free)->queuePriority())->toBe(1);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run (from `apps/web/`): `php artisan test --compact --filter="every plan resolves with pro-tier limits"`

Expected: FAIL — `siteCap()` returns `1` (Free's actual value), not `null`, because `PlanLimits::for()` doesn't consult `plans.enabled` yet.

- [ ] **Step 3: Add the `enabled` key to `config/plans.php`**

In `apps/web/config/plans.php`, add a new top-level key as a sibling of `'free'` and `'pro'` (place it first, right after the opening `return [`):

```php
return [

    /*
    |--------------------------------------------------------------------------
    | Plan limits
    |--------------------------------------------------------------------------
    |
    | Centralizes every numeric/behavioral limit driven by a user's plan, keyed
    | by App\Value\Plan::value. This is a deploy-time constant, not something
    | edited at runtime — read exclusively through App\Support\Plan\PlanLimits,
    | never via config('plans.*') directly from other classes. The one env-backed
    | exception is free.rescan_frequency_minutes, exposed via RESCAN_FREQUENCY_MINUTES
    | for experimenting with the window without a code change.
    |
    | 'queue_priority' is populated for a future BullMQ-priority pass but is not
    | read by anything yet in this pass.
    |
    | 'enabled' gates all of the above: when false, PlanLimits::for() resolves
    | every plan as Pro regardless of what's passed in, so every scan runs
    | unrestricted. Toggle via MONETIZATION_ENABLED; default true (today's
    | behavior unchanged).
    |
    */

    'enabled' => env('MONETIZATION_ENABLED', true),

    'free' => [
        'site_cap' => 1,
        'page_cap' => 50,
        'crawl_depths' => [
            CrawlDepth::Shallow->value,
        ],
        'rescan_frequency_minutes' => env('RESCAN_FREQUENCY_MINUTES', 60),
        'history_retention' => 5,
        'queue_priority' => 10,
    ],

    'pro' => [
        'site_cap' => null, // null = unlimited
        'page_cap' => 100,
        'crawl_depths' => [
            CrawlDepth::Shallow->value,
            CrawlDepth::Standard->value,
            CrawlDepth::Deep->value,
        ],
        'rescan_frequency_minutes' => null, // null = no cap
        'history_retention' => null, // null = unlimited
        'queue_priority' => 1,
    ],

];
```

- [ ] **Step 4: Add the env var to `.env.example`**

In `apps/web/.env.example`, add a new line directly above the `# Laravel cashier-paddle` block (currently at line 81):

```
# Master switch for plan-based scan limits and the Billing settings UI. When
# false, every scan runs with Pro-tier limits and billing UI is hidden.
MONETIZATION_ENABLED=true

# Laravel cashier-paddle
```

- [ ] **Step 5: Update `PlanLimits::for()`**

In `apps/web/app/Support/Plan/PlanLimits.php`, replace:

```php
    public static function for(Plan $plan): self
    {
        return new self($plan);
    }
```

with:

```php
    public static function for(Plan $plan): self
    {
        return new self(config('plans.enabled') ? $plan : Plan::Pro);
    }
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `php artisan test --compact --filter=PlanLimitsTest`

Expected: PASS — all existing tests in the file still pass (default `plans.enabled` is `true`), and the new test passes.

- [ ] **Step 7: Format and commit**

```bash
cd apps/web
vendor/bin/pint --dirty --format agent
git add config/plans.php .env.example app/Support/Plan/PlanLimits.php tests/Unit/Support/Plan/PlanLimitsTest.php
git commit -m "feat: add MONETIZATION_ENABLED flag to bypass plan limits"
```

---

### Task 2: `CreateAudit` integration coverage for the disabled flag

**Files:**
- Test: `apps/web/tests/Unit/Actions/Audit/CreateAuditTest.php`

**Interfaces:**
- Consumes: `PlanLimits::for()` from Task 1 (already resolves as Pro when `config('plans.enabled')` is `false`); `CreateAudit::create(User $user, string $url, array $options = [])` (existing signature, unchanged).

This task adds regression coverage proving the flag reaches all the way through `CreateAudit`'s enforcement (site cap + rescan frequency) without any production code change — `CreateAudit` already calls `PlanLimits::for($user->plan)`, so Task 1's change is sufficient. This is not a red/green TDD cycle since the behavior already exists after Task 1; the test is written and should pass immediately.

- [ ] **Step 1: Write the test**

Add to the end of `apps/web/tests/Unit/Actions/Audit/CreateAuditTest.php`:

```php
test('a free account bypasses the site cap and re-scan frequency when monetization is disabled', function () {
    config(['plans.enabled' => false]);

    $user = User::factory()->create();
    $lastAudit = makeUserAudit($user, 'first-site', 'acme.com', Status::Completed);
    $lastAudit->forceFill(['created_at' => now()->subMinutes(2)])->save(); // inside the free-plan rescan window

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('create')->once()->andReturn(['id' => 'second-site']);

    $action = new CreateAudit($spider);
    $audit = $action->create($user, 'https://example.org'); // a genuinely new site, would exceed the free site cap

    expect($audit->crawler_id)->toBe('second-site');
});
```

- [ ] **Step 2: Run the test to verify it passes**

Run (from `apps/web/`): `php artisan test --compact --filter="bypasses the site cap and re-scan frequency"`

Expected: PASS. If it fails, Task 1's `PlanLimits::for()` change is incomplete — stop and re-check Task 1 before continuing.

- [ ] **Step 3: Run the full file to check for regressions**

Run: `php artisan test --compact --filter=CreateAuditTest`

Expected: PASS (all tests, old and new).

- [ ] **Step 4: Commit**

```bash
cd apps/web
git add tests/Unit/Actions/Audit/CreateAuditTest.php
git commit -m "test: cover CreateAudit bypassing site cap/rescan limits when monetization is disabled"
```

---

### Task 3: Share `monetizationEnabled` to the frontend via Inertia

**Files:**
- Modify: `apps/web/app/Http/Middleware/HandleInertiaRequests.php:36-46`
- Modify: `apps/web/resources/js/types/global.d.ts:5-11`

**Interfaces:**
- Produces: Inertia shared prop `monetizationEnabled: boolean`, readable in any React page/component via `usePage().props.monetizationEnabled`. Tasks 4, 5, and 6 depend on this prop existing and being correctly typed.

- [ ] **Step 1: Share the prop from the backend**

In `apps/web/app/Http/Middleware/HandleInertiaRequests.php`, change:

```php
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
```

to:

```php
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'monetizationEnabled' => (bool) config('plans.enabled'),
        ];
    }
```

- [ ] **Step 2: Type the new shared prop**

In `apps/web/resources/js/types/global.d.ts`, change:

```ts
declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
```

to:

```ts
declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            monetizationEnabled: boolean;
            [key: string]: unknown;
        };
    }
}
```

- [ ] **Step 3: Format and verify**

```bash
cd apps/web
vendor/bin/pint --dirty --format agent
pnpm typecheck
```

Expected: `pnpm typecheck` exits 0 (no consumers reference the prop yet, so nothing else to break).

- [ ] **Step 4: Commit**

```bash
cd apps/web
git add app/Http/Middleware/HandleInertiaRequests.php resources/js/types/global.d.ts
git commit -m "feat: share monetizationEnabled as an Inertia global prop"
```

---

### Task 4: Gate the Billing routes behind the flag

**Files:**
- Create: `apps/web/app/Http/Middleware/EnsureMonetizationEnabled.php`
- Modify: `apps/web/bootstrap/app.php:1-29`
- Modify: `apps/web/routes/settings.php:26-30`
- Test: `apps/web/tests/Feature/Settings/BillingControllerTest.php`

**Interfaces:**
- Produces: route middleware alias `monetization.enabled`, applied to `billing.edit` and `billing.checkout` only. `billing.cancel` is left unguarded (per Global Constraints).

- [ ] **Step 1: Write the failing tests**

Add to the end of `apps/web/tests/Feature/Settings/BillingControllerTest.php`:

```php
test('billing edit redirects to the dashboard when monetization is disabled', function () {
    config(['plans.enabled' => false]);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('billing.edit'))
        ->assertRedirect(route('dashboard'));
});

test('billing checkout returns a json error when monetization is disabled', function () {
    config(['plans.enabled' => false]);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('billing.checkout'), ['interval' => 'monthly'])
        ->assertForbidden();
});

test('cancel still works when monetization is disabled', function () {
    $user = User::factory()->pro()->create();

    $subscription = Subscription::create([
        'billable_id' => $user->id,
        'billable_type' => User::class,
        'type' => 'default',
        'paddle_id' => 'sub_disabled_cancel_test',
        'status' => Subscription::STATUS_ACTIVE,
    ]);

    Http::fake([
        Cashier::apiUrl().'/subscriptions/*/cancel' => Http::response([
            'data' => [
                'status' => Subscription::STATUS_ACTIVE,
                'scheduled_change' => ['effective_at' => now()->addDays(30)->toIso8601String()],
            ],
        ]),
    ]);

    config(['plans.enabled' => false]);

    $this->actingAs($user)
        ->from(route('billing.edit'))
        ->delete(route('billing.cancel'))
        ->assertRedirect(route('billing.edit'));

    expect($subscription->refresh()->ends_at?->isFuture())->toBeTrue();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run (from `apps/web/`): `php artisan test --compact --filter="monetization is disabled"`

Expected: FAIL — `billing edit` renders instead of redirecting (route has no gate yet), `billing checkout` succeeds instead of 403.

- [ ] **Step 3: Create the middleware**

Create `apps/web/app/Http/Middleware/EnsureMonetizationEnabled.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureMonetizationEnabled
{
    /**
     * Blocks the billing routes while monetization is disabled — every scan
     * already runs unrestricted via PlanLimits, so subscribing or viewing
     * the billing page would be misleading. billing.cancel is intentionally
     * not routed through this middleware, so an existing subscriber can
     * always cancel regardless of the flag.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (config('plans.enabled')) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Billing is currently disabled.'], 403);
        }

        Inertia::flash('toast', ['type' => 'error', 'message' => 'Billing is currently disabled.']);

        return redirect()->route('dashboard');
    }
}
```

- [ ] **Step 4: Register the middleware alias**

In `apps/web/bootstrap/app.php`, add the import:

```php
use App\Http\Middleware\EnsureMonetizationEnabled;
```

and change:

```php
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
```

to:

```php
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'monetization.enabled' => EnsureMonetizationEnabled::class,
        ]);
    })
```

- [ ] **Step 5: Apply the middleware to the two routes**

In `apps/web/routes/settings.php`, change:

```php
    Route::get('settings/billing', [BillingController::class, 'edit'])->name('billing.edit');

    Route::post('settings/billing/checkout', [BillingController::class, 'checkout'])
        ->middleware('throttle:6,1')
        ->name('billing.checkout');
```

to:

```php
    Route::get('settings/billing', [BillingController::class, 'edit'])
        ->middleware('monetization.enabled')
        ->name('billing.edit');

    Route::post('settings/billing/checkout', [BillingController::class, 'checkout'])
        ->middleware(['throttle:6,1', 'monetization.enabled'])
        ->name('billing.checkout');
```

`billing.cancel` (lines 32-33) is left exactly as-is.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `php artisan test --compact --filter=BillingControllerTest`

Expected: PASS — all pre-existing tests plus the three new ones.

- [ ] **Step 7: Format and commit**

```bash
cd apps/web
vendor/bin/pint --dirty --format agent
git add app/Http/Middleware/EnsureMonetizationEnabled.php bootstrap/app.php routes/settings.php tests/Feature/Settings/BillingControllerTest.php
git commit -m "feat: gate billing edit/checkout routes behind MONETIZATION_ENABLED"
```

---

### Task 5: Frontend `resolveIsPro` helper wired into the audit forms

**Files:**
- Create: `apps/web/resources/js/lib/plan.ts`
- Modify: `apps/web/resources/js/components/form/audit-request-form.tsx:43-44`
- Modify: `apps/web/resources/js/pages/welcome.tsx:59-60`

**Interfaces:**
- Consumes: `monetizationEnabled` from the Inertia shared props (Task 3), `auth.user` (existing shared prop, `{ plan?: string } | null`).
- Produces: `resolveIsPro(user, monetizationEnabled): boolean`, used by both files below and by any future caller needing plan-gated UI logic.

- [ ] **Step 1: Create the helper**

Create `apps/web/resources/js/lib/plan.ts`:

```ts
/**
 * Whether the current visitor should see Pro-tier UI (unlocked crawl depth,
 * no upgrade prompts). True either because they're actually on the Pro
 * plan, or because monetization is globally disabled and every scan runs
 * unrestricted regardless of the stored plan — see PlanLimits::for().
 */
export function resolveIsPro(
    user: { plan?: string } | null | undefined,
    monetizationEnabled: boolean,
): boolean {
    return !monetizationEnabled || user?.plan === 'pro';
}
```

- [ ] **Step 2: Wire it into `audit-request-form.tsx`**

In `apps/web/resources/js/components/form/audit-request-form.tsx`, change:

```ts
import { useForm, usePage } from '@inertiajs/react';
```

to:

```ts
import { useForm, usePage } from '@inertiajs/react';
import { resolveIsPro } from '@/lib/plan';
```

and change (lines 43-44):

```ts
    const { auth } = usePage().props;
    const isPro = auth.user?.plan === 'pro';
```

to:

```ts
    const { auth, monetizationEnabled } = usePage().props;
    const isPro = resolveIsPro(auth.user, monetizationEnabled);
```

- [ ] **Step 3: Wire it into `welcome.tsx`**

In `apps/web/resources/js/pages/welcome.tsx`, change:

```ts
import { Head, useForm, usePage } from '@inertiajs/react';
import { AdvancedSettings } from '@/components/form/advance-settings';
```

to:

```ts
import { Head, useForm, usePage } from '@inertiajs/react';
import { AdvancedSettings } from '@/components/form/advance-settings';
import { resolveIsPro } from '@/lib/plan';
```

and change (lines 59-60):

```ts
    const { auth } = usePage().props;
    const isPro = auth.user?.plan === 'pro';
```

to:

```ts
    const { auth, monetizationEnabled } = usePage().props;
    const isPro = resolveIsPro(auth.user, monetizationEnabled);
```

- [ ] **Step 4: Typecheck and lint**

```bash
cd apps/web
pnpm typecheck
pnpm lintcheck
```

Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
cd apps/web
git add resources/js/lib/plan.ts resources/js/components/form/audit-request-form.tsx resources/js/pages/welcome.tsx
git commit -m "feat: unlock crawl-depth UI when monetization is disabled"
```

---

### Task 6: Hide the Billing link in Settings nav when disabled

**Files:**
- Modify: `apps/web/resources/js/layouts/settings/layout.tsx`

**Interfaces:**
- Consumes: `monetizationEnabled` from Inertia shared props (Task 3).

- [ ] **Step 1: Read the shared prop and filter the nav array**

In `apps/web/resources/js/layouts/settings/layout.tsx`, change the imports:

```ts
import { Button, Heading, Separator } from '@equalsite/ui';
import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editBilling } from '@/routes/billing';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: null,
    },
    {
        title: 'Security',
        href: editSecurity(),
        icon: null,
    },
    {
        title: 'Billing',
        href: editBilling(),
        icon: null,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
```

to:

```ts
import { Button, Heading, Separator } from '@equalsite/ui';
import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editBilling } from '@/routes/billing';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

function buildSidebarNavItems(monetizationEnabled: boolean): NavItem[] {
    return [
        {
            title: 'Profile',
            href: edit(),
            icon: null,
        },
        {
            title: 'Security',
            href: editSecurity(),
            icon: null,
        },
        ...(monetizationEnabled
            ? [
                  {
                      title: 'Billing',
                      href: editBilling(),
                      icon: null,
                  },
              ]
            : []),
        {
            title: 'Appearance',
            href: editAppearance(),
            icon: null,
        },
    ];
}

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { monetizationEnabled } = usePage().props;
    const sidebarNavItems = buildSidebarNavItems(monetizationEnabled);
```

The rest of the component (the `sidebarNavItems.map(...)` render below) is unchanged — it already reads `sidebarNavItems` from the enclosing scope, which is now a local variable instead of a module-level constant.

- [ ] **Step 2: Typecheck and lint**

```bash
cd apps/web
pnpm typecheck
pnpm lintcheck
```

Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
cd apps/web
git add resources/js/layouts/settings/layout.tsx
git commit -m "feat: hide the Billing settings nav link when monetization is disabled"
```

---

## Manual Verification (after all tasks)

1. `cd apps/web && composer test` — full Pest suite passes.
2. `cd apps/web && pnpm typecheck && pnpm lintcheck` — clean.
3. With `MONETIZATION_ENABLED` unset (or `true`) in `.env`, confirm via the running app (ask the user to eyeball this per `apps/web/CLAUDE.md` — no automated browser verification in this repo) that: Billing nav item shows, free-plan users still see the crawl-depth lock and site-cap enforcement.
4. Set `MONETIZATION_ENABLED=false` in `.env`, restart `composer dev`, and confirm: Billing nav item is gone, `/settings/billing` redirects to the dashboard with a toast, a free-plan user can run deep crawls and add a second site without hitting an upgrade prompt.
