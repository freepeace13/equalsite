<?php

namespace App\Value;

use App\Models\Audit;
use Illuminate\Contracts\Support\Arrayable;

class ScanProgress implements Arrayable
{
    public function __construct(
        public readonly int $completedRequests,
        public readonly int $pendingRequests,
        public readonly int $totalRequests,
        public readonly int $progressPercentage
    ) {}

    public static function fromAudit(Audit $audit): static
    {
        return static::fromArray(
            $audit->getCustomData('progress_state', [
                'completedRequests' => 0,
                'pendingRequests' => 0,
                'totalRequests' => 0,
                'progressPercentage' => 0,
            ])
        );
    }

    public static function fromArray(array $array): static
    {
        return new static(
            completedRequests: $array['completedRequests'],
            pendingRequests: $array['pendingRequests'],
            totalRequests: $array['totalRequests'],
            progressPercentage: $array['progressPercentage'],
        );
    }

    public function toArray(): array
    {
        return [
            'completedRequests' => $this->completedRequests,
            'pendingRequests' => $this->pendingRequests,
            'totalRequests' => $this->totalRequests,
            'progressPercentage' => $this->progressPercentage,
        ];
    }
}
