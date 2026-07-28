<?php

namespace App\Http\Controllers\Audit;

use App\Http\Controllers\Controller;
use App\Models\Audit;
use App\Models\AuditPage;
use App\Models\Violation;
use App\Services\HealthScoreCalculator;
use App\Services\ReportPresenter;
use App\Value\SeverityBreakdown;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ShowController extends Controller
{
    public function __invoke(Request $request, string $id)
    {
        $audit = Audit::where('crawler_id', $id)->firstOrFail();

        if (! $audit->status->completed()) {
            abort(404);
        }

        $audit->loadMissing(['violations', 'pages']);

        $presenter = new ReportPresenter($audit);

        // $calculator = new HealthScoreCalculator;

        return Inertia::render('audit/show', [
            'from' => $request->query('from') === 'site' ? 'site' : null,
            'report' => [
                'auditId' => $audit->crawler_id,
                'siteUrl' => $audit->url,
                'healthScore' => $presenter->healthScore(),
                // 'healthScore' => $calculator->calculateScore($audit),
                'severityBreakdown' => SeverityBreakdown::fromAudit($audit),
                'scannedUrls' => $audit->pages->map(fn (AuditPage $page) => $page->toProp())->all(),
                'summary' => $presenter->summary($presenter->scannedUrls()),
                'highlights' => $presenter->highlights($presenter->scannedUrls()),
                'pages' => $presenter->pages($presenter->scannedUrls()),
                'remediation' => $presenter->remediation($presenter->scannedUrls()),
                'violations' => $this->violations($audit),
                'scanSettings' => $this->scanSettings($audit),
            ],
        ]);
    }

    /**
     * @return array{maxPages: int, maxDepth: ?int, enqueueStrategy: string, includeGlobs: string[], excludeGlobs: string[], captureScreenshot: bool}|null
     */
    protected function scanSettings(Audit $audit): ?array
    {
        $options = $audit->getCustomData('request_params.options');

        if (! $options) {
            return null;
        }

        return [
            'maxPages' => $options['maxPages'],
            'maxDepth' => $options['maxDepth'],
            'enqueueStrategy' => $options['enqueueStrategy'],
            'includeGlobs' => $options['includeGlobs'],
            'excludeGlobs' => $options['excludeGlobs'],
            'captureScreenshot' => $options['captureScreenshot'],
        ];
    }

    protected function compareViolations(Violation $left, Violation $right): int
    {
        $impactComparison = $left->impact_level->priority() <=> $right->impact_level->priority();

        if ($impactComparison !== 0) {
            return $impactComparison;
        }

        return count($right->nodes->toArray()) <=> count($left->nodes->toArray());
    }

    protected function violations(Audit $audit)
    {
        return $audit->violations
            ->sort(
                fn (Violation $left, Violation $right): int => $this->compareViolations($left, $right)
            )
            ->map(function (Violation $violation) {
                $nodes = collect($violation->nodes->toArray())->values();
                $affectedUrls = $nodes->pluck('urls')->flatten()->unique();

                return [
                    'auditId' => $violation->audit->crawler_id,
                    'ruleId' => $violation->rule_id,
                    'impact' => $violation->impact_level->value,
                    'summary' => $violation->plain_english_summary ?? str_replace('-', ' ', $violation->rule_id),
                    'failureSummary' => $violation->failure_summary,
                    'helpUrl' => $violation->help_url,
                    'fixInstruction' => $violation->fix_instruction,
                    'screenshotUrl' => $violation->screenshot_path
                        ? Storage::disk('public')->url($violation->screenshot_path)
                        : null,
                    'remediationScope' => 'remediationScope',
                    'clusterReason' => 'clusterReason',
                    'affectedPagesCount' => count($affectedUrls),
                    'instancesCount' => $nodes->count(),
                    'nodes' => $nodes->all(),
                ];
            })
            ->values()
            ->all();
    }
}
