# Frontend Refactor Phase C: Reporting Organisms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Relocate the presentational "reporting" organisms (`ViolationCard`, `SubSectionDivider`, `ImpactGroup`, `ScoreTrendChart`, `ScoreTrendSparkline`) out of `pages/audit/show.tsx`, `pages/sites/show.tsx`, and `pages/dashboard.tsx` into `apps/web/resources/js/components/reporting/`, with zero behavior change. No new shared abstraction is introduced this phase — `ScoreTrendChart` and `ScoreTrendSparkline` look similar but differ in real ways (axes/grid, dot rendering, tooltip config, height) and are kept as two separate components, per the `CurrentAuditCard`/`ScanProgressCell` precedent from Phase B.

**Architecture:** A new `components/reporting/` directory, flat kebab-case files (one per top-level organism), no `index.ts` barrel — matching Phase B's `components/scanning/` convention exactly. Three page files are edited to import instead of declare these components.

**Tech Stack:** React 19, Inertia.js 3, TypeScript, `@equalsite/types`, `@equalsite/ui`, `recharts`. Builds on Phase B (`components/scanning/`, unmodified by this plan) — no dependency between the two directories.

## Global Constraints

- Zero behavior change — every migrated component must render identically to today. Preserve every documented quirk verbatim, in particular:
  - `ViolationCard`'s unsafe `const impact = violation.impact as SeverityBadgeSeverity` cast.
  - `ImpactGroup`'s quick-wins/structural-work split (`v.remediationScope === 'page-specific'`), which is a **different rule** from `Show()`'s own quick-wins/structural split (`v.impact === 'critical' || 'serious'` vs `'moderate' || 'minor'`) — do not reconcile these two definitions.
  - `report.remediation` / `report.pages` / `report.highlights` on `ReportProps` remain unread, pre-existing dead typing — not in scope to touch.
  - The already-unused `PublicHeader` import in `pages/audit/show.tsx`, and any other pre-existing unused imports encountered in the three page files (e.g. the unused `dashboard` import in `pages/sites/show.tsx`) are left untouched — not in scope. Confirmed via `pnpm --filter @equalsite/web lintcheck` that these are pre-existing warnings only (0 errors) prior to this phase.
- **IMPACT_ORDER / ImpactKey ownership decision:** `ImpactKey` (`Exclude<SeverityBadgeSeverity, 'pass'>`) is needed both by `ImpactGroup` (its prop type and its lookup constants) and by `Show()` (to type `groupedViolations` and `IMPACT_ORDER`). `IMPACT_ORDER` itself, however, is consumed *only* by `Show()` — `ImpactGroup` never reads it. Applying the same "heavier caller owns the export" rule Phase B used for `countIssues`: since `ImpactGroup` has zero internal need for `IMPACT_ORDER`, it does **not** move. `impact-group.tsx` exports the `ImpactKey` type (it owns the type because it owns the lookup constants keyed by it); `pages/audit/show.tsx` imports `ImpactKey` back and keeps declaring `IMPACT_ORDER` locally, since it's the sole consumer.
- **Chart point-type naming:** neither new chart component reuses an existing page-local type name, to avoid confusion with the `HistoryRow` type already exported from `components/scanning/live-history-row.tsx` (Phase B) and the differently-shaped local `HistoryRow` in `pages/sites/show.tsx`, or with the local `ScoreTrendPoint` in `pages/dashboard.tsx`. New types: `ScoreTrendChartPoint` (in `score-trend-chart.tsx`) and `ScoreTrendSparklinePoint` (in `score-trend-sparkline.tsx`), each shaped to exactly the fields the component reads. Both pages' existing prop types (`HistoryRow`, `ScoreTrendPoint`) are structural supersets of these, so no page-level type changes are required beyond the import swap.
- **`SitePreviewCard` (in `pages/dashboard.tsx`) is explicitly out of scope.** It's a site-portfolio card, not one of the three organisms named for this phase (`ViolationCard`, `ImpactGroup`, score-trend chart components). It stays in the page as a candidate for a later phase.
- No new shared abstraction beyond relocation — `ScoreTrendChart` (h-40, axes, grid, dots, default tooltip) and `ScoreTrendSparkline` (h-10, no axes/grid, no dots, custom tooltip config) are not byte-identical and are kept as separate components/files, not unified via prop toggles.
- No changes to `lib/audit-status.ts`, `lib/utils.ts`, hooks, `@equalsite/types`, or `components/scanning/` — this phase only moves presentational code and its directly-supporting local types/helpers.
- No component extraction beyond what's named in this plan — Phase D (final thinning pass) is separate, later work.
- New files live under `apps/web/resources/js/components/reporting/`, flat kebab-case naming (e.g. `violation-card.tsx`), no `index.ts` barrel.
- Named-import lists within a single import statement must stay alphabetically sorted by imported identifier (ignoring the `type` keyword) — this repo's `sort-imports` ESLint rule enforces member order within a declaration, even though it does not enforce declaration order across separate imports (`ignoreDeclarationSort: true`).
- Style: 4-space indent, single quotes, semicolons, 80-col print width (`.prettierrc` at repo root) — match surrounding code exactly.
- Run all `pnpm` commands from the repo root using `--filter @equalsite/web`, unless a step says otherwise.

---

### Task 1: `components/reporting/violation-card.tsx` — extract `ViolationCard`

