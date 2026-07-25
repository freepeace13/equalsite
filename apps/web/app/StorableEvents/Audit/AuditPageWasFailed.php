<?php

namespace App\StorableEvents\Audit;

use Spatie\EventSourcing\StoredEvents\ShouldBeStored;

class AuditPageWasFailed extends ShouldBeStored
{
    public function __construct(
        public readonly string $url,
        public readonly int $attemptsCount,
        public readonly string $errorMessage,
        public readonly ?string $errorCode,
        public readonly string $failedAt,
    ) {}
}
