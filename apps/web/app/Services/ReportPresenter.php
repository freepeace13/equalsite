<?php

namespace App\Services;

use App\Contracts\ScoreCalculator;
use App\Models\Audit;
use App\Models\Violation;
use App\Value\Impact;

class ReportPresenter
{
    protected Audit $audit;

    protected ScoreCalculator $calculator;

    protected ?array $scannedUrlsCache = null;

    public function __construct(Audit $audit)
    {
        $this->audit = $audit;
        $this->calculator = new HealthScoreCalculator;
    }

    public function pages(array $discoveredPageUrls): array
    {
        return [
            'discovered' => $discoveredPageUrls,
            'atRisk' => $this->totalPagesAtRisk($discoveredPageUrls),
            'violationsByUrl' => $this->violationsByDiscoveredPageUrl($discoveredPageUrls),
        ];
    }

    public function healthScore(): float
    {
        $score = 100;
        $violations = $this->audit->violations;

        foreach (Impact::cases() as $impact) {
            $count = $violations->where('impact_level', $impact)->count();
            $score = floor($score - ($count * $impact->weight() * .5));
        }

        return max(0, $score);
    }

    public function remediation(array $discoveredPageUrls): array
    {
        $groups = $this->audit->violations
            ->sort(
                fn (Violation $left, Violation $right): int => $this->compareViolations($left, $right)
            )
            ->map(fn (Violation $violation): array => $this->remediationGroup($violation, $discoveredPageUrls))
            ->values()
            ->all();

        return [
            'groupsCount' => count($groups),
            'groups' => $groups,
        ];
    }

    /**
     * @param  list<string>  $discoveredPageUrls
     * @return array{
     *     violationId: int,
     *     ruleId: string,
     *     impact: string,
     *     impactLabel: string,
     *     summary: string,
     *     failureSummary: ?string,
     *     helpUrl: ?string,
     *     fixInstruction: ?string,
     *     remediationScope: string,
     *     clusterReason: string,
     *     affectedPagesCount: int,
     *     instancesCount: int,
     *     samplePages: list<string>,
     *     sampleTargets: list<string>,
     *     sampleNodes: list<array{url: string, target: string, html: string, fingerprint: string}>,
     *     affectedPages: list<string>
     * }
     */
    private function remediationGroup(Violation $violation, array $discoveredPageUrls): array
    {
        $nodes = collect($violation->nodes ?? [])
            ->map(function (array $node): array {
                $target = $this->normalizeTarget($node['target'] ?? null);

                return [
                    'url' => is_string($node['url'] ?? null) ? $node['url'] : '',
                    'target' => $target,
                    'html' => is_string($node['html'] ?? null) ? $node['html'] : '',
                    'fingerprint' => is_string($node['fingerprint'] ?? null) ? $node['fingerprint'] : '',
                ];
            })
            ->filter(fn (array $node): bool => $node['url'] !== '')
            ->values();

        $discoveredLookup = array_flip($discoveredPageUrls);
        $affectedPages = $nodes
            ->pluck('url')
            ->filter(fn (string $url): bool => isset($discoveredLookup[$url]))
            ->unique()
            ->values()
            ->all();

        $instancesCount = $nodes
            ->pluck('fingerprint')
            ->filter()
            ->unique()
            ->count();

        $sampleTargets = $nodes
            ->pluck('target')
            ->filter()
            ->unique()
            ->take(3)
            ->values()
            ->all();

        $sampleNodes = $nodes
            ->unique(fn (array $node): string => $node['fingerprint'] !== ''
                ? $node['fingerprint']
                : $node['url'].'|'.$node['target'].'|'.$node['html'])
            ->take(3)
            ->map(fn (array $node): array => $node)
            ->values()
            ->all();

        $remediationScope = $this->inferRemediationScope(
            $affectedPages,
            $sampleTargets,
            $nodes->pluck('fingerprint')->filter()->unique()->count(),
            count($discoveredPageUrls),
        );

        return [
            'violationId' => $violation->id,
            'ruleId' => $violation->rule_id,
            'impact' => $violation->impact_level->value,
            'impactLabel' => $violation->impact_level->label(),
            'summary' => $violation->plain_english_summary ?? str_replace('-', ' ', $violation->rule_id),
            'failureSummary' => $violation->failure_summary,
            'helpUrl' => $violation->help_url,
            'fixInstruction' => $violation->fix_instruction,
            'remediationScope' => $remediationScope,
            'clusterReason' => $this->clusterReason($remediationScope, $affectedPages, $sampleTargets),
            'affectedPagesCount' => count($affectedPages),
            'instancesCount' => $instancesCount,
            'samplePages' => array_slice($affectedPages, 0, 3),
            'sampleTargets' => $sampleTargets,
            'sampleNodes' => $sampleNodes,
            'affectedPages' => $affectedPages,
        ];
    }

