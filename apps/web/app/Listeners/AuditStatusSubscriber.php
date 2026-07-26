<?php

namespace App\Listeners;

use App\AggregateRoots\AuditAggregateRoot;
use App\Events\Audit\AuditCompleted;
use App\Events\Audit\AuditFailed;
use App\Events\Audit\AuditStarted;
use App\Events\Audit\BaseEvent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Events\Dispatcher;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Support\Carbon;

class AuditStatusSubscriber implements ShouldQueue
{
    /**
     * Serialize writes to a given audit's AuditAggregateRoot across all
     * listener classes — concurrent page/progress/status events for the
     * same audit otherwise race on the aggregate's optimistic-concurrency
     * check and silently drop the losing update.
     *
     * @return array<int, object>
     */
    public function middleware(BaseEvent $event): array
    {
        return [
            (new WithoutOverlapping($event->crawlerId()))
                ->shared()
                ->releaseAfter(1)
                ->expireAfter(30),
        ];
    }

    public function backoff(BaseEvent $event): array
    {
        return [1, 2, 3, 5];
    }

    public function tries(BaseEvent $event): int
    {
        return 10;
    }

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
