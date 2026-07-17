<?php

namespace App\Http\Controllers\Audit;

use App\Http\Controllers\Controller;
use App\Models\Audit;
use App\Services\ReportPresenter;
use App\Value\ScanProgress;
use App\Value\ScanQueue;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IndexController extends Controller
{
    public function __invoke(Request $request)
    {
        $audits = $request->user()
            ->audits()
            // History rendering below only ever reads impact_level and a bare
            // count() — not the full row (nodes, description, etc. are sizeable
            // columns that would otherwise be hydrated for nothing).
            ->with(['violations' => fn ($query) => $query->select('id', 'audit_id', 'impact_level')])
            ->latest()
            ->get();

        return Inertia::render('audit/index', [
            'history' => $audits->map(fn (Audit $audit) => $this->presentHistoryRow($audit))->values(),
        ]);
    }

    protected function presentHistoryRow(Audit $audit): array
    {
        $isActive = $audit->status->cancellable();
        $isComplete = $audit->status->completed();

        return [
            'auditId' => $audit->crawler_id,
            'domain' => $audit->domain,
            'status' => $audit->status->value,
            'score' => $isComplete ? (int) (new ReportPresenter($audit))->healthScore() : null,
            'issuesFound' => $isComplete ? $audit->violations->count() : null,
            'scanQueue' => $isActive ? ScanQueue::fromAudit($audit)->toArray() : null,
            'scanProgress' => $isActive ? ScanProgress::fromAudit($audit)->toArray() : null,
            'requestedAt' => $audit->created_at->toIso8601String(),
        ];
    }
}
