<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Paddle\Cashier;
use Laravel\Paddle\Customer;
use Laravel\Paddle\Subscription;

uses(RefreshDatabase::class);

/**
 * Fakes the Paddle pricing-preview API call ResolvePlanPrices makes under the
 * hood via Cashier::previewPrices(). Cashier's own HTTP calls all go through
 * Illuminate's Http facade (see Cashier::api()), so Http::fake() against
 * Cashier::apiUrl() is the standard way to stub Paddle without hitting the
 * real (sandbox) API — no dedicated Cashier test-double is needed for this.
 *
 * @param  bool  $includeYearly  set false to simulate Paddle not returning a
 *                               line item for one of the two configured prices.
 */
function fakePaddlePricePreview(bool $includeYearly = true): void
{
    $lineItems = [
        [
            'price' => [
                'id' => 'pri_monthly_test',
                'billing_cycle' => ['interval' => 'month', 'frequency' => 1],
                'unit_price' => ['amount' => '900', 'currency_code' => 'USD'],
            ],
            'formatted_totals' => ['total' => '$9.00', 'subtotal' => '$9.00', 'tax' => '$0.00'],
            'totals' => ['total' => '900', 'subtotal' => '900', 'tax' => '0'],
        ],
    ];

    if ($includeYearly) {
        $lineItems[] = [
            'price' => [
                'id' => 'pri_yearly_test',
                'billing_cycle' => ['interval' => 'year', 'frequency' => 1],
                'unit_price' => ['amount' => '9000', 'currency_code' => 'USD'],
            ],
            'formatted_totals' => ['total' => '$90.00', 'subtotal' => '$90.00', 'tax' => '$0.00'],
            'totals' => ['total' => '9000', 'subtotal' => '9000', 'tax' => '0'],
        ];
    }

    Http::fake([
        Cashier::apiUrl().'/pricing-preview' => Http::response([
            'data' => ['details' => ['line_items' => $lineItems]],
        ]),
    ]);
}

test('guests are redirected to login', function () {
    $this->get(route('billing.edit'))->assertRedirect(route('login'));
});

test('the billing page renders free-plan props with no subscription', function () {
    fakePaddlePricePreview();
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('billing.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/billing')
            ->where('plan', 'free')
            ->where('subscription', null)
            ->where('prices.monthly.id', 'pri_monthly_test')
            ->where('prices.yearly.id', 'pri_yearly_test'),
        );
});

test('the billing page renders subscription details for a pro user', function () {
    fakePaddlePricePreview();
    $user = User::factory()->pro()->create();

    Subscription::create([
        'billable_id' => $user->id,
        'billable_type' => User::class,
        'type' => 'default',
        'paddle_id' => 'sub_active_test',
        'status' => Subscription::STATUS_ACTIVE,
    ]);

    $this->actingAs($user)
        ->get(route('billing.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/billing')
            ->where('plan', 'pro')
            ->where('subscription.status', Subscription::STATUS_ACTIVE)
            ->where('subscription.onGracePeriod', false),
        );
});

