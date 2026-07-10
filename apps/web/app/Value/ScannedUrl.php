<?php

namespace App\Value;

use App\Models\Audit;
use Illuminate\Contracts\Support\Arrayable;

class ScannedUrl implements Arrayable
{
    public function __construct(
        public readonly string $status,
        public readonly ?string $startedAt,
        public readonly ?int $attemptsCount,
        public readonly ?string $skippedAt,
        public readonly ?string $failedAt,
        public readonly ?string $completedAt,
        public readonly ?string $errorMessage,
        public readonly ?string $skippingReason,
        public readonly ?int $violationsCount,
        public readonly ?SeverityBreakdown $severityBreakdown
    ) {}

    public static function mapFromAudit(Audit $audit): array
    {
        $result = [];
        $urls = $audit->getCustomData('scanned_urls', []);

        foreach ($urls as $url => $data) {
            $result[$url] = static::fromArray($data);
        }

        return $result;
    }

    public static function fromArray(array $array): static
    {
        return new static(
            status: $array['status'],
            attemptsCount: $array['attemptsCount'] ?? null,
            startedAt: $array['startedAt'] ?? null,
            skippedAt: $array['skippedAt'] ?? null,
            failedAt: $array['failedAt'] ?? null,
            completedAt: $array['completedAt'] ?? null,
            errorMessage: $array['errorMessage'] ?? null,
            skippingReason: $array['skippingReason'] ?? null,
            violationsCount: $array['violationsCount'] ?? null,
            severityBreakdown: isset($array['severityBreakdown'])
                ? SeverityBreakdown::fromArray($array['severityBreakdown'])
                : null,
        );
    }

    public function toArray(): array
    {
        return [
            'status' => $this->status,
            'attemptsCount' => $this->attemptsCount,
            'startedAt' => $this->startedAt,
            'skippedAt' => $this->skippedAt,
            'failedAt' => $this->failedAt,
            'completedAt' => $this->completedAt,
            'errorMessage' => $this->errorMessage,
            'skippingReason' => $this->skippingReason,
            'violationsCount' => $this->violationsCount,
            'severityBreakdown' => $this->severityBreakdown?->toArray(),
        ];
    }
}