**Files:**
- Create: `apps/web/resources/js/components/reporting/violation-card.tsx`

**Interfaces:**
- Consumes: `str` from `@/lib/utils`; `IViolation` (type) from `@/types`; `ClockIcon, FileTextIcon, ImagePlaceholderIcon, SeverityBadge, type SeverityBadgeSeverity` from `@equalsite/ui`.
- Produces: `ViolationCard(props: { violation: IViolation }): JSX.Element` — consumed by Task 2's `ImpactGroup`.

- [ ] **Step 1: Create the file**

```tsx
import { str } from '@/lib/utils';
import type { IViolation } from '@/types';
import {
    ClockIcon,
    FileTextIcon,
    ImagePlaceholderIcon,
    SeverityBadge,
    type SeverityBadgeSeverity,
} from '@equalsite/ui';

export function ViolationCard({ violation }: { violation: IViolation }) {
    const impact = violation.impact as SeverityBadgeSeverity;

    return (
        <article className="flex gap-3.5 rounded-lg border border-slate-200 p-3.5 dark:border-slate-800">
            <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                <ImagePlaceholderIcon className="text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium">
                        {violation.summary}
                    </h3>
                    <SeverityBadge severity={impact} className="shrink-0" />
                </div>
                {violation.failureSummary && (
                    <p className="mt-1 mb-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                        {violation.failureSummary}
                    </p>
                )}
                <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                        <FileTextIcon />
                        {violation.affectedPagesCount}{' '}
                        {str.plural('page', violation.affectedPagesCount)}
                    </span>
                    {violation.helpUrl && (
                        <a
                            href={violation.helpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                            <ClockIcon />
                            ~5 min fix
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS (this file isn't imported anywhere yet, but must compile cleanly on its own).

- [ ] **Step 3: Commit**

```bash
git add apps/web/resources/js/components/reporting/violation-card.tsx
git commit -m "$(cat <<'EOF'
Add ViolationCard to components/reporting/

First piece of Phase C: extracts the single-violation card out of
audit/show.tsx ahead of ImpactGroup (its only caller), which follows
in the next task. Preserves the pre-existing unsafe
`violation.impact as SeverityBadgeSeverity` cast as-is.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `components/reporting/impact-group.tsx` — extract `ImpactGroup`, `SubSectionDivider`, and the lookup constants

**Files:**
- Create: `apps/web/resources/js/components/reporting/impact-group.tsx`

**Interfaces:**
- Consumes: `str` from `@/lib/utils`; `IViolation` (type) from `@/types`; `BellIcon, Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger, EyeIcon, type IconProps, InfoCircleIcon, KeyboardIcon, PackageIcon, SeverityBadge, type SeverityBadgeSeverity, ZapIcon` from `@equalsite/ui`; `type { ComponentType }` from `react`; `ViolationCard` from `./violation-card` (Task 1).
- Produces: exported type `ImpactKey` (`= Exclude<SeverityBadgeSeverity, 'pass'>`) and `ImpactGroup(props: { impact: ImpactKey; violations: IViolation[] }): JSX.Element` — both consumed by Task 3 (`pages/audit/show.tsx`). `SubSectionDivider` and the three `Record<ImpactKey, ...>` lookup constants (`IMPACT_GROUP_LABELS`, `IMPACT_GROUP_SUBTITLES`, `IMPACT_GROUP_ICON`) stay private/co-located here — not exported, not reused elsewhere.
- **Ownership note:** `IMPACT_ORDER` does *not* move here — see Global Constraints. Only the `ImpactKey` type crosses back out to the page.

- [ ] **Step 1: Create the file**

```tsx
import type { ComponentType } from 'react';
import { str } from '@/lib/utils';
import type { IViolation } from '@/types';
import {
    BellIcon,
    Collapsible,
    CollapsibleChevron,
    CollapsibleContent,
    CollapsibleTrigger,
    EyeIcon,
    type IconProps,
    InfoCircleIcon,
    KeyboardIcon,
    PackageIcon,
    SeverityBadge,
    type SeverityBadgeSeverity,
    ZapIcon,
} from '@equalsite/ui';
import { ViolationCard } from './violation-card';

export type ImpactKey = Exclude<SeverityBadgeSeverity, 'pass'>;

const IMPACT_GROUP_LABELS: Record<ImpactKey, string> = {
    critical: 'screen reader users',
    serious: 'keyboard users',
    moderate: 'low vision users',
    minor: 'general users',
};

const IMPACT_GROUP_SUBTITLES: Record<ImpactKey, string> = {
    critical: 'missing labels and alt text block core flows',
    serious: 'focus management and keyboard navigation issues',
    moderate: 'colour contrast and text sizing falls short',
    minor: 'minor improvements for a better experience',
};

const IMPACT_GROUP_ICON: Record<ImpactKey, ComponentType<IconProps>> = {
    critical: BellIcon,
    serious: KeyboardIcon,
    moderate: EyeIcon,
    minor: InfoCircleIcon,
};

function SubSectionDivider({
    type,
    count,
}: {
    type: 'quick-wins' | 'structural-work';
    count: number;
}) {
    const isQuickWins = type === 'quick-wins';
    return (
        <div className="flex items-center gap-2 py-1">
            {isQuickWins ? (
                <ZapIcon
                    width={12}
                    height={12}
                    strokeWidth={2.5}
                    className="text-emerald-500"
                />
            ) : (
                <PackageIcon className="text-slate-400" />
            )}
            <span
                className={`text-xs font-medium ${isQuickWins ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
                {[
                    isQuickWins ? 'quick wins' : 'structural work',
                    `${count} ${str.plural('issue', count)}`,
                ].join(' · ')}
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>
    );
}

