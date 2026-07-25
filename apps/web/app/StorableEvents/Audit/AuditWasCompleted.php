<?php

namespace App\StorableEvents\Audit;

use Spatie\EventSourcing\StoredEvents\ShouldBeStored;

class AuditWasCompleted extends ShouldBeStored
{
    public function __construct(
        public readonly string $completedAt,
    ) {}
}
