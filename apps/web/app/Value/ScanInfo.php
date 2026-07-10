<?php

namespace App\Value;

use App\Models\Audit;
use Illuminate\Contracts\Support\Arrayable;

class ScanInfo implements Arrayable
{
    public function __construct(
        public readonly string $auditId,
        public readonly string $siteUrl,
        public readonly string $status,
        public readonly ?string $failureReason,
        public readonly ?string $startedAt,
        public readonly ?string $completedAt,
        public readonly ?string $cancelledAt,
        public readonly string $createdAt
    ) {}

    public static function fromAudit(Audit $audit): static
    {
        return static::fromArray([
            'auditId' => $audit->crawler_id,
            'siteUrl' => $audit->url,
            'status' => $audit->status->value,
            'failureReason' => $audit->failure_reason,
            'startedAt' => $audit->started_at?->toIso8601String(),
            'completedAt' => $audit->completed_at?->toIso8601String(),
            'cancelledAt' => $audit->cancelled_at?->toIso8601String(),
            'createdAt' => $audit->created_at->toIso8601String(),
        ]);
    }

    public static function fromArray(array $array): static
    {
        return new static(
            auditId: $array['auditId'],
            siteUrl: $array['siteUrl'],
            status: $array['status'],
            failureReason: $array['failureReason'] ?? null,
            startedAt: $array['startedAt'] ?? null,
            completedAt: $array['completedAt'] ?? null,
            cancelledAt: $array['cancelledAt'] ?? null,
            createdAt: $array['createdAt'],
        );
    }

    public function toArray(): array
    {
        return [
            'auditId' => $this->auditId,
            'siteUrl' => $this->siteUrl,
            'status' => $this->status,
            'failureReason' => $this->failureReason,
            'startedAt' => $this->startedAt,
            'completedAt' => $this->completedAt,
            'cancelledAt' => $this->cancelledAt,
            'createdAt' => $this->createdAt,
        ];
    }
}
