<?php

namespace App\Providers;

use App\Events\Audit\AuditProgress;
use App\Events\Audit\AuditQueued;
use App\Listeners\AuditPageSubscriber;
use App\Listeners\AuditProgressListener;
use App\Listeners\AuditQueueStateListener;
use App\Listeners\AuditStatusSubscriber;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        AuditQueued::class => [
            AuditQueueStateListener::class,
        ],

        AuditProgress::class => [
            AuditProgressListener::class,
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
