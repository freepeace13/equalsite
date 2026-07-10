<?php

namespace App\Services;

use App\Contracts\ScoreCalculator;
use App\Models\Audit;
use App\Models\Violation;
use App\Value\Impact;
use Illuminate\Support\Arr;

class HealthScoreCalculator implements ScoreCalculator
{
    protected float $scale = .5;

    public function __construct(?float $scale = null)
    {
        $this->scale = $scale ?? $this->scale;
    }

    public function calculateHealthScore(array $violations): int
    {
        $score = 100;

        foreach (Impact::cases() as $impact) {
            $violations = Arr::where($violations, fn (Violation $violation) => $impact->is($violation->impact_level));

            foreach ($violations as $violation) {
                $score -= $this->pointsDeduction($violation);
            }
        }

        return max(0, $score);
    }

    public function pointsDeduction(Violation $violation): int
    {
        collect($violation->nodes)
            ->groupBy('fingerprint')
            ->map(function ($nodes, $fingerprint) {
                $affectedUrls = $nodes->pluck('url')->all();
            });
        $affectedPages = collect($violation->nodes)
            ->unique('fingerprint')
            ->count();

        return $affectedPages * $violation->impact_level->weight() * $this->scale;
    }

    public function calculateScore(Audit $audit): float
    {
        $totalPenalty = 0;
        foreach ($audit->violations as $violation) {
            $totalPenalty += $this->violationWeightedPenalty($violation);
        }

        // $penalties = $audit->violations->map(fn($violation) => $this->violationWeightedPenalty($violation))->values();
        $score = ($totalPenalty / 100) * 100;

        dd($score);

        return max(0, min(100, round($score, 2)));
    }

    protected function maxPossibleImpactPenalty(Audit $audit, Impact $impact): int
    {
        return count($audit->getCustomData('scanned_urls', [])) * $impact->weight();
    }

    public function violationWeightedPenalty(Violation $violation): float
    {
        $clusters = collect($violation->nodes)->groupBy('fingerprint')->keys();

        $totalWeightedPenalty = 0;
        foreach ($clusters as $fingerprint) {
            $maxPossiblePenalty = $this->maxPossibleImpactPenalty($violation->audit, $violation->impact_level);
            $totalWeightedPenalty += ($this->clusterWeightedPenalty($violation, $fingerprint) / $maxPossiblePenalty);
        }

        return $totalWeightedPenalty;
    }

    public function clusterWeightedPenalty(Violation $violation, string $fingerprint)
    {
        $urlsAffected = collect($violation->nodes)
            ->where('fingerprint', $fingerprint)
            ->pluck('url')
            ->unique()
            ->count();

        return $urlsAffected * $violation->impact_level->weight();
    }
}
