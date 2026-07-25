<?php

namespace App\StorableEvents\Audit;

use Spatie\EventSourcing\StoredEvents\ShouldBeStored;

class AuditWasFailed extends ShouldBeStored
{
    public function __construct(
        public readonly string $reason,
        public readonly ?string $code,
    ) {}
}
