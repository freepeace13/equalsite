<?php

namespace App\Value;

use Illuminate\Contracts\Support\Arrayable;

/**
 * @property AxeItem[] $violations
 * @property AxeItem[] $passes
 **/
class AxeResult implements Arrayable
{
    /**
     * @param  AxeItem[]  $violations
     */
    public function __construct(
        public readonly string $crawlId,
        public readonly string $url,
        public readonly array $violations,
        // public readonly array $passes,
    ) {}

    public static function fromArray(array $array): static
    {
        $violations = collect($array['violations'])
            ->map(fn (array $i) => AxeItem::fromArray($i))
            ->all();

        // $passes = collect($array['passes'] ?? [])
        //     ->map(fn(array $i) => AxeItem::fromArray($i))
        //     ->all();

        return new static(
            crawlId: $array['auditId'],
            url: $array['pageUrl'],
            violations: $violations,
            // passes: $passes
        );
    }

    public function toArray()
    {
        return [
            'crawlId' => $this->crawlId,
            'url' => $this->url,
            'violations' => collect($this->violations)->toArray(),
            // 'passes' => collect($this->passes)->toArray(),
        ];
    }
}