export function ImpactGroup({
    impact,
    violations,
}: {
    impact: ImpactKey;
    violations: IViolation[];
}) {
    const count = violations.length;
    const quickWins = violations.filter(
        (v) => v.remediationScope === 'page-specific',
    );
    const structuralWork = violations.filter(
        (v) => v.remediationScope !== 'page-specific',
    );
    const Icon = IMPACT_GROUP_ICON[impact];

    return (
        <Collapsible
            defaultOpen={impact === 'critical'}
            className="overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700"
        >
            <CollapsibleTrigger className="gap-3.5 px-4 py-3.5">
                <Icon />
                <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">
                        {IMPACT_GROUP_LABELS[impact]}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                        {IMPACT_GROUP_SUBTITLES[impact]}
                    </span>
                </span>
                <SeverityBadge
                    severity={impact}
                    label={`${count} ${impact}`}
                    hideIcon
                    className="whitespace-nowrap"
                />
                <CollapsibleChevron />
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-2.5 border-t border-slate-200 p-4 dark:border-slate-800">
                {quickWins.length > 0 && (
                    <>
                        <SubSectionDivider
                            type="quick-wins"
                            count={quickWins.length}
                        />
                        {quickWins.map((v) => (
                            <ViolationCard key={v.ruleId} violation={v} />
                        ))}
                    </>
                )}
                {structuralWork.length > 0 && (
                    <>
                        <SubSectionDivider
                            type="structural-work"
                            count={structuralWork.length}
                        />
                        {structuralWork.map((v) => (
                            <ViolationCard key={v.ruleId} violation={v} />
                        ))}
                    </>
                )}
            </CollapsibleContent>
        </Collapsible>
    );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/resources/js/components/reporting/impact-group.tsx
git commit -m "$(cat <<'EOF'
Add ImpactGroup to components/reporting/

Extracts ImpactGroup, its private SubSectionDivider, and the three
IMPACT_GROUP_* lookup constants out of audit/show.tsx. ImpactGroup
now owns and exports the ImpactKey type, since it owns the lookup
constants keyed by it; IMPACT_ORDER stays in the page in the next
task since ImpactGroup never reads it — only ImpactKey crosses back.
Preserves ImpactGroup's own quick-wins/structural-work split
(v.remediationScope === 'page-specific'), which intentionally
differs from the page's separate quick-wins definition.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Modify `pages/audit/show.tsx` to import `ViolationCard`/`ImpactGroup` instead of declaring them

**Files:**
- Modify: `apps/web/resources/js/pages/audit/show.tsx`

**Interfaces:**
- Now consumes `ImpactGroup, type ImpactKey` from `@/components/reporting/impact-group` (Task 2). Page-level `IMPACT_ORDER` keeps its current definition and location, now typed via the imported `ImpactKey`.

- [ ] **Step 1: Replace the full contents of `pages/audit/show.tsx`**

```tsx
import { Head } from '@inertiajs/react';
import { PublicHeader } from '@/components/public-header';
import { index, show } from '@/routes/audit';
import { show as siteShow, index as sitesIndex } from '@/routes/sites';
import type { ServerityBreakdown } from '@equalsite/types';
import type {
    IViolation,
    RemediationGroup,
    ReportPages,
    ScannedUrl,
} from '@/types';
import { str, hostnameOf } from '@/lib/utils';
import {
    ImpactGroup,
    type ImpactKey,
} from '@/components/reporting/impact-group';
import {
    CheckIcon,
    EmptyState,
    GlobeIcon,
    MetricCard,
    ScoreRing,
    SectionLabel,
} from '@equalsite/ui';

type ReportSummary = {
    totalIssuesFound: number;
    totalPagesAtRisk: number;
    totalPagesScanned: number;
    totalPagesDiscovered: number;
    scannedAt: string | null;
    completedAt: string | null;
};

type ReportProps = {
    from: 'site' | null;
    report: {
        auditId: string;
        siteUrl: string;
        healthScore: number;
        severityBreakdown: ServerityBreakdown;
        scannedUrls: Record<string, ScannedUrl>;
        summary: ReportSummary;
        highlights: unknown;
        pages: ReportPages;
        remediation: {
            groups: RemediationGroup[];
            groupsCount: number;
        };
        violations: IViolation[];
    };
};

const IMPACT_ORDER: ImpactKey[] = ['critical', 'serious', 'moderate', 'minor'];

export default function Show({ report }: ReportProps) {
    const domain = hostnameOf(report.siteUrl);

    const pageCount = Object.keys(report.scannedUrls).length;

    const groupedViolations = IMPACT_ORDER.reduce<
        Record<ImpactKey, IViolation[]>
    >(
        (acc, key) => {
            acc[key] = report.violations.filter((v) => v.impact === key);
            return acc;
        },
        { critical: [], serious: [], moderate: [], minor: [] },
    );

    const nonEmptyGroups = IMPACT_ORDER.filter(
        (k) => groupedViolations[k].length > 0,
    );

    const quickWinsCount = report.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
    ).length;

    const structuralCount = report.violations.filter(
        (v) => v.impact === 'moderate' || v.impact === 'minor',
    ).length;

    return (
        <>
            <Head title={`Accessibility report for ${domain}`} />

            <main className="mx-auto container py-10">
                {/* Score + narrative */}
                <div className="mb-6 flex items-start gap-5 border-b border-slate-200 pb-6 dark:border-slate-800">
                    <ScoreRing score={report.healthScore} size={76} strokeWidth={7} />
                    <div>
                        <p className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <GlobeIcon width={13} height={13} />
                            {`${domain} · ${pageCount} ${str.plural('page', pageCount)} scanned`}
                        </p>
                        <h1
                            className="font-display text-lg leading-snug font-medium"
                            aria-label={`Accessibility score: ${report.healthScore} out of 100`}
                        >
                            {report.summary.totalIssuesFound > 0
                                ? `${report.summary.totalIssuesFound} ${str.plural('issue', report.summary.totalIssuesFound)} found — ${report.summary.totalPagesAtRisk} of ${report.summary.totalPagesScanned} ${str.plural('page', report.summary.totalPagesScanned)} affected`
                                : `no issues found across ${report.summary.totalPagesScanned} ${str.plural('page', report.summary.totalPagesScanned)}`}
                        </h1>
                    </div>
                </div>

                {/* Priority overview */}
                <div className="mb-8 grid grid-cols-2 gap-3">
                    <div>
                        <MetricCard
                            tone="success"
                            label="quick wins"
                            value={`${quickWinsCount} fix${quickWinsCount !== 1 ? 'es' : ''}`}
                        />
                        <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-500">
                            high impact — do these first
                        </p>
                    </div>
                    <div>
                        <MetricCard
                            label="structural work"
                            value={`${structuralCount} fix${structuralCount !== 1 ? 'es' : ''}`}
                        />
                        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                            needs dev time — plan these
                        </p>
                    </div>
                </div>

                <SectionLabel className="mb-2">grouped by who's affected</SectionLabel>

                <div className="space-y-3">
                    {nonEmptyGroups.length > 0 ? (
                        nonEmptyGroups.map((impact) => (
                            <ImpactGroup
                                key={impact}
                                impact={impact}
                                violations={groupedViolations[impact]}
                            />
                        ))
                    ) : (
                        <EmptyState
                            className="p-8"
                            icon={
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                                    <CheckIcon className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                            }
                            title="no issues found"
                            description="great news — this site passed all WCAG 2.2 AA checks."
                        />
                    )}
                </div>
            </main>
        </>
    );
}

Show.layout = (props: ReportProps) => ({
    breadcrumbs:
        props.from === 'site'
            ? [
                  { title: 'Sites', href: sitesIndex() },
                  { title: hostnameOf(props.report.siteUrl), href: siteShow(hostnameOf(props.report.siteUrl)) },
                  { title: props.report.auditId, href: show(props.report.auditId) },
              ]
            : [
                  { title: 'Audits', href: index() },
                  { title: props.report.auditId, href: show(props.report.auditId) },
              ],
});
```

This drops `BellIcon, ClockIcon, Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger, EyeIcon, FileTextIcon, type IconProps, ImagePlaceholderIcon, InfoCircleIcon, KeyboardIcon, PackageIcon, SeverityBadge, type SeverityBadgeSeverity, ZapIcon` from the `@equalsite/ui` import (all only used by the moved `ViolationCard`/`SubSectionDivider`/`ImpactGroup`), and drops `import type { ComponentType } from 'react'` entirely (only used by the moved `IMPACT_GROUP_ICON`). `GlobeIcon` stays — it's used directly in `Show()`'s own JSX (score/narrative header). `CheckIcon`, `EmptyState`, `MetricCard`, `ScoreRing`, `SectionLabel` all stay, still used directly in `Show()`. The `@/types` import (`IViolation, RemediationGroup, ReportPages, ScannedUrl`) is unchanged — the page still needs `IViolation` for `groupedViolations`'s type and `ReportProps.violations`.

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/resources/js/pages/audit/show.tsx
git commit -m "$(cat <<'EOF'
Wire audit/show.tsx up to components/reporting/impact-group.tsx

Replaces the inline ViolationCard/SubSectionDivider/ImpactGroup
declarations with an import. No behavior change — IMPACT_ORDER stays
page-local (ImpactGroup never needed it), typed via the ImpactKey
type now imported back from the extracted component.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: `components/reporting/score-trend-chart.tsx` — extract `sites/show.tsx`'s `ScoreTrendChart`

**Files:**
- Create: `apps/web/resources/js/components/reporting/score-trend-chart.tsx`

**Interfaces:**
- Consumes: `CartesianGrid, Line, LineChart, XAxis, YAxis` from `recharts`; `type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent` from `@equalsite/ui`.
- Produces: exported type `ScoreTrendChartPoint` (`{ requestedAt: string; score: number | null }` — the minimal shape the chart actually reads) and `ScoreTrendChart(props: { data: ScoreTrendChartPoint[] }): JSX.Element` — both consumed by Task 5 (`pages/sites/show.tsx`). Named `ScoreTrendChartPoint`, not `HistoryRow`, to avoid colliding with the differently-shaped `HistoryRow` type already exported from `components/scanning/live-history-row.tsx` and the page-local `HistoryRow` that stays in `sites/show.tsx`.

- [ ] **Step 1: Create the file**

```tsx
import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
} from 'recharts';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@equalsite/ui';

export type ScoreTrendChartPoint = {
    requestedAt: string;
    score: number | null;
};

export function ScoreTrendChart({ data }: { data: ScoreTrendChartPoint[] }) {
    const chartData = data.map((row) => ({
        date: new Date(row.requestedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: row.score ?? 0,
    }));

    const chartConfig = {
        score: { label: 'score', color: '#4338CA' },
    } satisfies ChartConfig;

    return (
        <div className="h-40 w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart data={chartData} margin={{ left: -16, right: 12, top: 8, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={32} fontSize={11} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--color-score)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: 'var(--color-score)' }}
                    />
                </LineChart>
            </ChartContainer>
        </div>
    );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/resources/js/components/reporting/score-trend-chart.tsx
git commit -m "$(cat <<'EOF'
Add ScoreTrendChart to components/reporting/

Extracts sites/show.tsx's per-site score trend LineChart (axes,
grid, dots, default tooltip). Given its own local
ScoreTrendChartPoint type rather than reusing the page's HistoryRow
name, to avoid confusion with the differently-shaped HistoryRow
already exported from components/scanning/live-history-row.tsx.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Modify `pages/sites/show.tsx` to import `ScoreTrendChart` instead of declaring it

**Files:**
- Modify: `apps/web/resources/js/pages/sites/show.tsx`

**Interfaces:**
- Now consumes `ScoreTrendChart` from `@/components/reporting/score-trend-chart` (Task 4). The page's own `HistoryRow` type is unchanged and stays page-local — it's a structural superset of `ScoreTrendChartPoint`, so `scoreTrend: HistoryRow[]` continues to type-check as the `data` prop without any type import needed.

- [ ] **Step 1: Replace the full contents of `pages/sites/show.tsx`**

```tsx
import { Head, Link } from '@inertiajs/react';
import { PublicHeader } from '@/components/public-header';
import { dashboard } from '@/routes';
import { show as auditShow, progress } from '@/routes/audit';
import { show, index as sitesIndex } from '@/routes/sites';
import { SCAN_STATUS_BADGE } from '@/lib/audit-status';
import { humanReadableDateTime, relativeTimeUntil, str } from '@/lib/utils';
import {
    CurrentAuditCard,
    type CurrentAudit,
} from '@/components/scanning/current-audit-card';
import { runNewAudit } from '@/components/scanning/run-new-audit';
import { ScoreTrendChart } from '@/components/reporting/score-trend-chart';
import type { ScanStatus } from '@/types';
import {
    ArrowRightIcon,
    Button,
    SectionLabel,
    StatPair,
    StatusBadge,
    SurfacePanel,
    Table,
    TableBody,
    TableCard,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@equalsite/ui';

type HistoryRow = {
    auditId: string;
    status: ScanStatus;
    score: number | null;
    issuesFound: number | null;
    requestedAt: string;
};

type IssuesSnapshot = {
    critical: number;
    quickWins: number;
};

type Rescan = {
    availableAt: string | null;
};

type SiteShowProps = {
    domain: string;
    currentAudit: CurrentAudit;
    issuesSnapshot: IssuesSnapshot | null;
    scoreTrend: HistoryRow[];
    history: HistoryRow[];
    lastAuditUrl: string;
    rescan: Rescan;
};

function HistoryTableRow({ row }: { row: HistoryRow }) {
    const isActive = row.status === 'queued' || row.status === 'started';

    return (
        <TableRow className={isActive ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : undefined}>
            <TableCell>
                <StatusBadge {...SCAN_STATUS_BADGE[row.status]} />
            </TableCell>
            <TableCell className={row.score === null ? 'text-slate-400 dark:text-slate-500' : 'font-medium tabular-nums'}>
                {row.score ?? '—'}
            </TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">
                {row.issuesFound ?? '—'}
            </TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">
                {humanReadableDateTime(row.requestedAt)}
            </TableCell>
            <TableCell className="text-right">
                {row.status === 'completed' && (
                    <Link
                        href={auditShow(row.auditId, { query: { from: 'site' } }).url}
                        className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                    >
                        view report
                    </Link>
                )}
                {isActive && (
                    <Link
                        href={progress(row.auditId).url}
                        className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                    >
                        view progress
                    </Link>
                )}
            </TableCell>
        </TableRow>
    );
}

export default function Show({
    domain,
    currentAudit,
    issuesSnapshot,
    scoreTrend,
    history,
    lastAuditUrl,
    rescan,
}: SiteShowProps) {
    const rescanBlocked =
        rescan.availableAt !== null && new Date(rescan.availableAt).getTime() > Date.now();
    const rescanCaption = rescanBlocked
        ? `next scan available in ${relativeTimeUntil(rescan.availableAt as string)}`
        : undefined;

    return (
        <>
            <Head title={`Audit history for ${domain}`} />

            <main className="mx-auto container py-10">
                <Link
                    href={sitesIndex().url}
                    className="mb-3 inline-block text-xs text-slate-500 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
                >
                    ← your sites
                </Link>

                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-xl font-medium">{domain}</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {history.length} {str.plural('audit', history.length)} run
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Button
                            size="sm"
                            onClick={() => runNewAudit(lastAuditUrl)}
                            disabled={rescanBlocked}
                            title={rescanCaption}
                        >
                            run new audit
                            <ArrowRightIcon />
                        </Button>
                        {rescanCaption && (
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                {rescanCaption}
                            </p>
                        )}
                    </div>
                </div>

                <CurrentAuditCard audit={currentAudit} />

                {scoreTrend.length >= 2 && (
                    <div className="mb-8">
                        <SectionLabel className="mb-2">score trend</SectionLabel>
                        <SurfacePanel padding="sm">
                            <ScoreTrendChart data={scoreTrend} />
                        </SurfacePanel>
                    </div>
                )}

                {issuesSnapshot && (
                    <div className="mb-8">
                        <SectionLabel className="mb-2">open issues</SectionLabel>
                        <StatPair
                            items={[
                                { value: issuesSnapshot.critical, label: 'critical issues' },
                                { value: issuesSnapshot.quickWins, label: 'quick wins available' },
                            ]}
                        />
                    </div>
                )}

                <SectionLabel className="mb-2">history</SectionLabel>
                <TableCard>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-900">
                                <TableHead>status</TableHead>
                                <TableHead>score</TableHead>
                                <TableHead>issues found</TableHead>
                                <TableHead>requested</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((row) => (
                                <HistoryTableRow key={row.auditId} row={row} />
                            ))}
                        </TableBody>
                    </Table>
                </TableCard>
            </main>
        </>
    );
}

Show.layout = (props: SiteShowProps) => ({
    breadcrumbs: [
        { title: 'Sites', href: sitesIndex() },
        { title: props.domain, href: show(props.domain) },
    ],
});
```

This drops `CartesianGrid, Line, LineChart, XAxis, YAxis` from `recharts` and `type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent` from `@equalsite/ui` (all only used by the moved `ScoreTrendChart`) — replaced with a single new import of `ScoreTrendChart` from `@/components/reporting/score-trend-chart`. The page's own `HistoryRow` type, `SurfacePanel`, and every other import are unchanged. (Any pre-existing unused imports such as `dashboard`/`PublicHeader`, if present in the current file, are left untouched per Global Constraints.)

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/resources/js/pages/sites/show.tsx
git commit -m "$(cat <<'EOF'
Wire sites/show.tsx up to components/reporting/score-trend-chart.tsx

Replaces the inline ScoreTrendChart declaration with an import. No
behavior change — the page's own HistoryRow type is a structural
superset of the new component's ScoreTrendChartPoint, so no prop
type changes were needed.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: `components/reporting/score-trend-sparkline.tsx` — extract `dashboard.tsx`'s `ScoreTrendSparkline`

**Files:**
- Create: `apps/web/resources/js/components/reporting/score-trend-sparkline.tsx`

**Interfaces:**
- Consumes: `Line, LineChart` from `recharts`; `type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent` from `@equalsite/ui`.
- Produces: exported type `ScoreTrendSparklinePoint` (`{ domain: string; requestedAt: string; score: number }`) and `ScoreTrendSparkline(props: { data: ScoreTrendSparklinePoint[] }): JSX.Element` — both consumed by Task 7 (`pages/dashboard.tsx`). Named distinctly from the page's own local `ScoreTrendPoint` type (and from Task 4's unrelated `ScoreTrendChartPoint`) to keep each chart's minimal-required shape explicit and non-colliding.

- [ ] **Step 1: Create the file**

```tsx
import { Line, LineChart } from 'recharts';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@equalsite/ui';

export type ScoreTrendSparklinePoint = {
    domain: string;
    requestedAt: string;
    score: number;
};

export function ScoreTrendSparkline({
    data,
}: {
    data: ScoreTrendSparklinePoint[];
}) {
    const chartData = data.map((point) => ({
        date: new Date(point.requestedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
        }),
        domain: point.domain,
        score: point.score,
    }));

    const chartConfig = {
        score: { label: 'score', color: '#4338CA' },
    } satisfies ChartConfig;

    return (
        <div className="mt-2 h-10 w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart
                    data={chartData}
                    margin={{ left: 0, right: 0, top: 2, bottom: 0 }}
                >
                    <ChartTooltip
                        cursor={false}
                        content={
                            <ChartTooltipContent
                                nameKey="domain"
                                labelKey="date"
                                hideIndicator
                            />
                        }
                    />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--color-score)"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ChartContainer>
        </div>
    );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/resources/js/components/reporting/score-trend-sparkline.tsx
