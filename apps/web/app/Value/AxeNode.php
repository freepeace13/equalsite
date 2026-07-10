<?php

namespace App\Value;

use Illuminate\Contracts\Support\Arrayable;

class AxeNode implements Arrayable
{
    public function __construct(
        public readonly array $any,
        public readonly array $all,
        public readonly array $none,
        public readonly string $html,
        public readonly array $target,
        public readonly ?string $impact,
        public readonly ?string $failureSummary
    ) {}

    public static function fromArray(array $array): static
    {
        return new static(
            any: $array['any'],
            all: $array['all'],
            none: $array['none'],
            html: $array['html'],
            target: $array['target'],
            impact: $array['impact'] ?? null,
            failureSummary: $array['failureSummary'] ?? null
        );
    }

    public function toArray(): array
    {
        return [
            'any' => $this->any,
            'all' => $this->all,
            'none' => $this->none,
            'impact' => $this->impact,
            'html' => $this->html,
            'target' => $this->target,
            'failureSummary' => $this->failureSummary,
        ];
    }
}
