<?php

use App\Models\User;
use App\Value\Plan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;
use Laravel\Paddle\Events\SubscriptionCanceled;
use Laravel\Paddle\Events\SubscriptionCreated;
use Laravel\Paddle\Events\SubscriptionUpdated;
use Laravel\Paddle\Subscription;

uses(RefreshDatabase::class);

/**
 * Dispatches the real Cashier events (rather than calling
 * SyncUserPlanFromSubscription's handlers directly) so these tests also
 * exercise the actual EventServiceProvider wiring, not just the listener's
 * own logic in isolation.
 */
function subscriptionFor(User $user, string $status, array $overrides = []): Subscription
{
    return Subscription::create(array_merge([
        'billable_id' => $user->id,
        'billable_type' => User::class,
        'type' => 'default',
        'paddle_id' => 'sub_'.Str::random(10),
        'status' => $status,
    ], $overrides));
}

test('a created active subscription flips the user plan to pro', function () {
    $user = User::factory()->create();
    $subscription = subscriptionFor($user, Subscription::STATUS_ACTIVE);

    Event::dispatch(new SubscriptionCreated($user, $subscription, []));

    expect($user->fresh()->plan)->toBe(Plan::Pro);
});

test('a created trialing subscription also flips the user plan to pro', function () {
    $user = User::factory()->create();
    $subscription = subscriptionFor($user, Subscription::STATUS_TRIALING);

    Event::dispatch(new SubscriptionCreated($user, $subscription, []));

    expect($user->fresh()->plan)->toBe(Plan::Pro);
});

test('an updated subscription that is no longer valid flips the user plan back to free', function () {
    $user = User::factory()->pro()->create();
    $subscription = subscriptionFor($user, Subscription::STATUS_PAUSED);

    Event::dispatch(new SubscriptionUpdated($subscription, []));

    expect($user->fresh()->plan)->toBe(Plan::Free);
});

test('an updated subscription that is still active keeps the user on pro', function () {
    $user = User::factory()->pro()->create();
    $subscription = subscriptionFor($user, Subscription::STATUS_ACTIVE);

    Event::dispatch(new SubscriptionUpdated($subscription, []));

    expect($user->fresh()->plan)->toBe(Plan::Pro);
});

test('a canceled subscription flips the user plan back to free', function () {
    $user = User::factory()->pro()->create();
    $subscription = subscriptionFor($user, Subscription::STATUS_CANCELED);

    Event::dispatch(new SubscriptionCanceled($subscription, []));

    expect($user->fresh()->plan)->toBe(Plan::Free);
});

test('replaying the same webhook event twice is idempotent', function () {
    $user = User::factory()->create();
    $subscription = subscriptionFor($user, Subscription::STATUS_ACTIVE);

    Event::dispatch(new SubscriptionCreated($user, $subscription, []));
    Event::dispatch(new SubscriptionCreated($user, $subscription, []));

    expect($user->fresh()->plan)->toBe(Plan::Pro);
});
