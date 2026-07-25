<?php

namespace App\Listeners;

use App\AggregateRoots\AuditAggregateRoot;
use App\Events\Audit\AuditQueued;
use Illuminate\Contracts\Queue\ShouldQueue;

class AuditQueueStateListener implements ShouldQueue
{
    public function __invoke(AuditQueued $event): void
    {
        $payload = $event->payload();

        AuditAggregateRoot::retrieve($event->crawlerId())
            ->updateQueueState($payload['position'], $payload['ahead'], $payload['waiting'])
            ->persist();
    }
}
