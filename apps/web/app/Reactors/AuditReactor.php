<?php

namespace App\Reactors;

use App\Jobs\ProcessAuditArtifacts;
use App\StorableEvents\Audit\AuditWasCompleted;
use Spatie\EventSourcing\EventHandlers\Reactors\Reactor;
use Throwable;

class AuditReactor extends Reactor
{
    public function onAuditWasCompleted(AuditWasCompleted $event): void
    {
        try {
            ProcessAuditArtifacts::dispatch($event->aggregateRootUuid());
        } catch (Throwable $e) {
            report($e);
        }
    }
}
