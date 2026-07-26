<?php

namespace App\Listeners;

use App\AggregateRoots\AuditAggregateRoot;
use App\Events\Audit\AuditProgress;
use App\Events\Audit\BaseEvent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;

class AuditProgressListener implements ShouldQueue
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

    public function __invoke(AuditProgress $event): void
    {
        $payload = $event->payload();

        AuditAggregateRoot::retrieve($event->crawlerId())
            ->updateProgress(
                $payload['completedRequests'],
                $payload['pendingRequests'],
                $payload['totalRequests'],
                $payload['progressPercentage'],
            )
            ->persist();
    }
}
