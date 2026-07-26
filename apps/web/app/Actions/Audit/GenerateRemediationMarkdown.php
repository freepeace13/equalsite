<?php

namespace App\Actions\Audit;

use App\Models\Audit;
use App\Models\Violation;
use App\Services\ReportPresenter;
use App\Value\Impact;
use Illuminate\Support\Collection;

class GenerateRemediationMarkdown
{
    public function generate(Audit $audit): string
    {
        $presenter = new ReportPresenter($audit);
        $violations = $audit->violations;

        $lines = [
            "# Accessibility Remediation Spec — {$audit->domain}",
            '',
            sprintf(
                'Generated: %s · Audit: %s · Health score: %d/100',
                now()->toDateString(),
                $audit->crawler_id,
                $presenter->healthScore()
            ),
            $this->summaryLine($audit, $violations),
            '',
            '> Instructions for the coding agent: fix each violation below in this',
            "> codebase's markup/styles/scripts. Each entry gives the axe-core rule, why",
            '> it fails, the exact selector(s)/HTML of every affected element, and the',
            '> page(s) it appears on. After fixing, validate by re-running an axe-core',
            '> scan on the listed pages.',
            '',
        ];

        foreach (Impact::cases() as $impact) {
            $group = $violations->where('impact_level', $impact)->values();

            if ($group->isEmpty()) {
                continue;
            }

            $lines[] = "## {$this->sectionHeading($impact)}";
            $lines[] = '';

            foreach ($group as $violation) {
                array_push($lines, ...$this->renderViolation($violation));
            }
        }

        return implode("\n", $lines);
    }

    /**
     * @param  Collection<int, Violation>  $violations
     */
    protected function summaryLine(Audit $audit, Collection $violations): string
    {
        $counts = collect(Impact::cases())
            ->mapWithKeys(fn (Impact $impact) => [
                $impact->value => $violations->where('impact_level', $impact)->count(),
            ]);

        return sprintf(
            '%d violations across %d pages (critical: %d, serious: %d, moderate: %d, minor: %d)',
            $violations->count(),
            $audit->pages->count(),
            $counts['critical'],
            $counts['serious'],
            $counts['moderate'],
            $counts['minor']
        );
    }

    protected function sectionHeading(Impact $impact): string
    {
        return match ($impact) {
            Impact::Critical => 'Critical (screen reader blockers)',
            Impact::Serious => 'Serious (keyboard users)',
            Impact::Moderate => 'Moderate (low vision users)',
            Impact::Minor => 'Minor (general users)',
        };
    }

    /**
     * @return string[]
     */
    protected function renderViolation(Violation $violation): array
    {
        $nodes = collect($violation->nodes->toArray())->values();
        $affectedPageCount = $nodes->pluck('urls')->flatten()->unique()->count();
        $summary = $violation->plain_english_summary
            ?? str_replace('-', ' ', $violation->rule_id);

        $lines = [
            "### {$violation->rule_id} — {$summary}",
            "- **Impact:** {$violation->impact_level->value}",
            "- **Affected pages:** {$affectedPageCount}",
            "- **Description:** {$violation->description}",
            "- **Why it fails:** {$violation->failure_summary}",
            "- **Reference:** {$violation->help_url}",
            '- **Affected elements:**',
        ];

        foreach ($nodes as $node) {
            foreach ($node['urls'] as $url) {
                $lines[] = "  - `{$url}` → selector `{$node['target']}`";
                $lines[] = '    ```html';
                $lines[] = "    {$node['html']}";
                $lines[] = '    ```';
            }
        }

        $lines[] = '';

        return $lines;
    }
}
