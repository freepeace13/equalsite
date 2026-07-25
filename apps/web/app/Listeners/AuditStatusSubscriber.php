<?php

namespace App\Listeners;

use App\AggregateRoots\AuditAggregateRoot;
use App\Events\Audit\AuditCompleted;
use App\Events\Audit\AuditFailed;
use App\Events\Audit\AuditStarted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Events\Dispatcher;
use Illuminate\Support\Carbon;

class AuditStatusSubscriber implements ShouldQueue
{
    public function handleAuditStarted(AuditStarted $event): void
    {
        AuditAggregateRoot::retrieve($event->crawlerId())
            ->start($this->carbonTimestamp($event->timestamp())->toIso8601String())
            ->persist();
    }

    public function handleAuditFailed(AuditFailed $event): void
    {
        AuditAggregateRoot::retrieve($event->crawlerId())
            ->fail($event->payload()['error'] ?? '', $event->payload()['errorCode'] ?? null)
            ->persist();
    }

    public function handleAuditCompleted(AuditCompleted $event): void
    {
        AuditAggregateRoot::retrieve($event->crawlerId())
            ->complete($this->carbonTimestamp($event->timestamp())->toIso8601String())
            ->persist();
    }

    protected function carbonTimestamp(int $timestamp): Carbon
    {
        return Carbon::createFromTimestampMs($timestamp);
    }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            AuditStarted::class,
            [AuditStatusSubscriber::class, 'handleAuditStarted']
        );

        $events->listen(
            AuditFailed::class,
            [AuditStatusSubscriber::class, 'handleAuditFailed']
        );

        $events->listen(
            AuditCompleted::class,
            [AuditStatusSubscriber::class, 'handleAuditCompleted']
        );
    }
}
