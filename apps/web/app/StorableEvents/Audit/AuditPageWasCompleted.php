<?php

namespace App\StorableEvents\Audit;

use Spatie\EventSourcing\StoredEvents\ShouldBeStored;

class AuditPageWasCompleted extends ShouldBeStored
{
    /**
     * @param  array{critical: int, serious: int, moderate: int, minor: int}  $severityBreakdown
     */
    public function __construct(
        public readonly string $url,
        public readonly int $violationsCount,
        public readonly array $severityBreakdown,
        public readonly string $completedAt,
    ) {}
}
