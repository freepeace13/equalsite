<?php

namespace App\StorableEvents\Audit;

use Spatie\EventSourcing\StoredEvents\ShouldBeStored;

class AuditWasCancelled extends ShouldBeStored
{
    public function __construct(
        public readonly string $cancelledAt,
    ) {}
}