    public function scannedUrls(): array
    {
        return $this->scannedUrlsCache ??= $this->audit->pages()->pluck('url')->all();
    }

    public function summary(array $discoveredPageUrls): array
    {
        $pagesAtRisk = $this->totalPagesAtRisk($discoveredPageUrls);
        $pagesAtRiskCount = max(
            collect($pagesAtRisk)
                ->filter(fn (array $page): bool => ($page['issuesFound'] ?? 0) > 0)
                ->count(),
            collect($this->violationsByDiscoveredPageUrl($discoveredPageUrls))
                ->filter(fn (array $violations): bool => $violations !== [])
                ->count(),
        );

        $pagesScannedCount = count($this->scannedUrls());

        return [
            'totalIssuesFound' => $this->audit->violations()->count(),
            'totalPagesAtRisk' => $pagesAtRiskCount,
            'totalPagesScanned' => max(count($discoveredPageUrls), $pagesScannedCount),
            'totalPagesDiscovered' => count($discoveredPageUrls),
            'scannedAt' => $this->audit->created_at?->toIso8601String(),
            'completedAt' => $this->audit->updated_at?->toIso8601String(),
        ];
    }

    /**
     * @param  list<string>  $discoveredPageUrls
     * @return list<array{url: string, issuesFound: int}>
     */
    public function totalPagesAtRisk(array $discoveredPageUrls): array
    {
        $issuesFoundByUrl = $this->audit->violations
            ->flatMap(fn (Violation $violation) => collect($violation->nodes ?? [])
                ->filter(fn (array $node): bool => is_string($node['url'] ?? null) && $node['url'] !== '')
                ->map(fn (array $node): array => [
                    'url' => $node['url'],
                    'violation_id' => $violation->id,
                ]))
            ->unique(fn (array $item): string => $item['url'].'|'.$item['violation_id'])
            ->countBy('url');

        return collect($discoveredPageUrls)
            ->filter(fn ($url): bool => is_string($url) && $url !== '')
            ->map(fn (string $pageUrl) => [
                'url' => $pageUrl,
                'issuesFound' => (int) $issuesFoundByUrl->get($pageUrl, 0),
            ])
            ->values()
            ->all();
    }

    /**
     * Violations that include at least one node on the given URL, keyed by URL (camelCase for Inertia).
     *
     * @param  list<string>  $discoveredPageUrls
     * @return array<string, list<array{id: int, ruleId: string, impact: string, impactLabel: string, summary: string, instancesOnPage: int, helpUrl: ?string}>>
     */
    public function violationsByDiscoveredPageUrl(array $discoveredPageUrls): array
    {
        /** @var array<string, list<array<string, mixed>>> $byUrl */
        $byUrl = [];
        foreach ($discoveredPageUrls as $pageUrl) {
            if (! is_string($pageUrl) || $pageUrl === '') {
                continue;
            }
            $byUrl[$pageUrl] = [];
        }

        if ($byUrl === []) {
            return [];
        }

        $violations = $this->audit->violations;

        foreach (array_keys($byUrl) as $pageUrl) {
            $items = [];
            foreach ($violations as $violation) {
                $nodesOnPage = collect($violation->nodes ?? [])
                    ->filter(fn (array $node): bool => ($node['url'] ?? '') === $pageUrl);

                if ($nodesOnPage->isEmpty()) {
                    continue;
                }

                $items[] = [
                    'id' => $violation->id,
                    'ruleId' => $violation->rule_id,
                    'impact' => $violation->impact_level->value,
                    'impactLabel' => $violation->impact_level->label(),
                    'summary' => $violation->plain_english_summary ?? str_replace('-', ' ', $violation->rule_id),
                    'instancesOnPage' => $nodesOnPage->pluck('fingerprint')->unique()->count(),
                    'helpUrl' => $violation->help_url,
                ];
            }

            usort(
                $items,
                fn (array $a, array $b): int => Impact::from((string) $a['impact'])->priority()
                    <=> Impact::from((string) $b['impact'])->priority()
            );

            $byUrl[$pageUrl] = $items;
        }

        return $byUrl;
    }

    public function legalTargetCount(Impact $impact): int
    {
        return $this->audit->violations
            ->where('impact', $impact)
            ->count();
    }