test('the billing page reports onGracePeriod for a pro user whose subscription is scheduled to end', function () {
    fakePaddlePricePreview();
    $user = User::factory()->pro()->create();

    Subscription::create([
        'billable_id' => $user->id,
        'billable_type' => User::class,
        'type' => 'default',
        'paddle_id' => 'sub_grace_test',
        'status' => Subscription::STATUS_ACTIVE,
        'ends_at' => now()->addDays(12),
    ]);

    $this->actingAs($user)
        ->get(route('billing.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('subscription.onGracePeriod', true)
            ->where('subscription.endsAt', fn ($value) => $value !== null)
            // Cancelled subscriptions have no future payment to show.
            ->where('subscription.nextPayment', null),
        );
});

test('the billing page marks which interval the subscription is currently on', function () {
    fakePaddlePricePreview();
    $user = User::factory()->pro()->create();

    $subscription = Subscription::create([
        'billable_id' => $user->id,
        'billable_type' => User::class,
        'type' => 'default',
        'paddle_id' => 'sub_yearly_test',
        'status' => Subscription::STATUS_ACTIVE,
    ]);
    $subscription->items()->create([
        'product_id' => 'pro_test',
        'price_id' => 'pri_yearly_test',
        'status' => Subscription::STATUS_ACTIVE,
        'quantity' => 1,
    ]);

    Http::fake([
        Cashier::apiUrl().'/subscriptions/*' => Http::response([
            'data' => ['next_transaction' => null],
        ]),
    ]);

    $this->actingAs($user)
        ->get(route('billing.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('subscription.interval', 'yearly'),
        );
});

test('the billing page includes the next payment amount and due date for an active subscription', function () {
    fakePaddlePricePreview();
    $user = User::factory()->pro()->create();

    $subscription = Subscription::create([
        'billable_id' => $user->id,
        'billable_type' => User::class,
        'type' => 'default',
        'paddle_id' => 'sub_next_payment_test',
        'status' => Subscription::STATUS_ACTIVE,
    ]);
    $subscription->items()->create([
        'product_id' => 'pro_test',
        'price_id' => 'pri_monthly_test',
        'status' => Subscription::STATUS_ACTIVE,
        'quantity' => 1,
    ]);

    $nextBillingDate = now()->addDays(18)->startOfSecond();

    Http::fake([
        Cashier::apiUrl().'/subscriptions/*' => Http::response([
            'data' => [
                'next_transaction' => [
                    'billing_period' => ['starts_at' => $nextBillingDate->toIso8601String()],
                    'details' => ['totals' => ['grand_total' => '900', 'currency_code' => 'USD']],
                ],
            ],
        ]),
    ]);

    $this->actingAs($user)
        ->get(route('billing.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('subscription.interval', 'monthly')
            ->where('subscription.nextPayment.currency', 'USD')
            ->where('subscription.nextPayment.date', fn ($value) => $value !== null),
        );
});

test('the billing page degrades gracefully when the Paddle API is unreachable for next-payment lookup', function () {
    fakePaddlePricePreview();
    $user = User::factory()->pro()->create();

    Subscription::create([
        'billable_id' => $user->id,
        'billable_type' => User::class,
        'type' => 'default',
        'paddle_id' => 'sub_paddle_down_test',
        'status' => Subscription::STATUS_ACTIVE,
    ]);

    Http::fake([
        Cashier::apiUrl().'/subscriptions/*' => Http::response(['error' => ['detail' => 'unavailable']], 500),
    ]);

    $this->actingAs($user)
        ->get(route('billing.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/billing')
            ->where('subscription.nextPayment', null),
        );
});

test('checkout resolves the customer and price id for a valid interval', function () {
    fakePaddlePricePreview();
    $user = User::factory()->create();

    // Pre-seed the Paddle customer so EnsurePaddleCustomer short-circuits
    // without needing to fake the separate customers API endpoint too.
    Customer::create([
        'billable_id' => $user->id,
        'billable_type' => User::class,
        'paddle_id' => 'ctm_test_123',
        'name' => $user->name,
        'email' => $user->email,
    ]);

    $this->actingAs($user)
        ->postJson(route('billing.checkout'), ['interval' => 'monthly'])
        ->assertSuccessful()
        ->assertJson([
            'customerId' => 'ctm_test_123',
            'priceId' => 'pri_monthly_test',
        ]);
});

test('checkout returns 422 for an interval value outside the allowed enum', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('billing.checkout'), ['interval' => 'weekly'])
        ->assertUnprocessable();
});

test('checkout returns 422 when Paddle has no price for the requested interval', function () {
    fakePaddlePricePreview(includeYearly: false);
    $user = User::factory()->create();

    Customer::create([
        'billable_id' => $user->id,
        'billable_type' => User::class,
        'paddle_id' => 'ctm_test_456',
        'name' => $user->name,
        'email' => $user->email,
    ]);

    $this->actingAs($user)
        ->postJson(route('billing.checkout'), ['interval' => 'yearly'])
        ->assertUnprocessable();
});

test('cancel puts the subscription on its grace period and flashes a toast, without downgrading the plan yet', function () {
    $user = User::factory()->pro()->create();

    $subscription = Subscription::create([
        'billable_id' => $user->id,
        'billable_type' => User::class,
        'type' => 'default',
        'paddle_id' => 'sub_cancel_test',
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

    $response = $this->actingAs($user)
        ->from(route('billing.edit'))
        ->delete(route('billing.cancel'));

    $response->assertRedirect(route('billing.edit'));
    $response->assertSessionHas('inertia.flash_data', fn ($flash) => $flash['toast']['type'] === 'success');

    expect($subscription->refresh()->ends_at?->isFuture())->toBeTrue();

    // cancel() is a direct Paddle API call, not a webhook — nothing flips
    // users.plan synchronously here (only the subscription.canceled webhook,
    // handled by SyncUserPlanFromSubscription, does that later).
    expect($user->fresh()->plan->value)->toBe('pro');
});