git commit -m "$(cat <<'EOF'
Add ScoreTrendSparkline to components/reporting/

Extracts dashboard.tsx's portfolio-wide score sparkline. Kept
separate from ScoreTrendChart (Task 4) rather than unified into one
generic chart — it differs in height, has no axes/grid, no dots, and
uses a different tooltip config (nameKey/labelKey/hideIndicator),
per the CurrentAuditCard/ScanProgressCell precedent from Phase B.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Modify `pages/dashboard.tsx` to import `ScoreTrendSparkline` instead of declaring it

**Files:**
- Modify: `apps/web/resources/js/pages/dashboard.tsx`

**Interfaces:**
- Now consumes `ScoreTrendSparkline` from `@/components/reporting/score-trend-sparkline` (Task 6). The page's own `ScoreTrendPoint` type is unchanged and stays page-local — it's a structural superset of `ScoreTrendSparklinePoint`, so `scoreTrend: ScoreTrendPoint[]` continues to type-check as the `data` prop.
- `SitePreviewCard` is explicitly **not** touched — out of scope for this phase (see Global Constraints).

- [ ] **Step 1: Replace the full contents of `pages/dashboard.tsx`**

```tsx
import { Head, Link, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { PublicHeader } from '@/components/public-header';
import { create, store } from '@/routes/audit';
import { show as siteShow, index as sitesIndex } from '@/routes/sites';
import { humanReadableDateTime, str } from '@/lib/utils';
import { takePendingAudit } from '@/lib/pending-audit';
import { isActiveStatus, SCAN_STATUS_BADGE } from '@/lib/audit-status';
import { ScoreTrendSparkline } from '@/components/reporting/score-trend-sparkline';
import type { ScanStatus } from '@/types';
import {
    ArrowRightIcon,
    Button,
    EmptyState,
    MetricCard,
    type MetricCardTone,
    ScoreRing,
    SectionLabel,
    StatusBadge,
} from '@equalsite/ui';

type ScoreTrendPoint = {
    auditId: string;
    domain: string;
    requestedAt: string;
    score: number;
};

type SitePreview = {
    domain: string;
    status: ScanStatus;
    score: number | null;
    lastRunAt: string;
};

type DashboardProps = {
    sitesTracked: number;
    auditsRun: number;
    scoreTrend: ScoreTrendPoint[];
    criticalCount: number;
    oldestOpenCriticalDays: number | null;
    quickWinsCount: number;
    sitesPreview: SitePreview[];
};

function scoreTone(score: number): MetricCardTone {
    if (score >= 90) {
        return 'success';
    }
    if (score >= 60) {
        return 'default';
    }
    return 'warning';
}

function narrative({
    sitesTracked,
    criticalCount,
    oldestOpenCriticalDays,
    quickWinsCount,
}: DashboardProps) {
    if (sitesTracked === 0) {
        return null;
    }

    if (criticalCount > 0) {
        const age =
            oldestOpenCriticalDays !== null
                ? `, oldest one ${oldestOpenCriticalDays} ${str.plural('day', oldestOpenCriticalDays)} old`
                : '';
        return `${criticalCount} critical ${str.plural('issue', criticalCount)} open across your sites${age}.`;
    }

    if (quickWinsCount > 0) {
        return `no critical issues open — ${quickWinsCount} quick ${str.plural('win', quickWinsCount)} waiting across your sites.`;
    }

    return 'no open issues across your sites right now.';
}

function SitePreviewCard({ site }: { site: SitePreview }) {
    const active = isActiveStatus(site.status);

    if (active) {
        return (
            <Link
                href={siteShow(site.domain).url}
                className="flex min-w-48 shrink-0 flex-col gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/40 p-3 transition-colors hover:border-indigo-300 dark:border-indigo-900/60 dark:bg-indigo-900/10 dark:hover:border-indigo-800"
            >
                <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">
                        {site.domain}
                    </p>
                    <StatusBadge {...SCAN_STATUS_BADGE[site.status]} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    running now
                </p>
            </Link>
        );
    }

    return (
        <Link
            href={siteShow(site.domain).url}
            className="flex min-w-48 shrink-0 items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
        >
            {site.score !== null ? (
                <ScoreRing score={site.score} fairThreshold={60} />
            ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                    <StatusBadge {...SCAN_STATUS_BADGE[site.status]} />
                </span>
            )}
            <div className="min-w-0">
                <p className="truncate text-sm font-medium">{site.domain}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {humanReadableDateTime(site.lastRunAt)}
                </p>
            </div>
        </Link>
    );
}

export default function Dashboard(props: DashboardProps) {
    const {
        sitesTracked,
        auditsRun,
        scoreTrend,
        criticalCount,
        quickWinsCount,
        sitesPreview,
    } = props;
    const latestScore = scoreTrend.at(-1)?.score ?? null;
    const story = narrative(props);

    // Guests who submit the audit form get sent through login/register; this
    // is where they land afterwards, so pick the request back up and fire it.
    useEffect(() => {
        const pending = takePendingAudit();
        if (pending) {
            router.post(store.url(), pending);
        }
    }, []);

    return (
        <>
            <Head title="Dashboard" />

            <main className="container mx-auto py-10">
                <div className="mb-8">
                    <h1 className="font-display text-xl font-medium">
                        dashboard
                    </h1>
                    {story && (
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {story}
                        </p>
                    )}
                </div>

                {sitesTracked === 0 ? (
                    <EmptyState
                        title="no audits yet"
                        description="run your first audit and this page fills in with your portfolio's score trend and open issues."
                        action={
                            <Button size="sm" asChild>
                                <Link href={create().url}>
                                    run your first audit
                                    <ArrowRightIcon />
                                </Link>
                            </Button>
                        }
                    />
                ) : (
                    <>
                        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div>
                                <MetricCard
                                    label="sites tracked"
                                    value={sitesTracked}
                                />
                                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    {auditsRun} {str.plural('audit', auditsRun)}{' '}
                                    run in total
                                </p>
                            </div>

                            <div>
                                <MetricCard
                                    label="overall score"
                                    value={latestScore ?? '—'}
                                    tone={
                                        latestScore !== null
                                            ? scoreTone(latestScore)
                                            : 'default'
                                    }
                                />
                                {scoreTrend.length >= 2 && (
                                    <ScoreTrendSparkline data={scoreTrend} />
                                )}
                            </div>

                            <div>
                                <MetricCard
                                    label="critical issues open"
                                    value={criticalCount}
                                    tone={
                                        criticalCount > 0
                                            ? 'warning'
                                            : 'success'
                                    }
                                />
                                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    {criticalCount > 0 &&
                                    props.oldestOpenCriticalDays !== null
                                        ? `oldest open ${props.oldestOpenCriticalDays} ${str.plural('day', props.oldestOpenCriticalDays)}`
                                        : 'none open right now'}
                                </p>
                            </div>

                            <div>
                                <MetricCard
                                    label="quick wins available"
                                    value={quickWinsCount}
                                    tone={
                                        quickWinsCount > 0
                                            ? 'success'
                                            : 'default'
                                    }
                                />
                                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    {quickWinsCount > 0
                                        ? 'high impact — do these first'
                                        : 'nothing queued up'}
                                </p>
                            </div>
                        </div>

                        <SectionLabel
                            className="mb-3"
                            action={
                                <Link
                                    href={sitesIndex().url}
                                    className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                                >
                                    view all sites
                                </Link>
                            }
                        >
                            your sites
                        </SectionLabel>
                        <div className="flex gap-3 overflow-x-auto pb-1">
                            {sitesPreview.map((site) => (
                                <SitePreviewCard
                                    key={site.domain}
                                    site={site}
                                />
                            ))}
                        </div>
                    </>
                )}
            </main>
        </>
    );
}
```

