<?php

namespace App\Listeners;

use App\AggregateRoots\AuditAggregateRoot;
use App\Events\Audit\AuditProgress;
use Illuminate\Contracts\Queue\ShouldQueue;

class AuditProgressListener implements ShouldQueue
{
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
