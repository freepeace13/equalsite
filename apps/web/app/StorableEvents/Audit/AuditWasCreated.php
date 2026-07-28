<?php

namespace App\StorableEvents\Audit;

use Spatie\EventSourcing\StoredEvents\ShouldBeStored;

class AuditWasCreated extends ShouldBeStored
{
    /**
     * @param  array<string, mixed>  $requestParams
     */
    public function __construct(
        public readonly int $userId,
        public readonly string $url,
        public readonly string $domain,
        public readonly array $requestParams = [],
    ) {}
}
