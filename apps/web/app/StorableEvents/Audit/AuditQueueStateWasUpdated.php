<?php

namespace App\StorableEvents\Audit;

use Spatie\EventSourcing\StoredEvents\ShouldBeStored;

class AuditQueueStateWasUpdated extends ShouldBeStored
{
    public function __construct(
        public readonly int $position,
        public readonly int $ahead,
        public readonly int $waiting,
    ) {}
}
