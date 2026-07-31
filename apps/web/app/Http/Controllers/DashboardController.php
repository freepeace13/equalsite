<?php

namespace App\Http\Controllers;

use App\Models\Audit;
use App\Services\ReportPresenter;
use App\Value\Impact;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $audits = $request->user()->audits()->with('violations')->latest()->get();

        $siteGroups = $audits->groupBy('domain');

        $criticalCount = 0;
        $quickWinsCount = 0;
        $oldestOpenCriticalDays = null;

        foreach ($siteGroups as $domainAudits) {
            $latestCompleted = $domainAudits->first(fn (Audit $audit) => $audit->status->completed());

            if (! $latestCompleted) {
                continue;
            }

            $criticalCount += $latestCompleted->violations->where('impact_level', Impact::Critical)->count();
            $quickWinsCount += $latestCompleted->violations
                ->whereIn('impact_level', [Impact::Critical, Impact::Serious])
                ->count();

            $ageDays = $this->oldestOpenCriticalAgeDays($domainAudits, $latestCompleted);

            if ($ageDays !== null) {
                $oldestOpenCriticalDays = max($oldestOpenCriticalDays ?? 0, $ageDays);
            }
        }

        return Inertia::render('dashboard', [
            'sitesTracked' => $siteGroups->count(),
            'auditsRun' => $audits->count(),
            'scoreTrend' => $this->presentScoreTrend($audits),
            'criticalCount' => $criticalCount,
            'oldestOpenCriticalDays' => $oldestOpenCriticalDays,
            'quickWinsCount' => $quickWinsCount,
            'sitesPreview' => Inertia::defer(fn () => $siteGroups
                ->map(fn ($domainAudits, string $domain) => $this->presentSitePreview($domain, $domainAudits))
                ->values()
                ->take(6)),
        ]);
    }

    /**
     * @param  Collection<int, Audit>  $audits
     */
    protected function presentScoreTrend(Collection $audits): Collection
    {
        return $audits
            ->filter(fn (Audit $audit) => $audit->status->completed())
            ->sortBy('created_at')
            ->values()
            ->map(fn (Audit $audit) => [
                'auditId' => $audit->crawler_id,
                'domain' => $audit->domain,
                'requestedAt' => $audit->created_at->toIso8601String(),
                'score' => (int) (new ReportPresenter($audit))->healthScore(),
            ]);
    }

    /**
     * @param  Collection<int, Audit>  $domainAudits
     */
    protected function presentSitePreview(string $domain, Collection $domainAudits): array
    {
        $latest = $domainAudits->first();
        $isComplete = $latest->status->completed();

        return [
            'domain' => $domain,
            'status' => $latest->status->value,
            'score' => $isComplete ? (int) (new ReportPresenter($latest))->healthScore() : null,
            'lastRunAt' => $latest->created_at->toIso8601String(),
        ];
    }

    /**
     * For each currently-open critical violation on a domain, finds the earliest
     * completed audit in that domain's history already reporting the same rule.
     * Approximates architecture.md's "first_seen_at carried across re-audits"
     * intent without a dedicated column, which isn't tracked yet.
     *
     * @param  Collection<int, Audit>  $domainAudits
     */
    protected function oldestOpenCriticalAgeDays(Collection $domainAudits, Audit $latestCompleted): ?int
    {
        $criticalRuleIds = $latestCompleted->violations
            ->where('impact_level', Impact::Critical)
            ->pluck('rule_id')
            ->unique();

        if ($criticalRuleIds->isEmpty()) {
            return null;
        }

        $completedHistoryAsc = $domainAudits
            ->filter(fn (Audit $audit) => $audit->status->completed())
            ->sortBy('created_at');

        $oldestSeenAt = null;

        foreach ($criticalRuleIds as $ruleId) {
            $firstAudit = $completedHistoryAsc->first(
                fn (Audit $audit) => $audit->violations->contains(fn ($violation) => $violation->rule_id === $ruleId)
            );

            if ($firstAudit && (! $oldestSeenAt || $firstAudit->created_at->lt($oldestSeenAt))) {
                $oldestSeenAt = $firstAudit->created_at;
            }
        }

        return $oldestSeenAt?->diffInDays(now());
    }
}
