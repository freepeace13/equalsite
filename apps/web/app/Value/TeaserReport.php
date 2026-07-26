<?php

namespace App\Value;

use App\Models\Audit;
use App\Models\Violation;
use Illuminate\Contracts\Support\Arrayable;

class TeaserReport implements Arrayable
{
    public function __construct(
        public readonly string $auditId,
        public readonly string $siteUrl,
        public readonly int $score,
        public readonly int $scannedUrlsCount,
        public readonly SeverityBreakdown $severityBreakdown,
    ) {}

    public static function fromAudit(Audit $audit): static
    {
        $score = $audit->violations->reduce(
            fn (int $acc, Violation $value) => $acc - $value->impact_level->scoreDeduction(),
            100
        );

        $severityBreakdown = collect(Impact::cases())->mapWithKeys(fn (Impact $impact) => [
            $impact->value => $audit->violations->where('impact_level', $impact->value)->count(),
        ])->toArray();

        return static::fromArray([
            'auditId' => $audit->crawler_id,
            'siteUrl' => $audit->url,
            'score' => (int) max(0, $score),
            'scannedUrlsCount' => $audit->pages()->count(),
            'severityBreakdown' => $severityBreakdown,
        ]);
    }

    public static function fromArray(array $array): static
    {
        return new static(
            auditId: $array['auditId'],
            siteUrl: $array['siteUrl'],
            score: $array['score'],
            scannedUrlsCount: $array['scannedUrlsCount'],
            severityBreakdown: SeverityBreakdown::fromArray($array['severityBreakdown']),
        );
    }

    public function toArray()
    {
        return [
            'auditId' => $this->auditId,
            'siteUrl' => $this->siteUrl,
            'score' => $this->score,
            'scannedUrlsCount' => $this->scannedUrlsCount,
            'severityBreakdown' => $this->severityBreakdown->toArray(),
        ];
    }
}
