<?php

namespace App\Http\Controllers\Sites;

use App\Http\Controllers\Controller;
use App\Models\Audit;
use App\Services\ReportPresenter;
use App\Value\Impact;
use App\Value\ScanProgress;
use App\Value\ScanQueue;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShowController extends Controller
{
    public function __invoke(Request $request, string $domain)
    {
        $audits = $request->user()
            ->audits()
            ->with('violations')
            ->where('domain', $domain)
            ->latest()
            ->get();

        abort_if($audits->isEmpty(), 404);

        $latest = $audits->first();
        $isActive = $latest->status->cancellable();
        $latestCompleted = $audits->first(fn (Audit $audit) => $audit->status->completed());

        $history = $audits
            ->map(fn (Audit $audit) => $this->presentHistoryRow($audit))
            ->values();

        $scoreTrend = $history
            ->filter(fn (array $row) => $row['score'] !== null)
            ->reverse()
            ->values();

        return Inertia::render('sites/show', [
            'domain' => $domain,
            'currentAudit' => [
                'auditId' => $latest->crawler_id,
                'siteUrl' => $latest->url,
                'status' => $latest->status->value,
                'failureReason' => $latest->failure_reason,
                'score' => $latestCompleted?->is($latest) ? (int) (new ReportPresenter($latest))->healthScore() : null,
                'issuesFound' => $latestCompleted?->is($latest) ? $latest->violations->count() : null,
                'scanQueue' => $isActive ? ScanQueue::fromAudit($latest)->toArray() : null,
                'scanProgress' => $isActive ? ScanProgress::fromAudit($latest)->toArray() : null,
            ],
            'issuesSnapshot' => $latestCompleted ? $this->presentIssuesSnapshot($latestCompleted) : null,
            'scoreTrend' => $scoreTrend,
            'history' => $history,
            'lastAuditUrl' => $latest->url,
        ]);
    }

    protected function presentHistoryRow(Audit $audit): array
    {
        $isComplete = $audit->status->completed();

        return [
            'auditId' => $audit->crawler_id,
            'status' => $audit->status->value,
            'score' => $isComplete ? (int) (new ReportPresenter($audit))->healthScore() : null,
            'issuesFound' => $isComplete ? $audit->violations->count() : null,
            'requestedAt' => $audit->created_at->toIso8601String(),
        ];
    }

    protected function presentIssuesSnapshot(Audit $audit): array
    {
        $violations = $audit->violations;

        return [
            'critical' => $violations->where('impact_level', Impact::Critical)->count(),
            'quickWins' => $violations->whereIn('impact_level', [Impact::Critical, Impact::Serious])->count(),
        ];
    }
}