This drops `Line, LineChart` from `recharts` and `type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent` from `@equalsite/ui` (all only used by the moved `ScoreTrendSparkline`) — replaced with a single new import of `ScoreTrendSparkline` from `@/components/reporting/score-trend-sparkline`. `SitePreviewCard` (with its `isActiveStatus`/`ScoreRing`/`StatusBadge` usage) stays exactly in place. (Any pre-existing unused imports, if present, are left untouched per Global Constraints.)

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/resources/js/pages/dashboard.tsx
git commit -m "$(cat <<'EOF'
Wire dashboard.tsx up to components/reporting/score-trend-sparkline.tsx

Replaces the inline ScoreTrendSparkline declaration with an import.
No behavior change — the page's own ScoreTrendPoint type is a
structural superset of the new component's ScoreTrendSparklinePoint.
SitePreviewCard stays in the page; it's not a named target of this
phase and is a candidate for a later thinning pass.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Full-suite verification and formatting pass

**Files:** none created/modified beyond auto-formatting.

- [ ] **Step 1: Full typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS, zero errors.

- [ ] **Step 2: Lint check**

Run: `pnpm --filter @equalsite/web lintcheck`
Expected: PASS with the same pre-existing 16-warnings/0-errors baseline confirmed during planning. If it reports a *new* unused-import warning, go back to that
task's file and remove the unused import rather than suppressing the lint
rule — this usually means an import removal in Task 3/5/7's replacement
steps was missed.

