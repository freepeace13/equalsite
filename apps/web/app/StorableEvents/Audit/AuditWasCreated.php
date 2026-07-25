<?php

namespace App\StorableEvents\Audit;

use Spatie\EventSourcing\StoredEvents\ShouldBeStored;

class AuditWasCreated extends ShouldBeStored
{
    public function __construct(
        public readonly int $userId,
        public readonly string $url,
        public readonly string $domain,
    ) {}
}
