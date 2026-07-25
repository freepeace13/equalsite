<?php

namespace App\StorableEvents\Audit;

use Spatie\EventSourcing\StoredEvents\ShouldBeStored;

class AuditPageWasSkipped extends ShouldBeStored
{
    public function __construct(
        public readonly string $url,
        public readonly string $reason,
        public readonly string $skippedAt,
    ) {}
}