- [ ] **Step 3: Format check and auto-fix**

Run: `pnpm --filter @equalsite/web format:check`
If it reports files needing formatting, run: `pnpm --filter @equalsite/web format`
then re-run `format:check` to confirm it's now clean.

- [ ] **Step 4: Build**

Run: `pnpm --filter @equalsite/web build`
Expected: succeeds with no errors.

- [ ] **Step 5: Grep for any remaining duplication/leftovers this phase should have removed**

Run:
```bash
grep -rln "function ViolationCard\|function SubSectionDivider\|function ImpactGroup\|function ScoreTrendChart\|function ScoreTrendSparkline" apps/web/resources/js/pages/
ls apps/web/resources/js/components/reporting/
```
Expected: the `grep` produces no matches (all these functions now live only
under `components/reporting/`); the `ls` shows exactly 4 files:
`impact-group.tsx`, `score-trend-chart.tsx`, `score-trend-sparkline.tsx`,
`violation-card.tsx`.

- [ ] **Step 6: Commit if formatting produced changes**

```bash
git add -A
git status
```
If `format` in Step 3 changed any files, commit them:
```bash
git commit -m "$(cat <<'EOF'
Format frontend-refactor Phase C files

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
If nothing changed, skip this commit.

- [ ] **Step 7: Report to the user**

Summarize for the user: this phase is code-complete and verified via
typecheck/lintcheck/build, but per this repo's CLAUDE.md, no automated
browser verification exists — ask them to eyeball the three affected pages
themselves: an audit's report page (`/audit/{id}`, both the standalone view
and the `from=site` variant), a site's show page (score trend chart, when
it has 2+ audits), and the dashboard (`/dashboard`, score sparkline, when
it has 2+ trend points). In particular ask them to expand/collapse a few
`ImpactGroup`s and confirm quick-wins/structural-work sub-sections still
split correctly. Mention that Phase D (final thinning pass) remains as
separate future work.

---

## Next Phases (not part of this plan)

Phase D (final pass thinning every page down to composition — including a
decision on `SitePreviewCard`'s eventual home) gets its own brainstorming →
spec → plan cycle, per the staged-rollout decision made at the start of this
refactor.
