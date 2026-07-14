<?php

namespace App\Http\Controllers\Sites;

use App\Http\Controllers\Controller;
use App\Models\Audit;
use App\Services\ReportPresenter;
use App\Value\ScanProgress;
use App\Value\ScanQueue;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;

class IndexController extends Controller
{
    public function __invoke(Request $request)
    {
        $audits = $request->user()->audits()->with('violations')->latest()->get();

        $sites = $audits
            ->groupBy('domain')
            ->map(fn ($domainAudits, string $domain) => $this->presentSite($domain, $domainAudits))
            ->values();

        return Inertia::render('sites/index', [
            'sites' => $sites,
        ]);
    }

    /**
     * @param  Collection<int, Audit>  $domainAudits
     */
    protected function presentSite(string $domain, $domainAudits): array
    {
        $latest = $domainAudits->first();
        $isActive = $latest->status->cancellable();
        $isComplete = $latest->status->completed();

        return [
            'domain' => $domain,
            'auditCount' => $domainAudits->count(),
            'lastRunAt' => $latest->created_at->toIso8601String(),
            'auditId' => $latest->crawler_id,
            'status' => $latest->status->value,
            'score' => $isComplete ? (int) (new ReportPresenter($latest))->healthScore() : null,
            'scanQueue' => $isActive ? ScanQueue::fromAudit($latest)->toArray() : null,
            'scanProgress' => $isActive ? ScanProgress::fromAudit($latest)->toArray() : null,
        ];
    }
}
