<?php

namespace App\StorableEvents\Audit;

use Spatie\EventSourcing\StoredEvents\ShouldBeStored;

class AuditPageWasStarted extends ShouldBeStored
{
    public function __construct(
        public readonly string $url,
        public readonly int $attemptsCount,
        public readonly string $startedAt,
    ) {}
}
