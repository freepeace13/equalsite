<?php

namespace App\StorableEvents\Audit;

use Spatie\EventSourcing\StoredEvents\ShouldBeStored;

class AuditProgressWasUpdated extends ShouldBeStored
{
    public function __construct(
        public readonly int $completedRequests,
        public readonly int $pendingRequests,
        public readonly int $totalRequests,
        public readonly float $progressPercentage,
    ) {}
}
