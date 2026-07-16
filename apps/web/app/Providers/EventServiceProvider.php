<?php

namespace App\Providers;

use App\Events\Audit\AuditProgress;
use App\Events\Audit\AuditQueued;
use App\Listeners\AuditPageSubscriber;
use App\Listeners\AuditProgressListener;
use App\Listeners\AuditQueueStateListener;
use App\Listeners\AuditStatusSubscriber;
use App\Listeners\Billing\SyncUserPlanFromSubscription;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Laravel\Paddle\Events\SubscriptionCanceled;
use Laravel\Paddle\Events\SubscriptionCreated;
use Laravel\Paddle\Events\SubscriptionUpdated;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        AuditQueued::class => [
            AuditQueueStateListener::class,
        ],

        AuditProgress::class => [
            AuditProgressListener::class,
        ],

        SubscriptionCreated::class => [
            [SyncUserPlanFromSubscription::class, 'handleCreated'],
        ],

        SubscriptionUpdated::class => [
            [SyncUserPlanFromSubscription::class, 'handleUpdated'],
        ],

        SubscriptionCanceled::class => [
            [SyncUserPlanFromSubscription::class, 'handleCanceled'],
        ],
    ];

    protected $subscribe = [
        AuditPageSubscriber::class,
        AuditStatusSubscriber::class,
    ];

    public function boot(): void
    {
        static::disableEventDiscovery();
    }
}
