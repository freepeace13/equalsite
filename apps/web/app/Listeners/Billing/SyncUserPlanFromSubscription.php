<?php

namespace App\Listeners\Billing;

use App\Models\User;
use App\Value\Plan;
use Illuminate\Database\Eloquent\Model;
use Laravel\Paddle\Events\SubscriptionCanceled;
use Laravel\Paddle\Events\SubscriptionCreated;
use Laravel\Paddle\Events\SubscriptionUpdated;
use Laravel\Paddle\Subscription;

/**
 * Keeps users.plan in sync with Cashier's own subscription state, driven by
 * Cashier's built-in webhook-triggered events rather than overriding
 * WebhookController. Plan is always derived from $subscription->valid() —
 * the same predicate Cashier itself uses for subscribed() — rather than
 * pattern-matching webhook status strings, so this stays correct even if
 * Cashier::$deactivatePastDue is ever toggled. Deriving plan purely from
 * current subscription state (never incrementally) makes replayed webhook
 * deliveries naturally idempotent.
 */
class SyncUserPlanFromSubscription
{
    public function handleCreated(SubscriptionCreated $event): void
    {
        $this->sync($event->billable, $event->subscription);
    }

    public function handleUpdated(SubscriptionUpdated $event): void
    {
        $this->sync($event->subscription->billable, $event->subscription);
    }

    public function handleCanceled(SubscriptionCanceled $event): void
    {
        $this->sync($event->subscription->billable, $event->subscription);
    }

    protected function sync(Model $billable, Subscription $subscription): void
    {
        if (! $billable instanceof User) {
            return;
        }

        $billable->forceFill([
            'plan' => $subscription->valid() ? Plan::Pro : Plan::Free,
        ])->save();
    }
}