    /**
     * @param  list<string>  $discoveredPageUrls
     * @return array{
     *     topIssues: list<array{
     *         id: int,
     *         ruleId: string,
     *         impact: string,
     *         impactLabel: string,
     *         summary: string,
     *         failureSummary: ?string,
     *         helpUrl: ?string,
     *         affectedPagesCount: int,
     *         instancesCount: int,
     *         samplePageUrl: ?string
     *     }>
     * }
     */
    public function highlights(array $discoveredPageUrls): array
    {
        $topIssues = $this->audit->violations
            ->sort(
                fn (Violation $left, Violation $right): int => $this->compareViolations($left, $right)
            )
            ->map(fn (Violation $violation): array => $this->topIssue($violation, $discoveredPageUrls))
            ->values()
            ->all();

        return ['topIssues' => $topIssues];
    }

    /**
     * @param  list<string>  $discoveredPageUrls
     * @return array{
     *     id: int,
     *     ruleId: string,
     *     impact: string,
     *     impactLabel: string,
     *     summary: string,
     *     failureSummary: ?string,
     *     helpUrl: ?string,
     *     affectedPagesCount: int,
     *     instancesCount: int,
     *     samplePageUrl: ?string
     * }
     */
    private function topIssue(Violation $violation, array $discoveredPageUrls): array
    {
        $nodes = collect($violation->nodes ?? []);
        $discoveredUrlLookup = array_flip($discoveredPageUrls);
        $samplePageUrl = $nodes
            ->pluck('url')
            ->filter(fn (?string $url): bool => is_string($url) && $url !== '')
            ->first(fn (string $url): bool => isset($discoveredUrlLookup[$url]));

        return [
            'id' => $violation->id,
            'ruleId' => $violation->rule_id,
            'impact' => $violation->impact_level->value,
            'impactLabel' => $violation->impact_level->label(),
            'summary' => $violation->plain_english_summary ?? str_replace('-', ' ', $violation->rule_id),
            'failureSummary' => $violation->failure_summary,
            'helpUrl' => $violation->help_url,
            'affectedPagesCount' => $nodes
                ->pluck('url')
                ->filter(fn (?string $url): bool => is_string($url) && $url !== '')
                ->unique()
                ->count(),
            'instancesCount' => $this->violationInstanceCount($violation),
            'samplePageUrl' => $samplePageUrl,
        ];
    }

    /**
     * @param  list<string>  $affectedPages
     * @param  list<string>  $sampleTargets
     */
    private function inferRemediationScope(
        array $affectedPages,
        array $sampleTargets,
        int $uniqueFingerprints,
        int $discoveredPagesCount,
    ): string {
        if (count($affectedPages) <= 1) {
            return 'page-specific';
        }

        $targetText = strtolower(implode(' ', $sampleTargets));
        $touchesLayoutRegion = str_contains($targetText, 'header')
            || str_contains($targetText, 'nav')
            || str_contains($targetText, 'footer')
            || str_contains($targetText, 'main');

        if ($touchesLayoutRegion && $uniqueFingerprints <= 1) {
            return 'shared-layout';
        }

        if ($discoveredPagesCount > 0 && count($affectedPages) >= (int) ceil($discoveredPagesCount * 0.6)) {
            return 'shared-layout';
        }

        if ($uniqueFingerprints <= 2) {
            return 'shared-component';
        }

        return 'template';
    }

    /**
     * @param  list<string>  $affectedPages
     * @param  list<string>  $sampleTargets
     */
    private function clusterReason(string $remediationScope, array $affectedPages, array $sampleTargets): string
    {
        $targetHint = $sampleTargets[0] ?? 'the affected selector';
        $pageCount = count($affectedPages);

        return match ($remediationScope) {
            'shared-layout' => "This issue repeats across {$pageCount} pages on {$targetHint}, so it is likely a shared layout fix.",
            'shared-component' => "This issue repeats across {$pageCount} pages on {$targetHint}, so it is likely a shared component fix.",
            'template' => "This issue appears across {$pageCount} related pages on {$targetHint}, suggesting a shared template fix.",
            default => "This issue is currently isolated to a specific page or instance near {$targetHint}.",
        };
    }

    protected function compareViolations(Violation $left, Violation $right): int
    {
        $impactComparison = $left->impact_level->priority() <=> $right->impact_level->priority();

        if ($impactComparison !== 0) {
            return $impactComparison;
        }

        return $this->violationInstanceCount($right) <=> $this->violationInstanceCount($left);
    }

    private function normalizeTarget(mixed $target): string
    {
        if (is_array($target)) {
            $firstTarget = $target[0] ?? null;

            return is_string($firstTarget) ? $firstTarget : '';
        }

        return is_string($target) ? $target : '';
    }

    protected function violationInstanceCount(Violation $violation): int
    {
        return collect($violation->nodes ?? [])
            ->map(fn (array $node): string => (string) ($node['fingerprint'] ?? ''))
            ->filter()
            ->unique()
            ->count();
    }
}
