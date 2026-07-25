<?php

namespace App\StorableEvents\Audit;

use Spatie\EventSourcing\StoredEvents\ShouldBeStored;

class AuditWasStarted extends ShouldBeStored
{
    public function __construct(
        public readonly string $startedAt,
    ) {}
}
