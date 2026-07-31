import { Head } from '@inertiajs/react';
import { exportMarkdown, index, show } from '@/routes/audit';
import { show as siteShow, index as sitesIndex } from '@/routes/sites';
import type { ServerityBreakdown } from '@equalsite/types';
import type {
    AuditPage,
    IViolation,
    RemediationGroup,
    ReportPages,
    ScanSettings,
} from '@/types';
import { hostnameOf, str } from '@/lib/utils';
import {
    ImpactGroup,
    type ImpactKey,
} from '@/components/reporting/impact-group';
import {
    Badge,
    Button,
    CheckCircleIcon,
    CheckIcon,
    EmptyState,
    GlobeIcon,
    MetricCard,
    MinusCircleIcon,
    ScoreRing,
    SectionLabel,
    SlidersIcon,
} from '@equalsite/ui';

function Dot() {
    return (
        <span className="text-slate-300 dark:text-slate-700" aria-hidden>
            ·
        </span>
    );
}

const CRAWL_DEPTH_LABELS: Record<number, string> = {
    1: 'shallow',
    3: 'standard',
    5: 'deep',
};

const ENQUEUE_STRATEGY_LABELS: Record<string, string> = {
    all: 'entire site, following links off-domain',
    'same-hostname': 'same hostname only',
    'same-domain': 'same domain only',
    'same-origin': 'same origin only',
};

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
        scannedUrls: AuditPage[];
        summary: ReportSummary;
        highlights: unknown;
        pages: ReportPages;
        remediation: {
            groups: RemediationGroup[];
            groupsCount: number;
        };
        violations: IViolation[];
        scanSettings: ScanSettings | null;
    };
};

const IMPACT_ORDER: ImpactKey[] = ['critical', 'serious', 'moderate', 'minor'];

export default function Show({ report }: ReportProps) {
    const domain = hostnameOf(report.siteUrl);

    const pageCount = report.scannedUrls.length;

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

            <main className="container mx-auto px-6 py-10">
                {/* Score + narrative */}
                <div className="mb-6 flex items-start justify-between gap-5 border-b border-slate-200 pb-6 dark:border-slate-800">
                    <div className="flex items-start gap-5">
                        <ScoreRing
                            score={report.healthScore}
                            size={76}
                            strokeWidth={7}
                        />
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
                    <Button size="sm" variant="secondary" asChild>
                        <a href={exportMarkdown(report.auditId).url} download>
                            export spec
                        </a>
                    </Button>
                </div>

                {report.scanSettings && (
                    <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
                        <SlidersIcon
                            width={12}
                            height={12}
                            className="shrink-0 text-slate-400 dark:text-slate-500"
                        />

                        <span>
                            {report.scanSettings.maxPages}{' '}
                            {str.plural('page', report.scanSettings.maxPages)}{' '}
                            max
                        </span>

                        <Dot />

                        <span>
                            {report.scanSettings.maxDepth !== null
                                ? (CRAWL_DEPTH_LABELS[
                                      report.scanSettings.maxDepth
                                  ] ?? `${report.scanSettings.maxDepth}-level`)
                                : 'unlimited'}{' '}
                            depth
                        </span>

                        <Dot />

                        <span>
                            {ENQUEUE_STRATEGY_LABELS[
                                report.scanSettings.enqueueStrategy
                            ] ?? report.scanSettings.enqueueStrategy}
                        </span>

                        <Dot />

                        <span className="inline-flex items-center gap-1">
                            {report.scanSettings.captureScreenshot ? (
                                <CheckCircleIcon
                                    width={12}
                                    height={12}
                                    className="text-emerald-600 dark:text-emerald-500"
                                />
                            ) : (
                                <MinusCircleIcon
                                    width={12}
                                    height={12}
                                    className="text-slate-400 dark:text-slate-500"
                                />
                            )}
                            screenshots{' '}
                            {report.scanSettings.captureScreenshot
                                ? 'on'
                                : 'off'}
                        </span>

                        {(report.scanSettings.includeGlobs.length > 0 ||
                            report.scanSettings.excludeGlobs.length > 0) && (
                            <>
                                <Dot />
                                <span className="inline-flex flex-wrap items-center gap-1">
                                    {report.scanSettings.includeGlobs.map(
                                        (glob) => (
                                            <Badge
                                                key={`in-${glob}`}
                                                variant="outline"
                                                className="gap-0.5 px-1.5 py-0 font-mono text-[10px] font-normal"
                                            >
                                                +{glob}
                                            </Badge>
                                        ),
                                    )}
                                    {report.scanSettings.excludeGlobs.map(
                                        (glob) => (
                                            <Badge
                                                key={`ex-${glob}`}
                                                variant="outline"
                                                className="gap-0.5 px-1.5 py-0 font-mono text-[10px] font-normal"
                                            >
                                                −{glob}
                                            </Badge>
                                        ),
                                    )}
                                </span>
                            </>
                        )}
                    </div>
                )}

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

                <SectionLabel className="mb-2">
                    grouped by who's affected
                </SectionLabel>

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
                  {
                      title: hostnameOf(props.report.siteUrl),
                      href: siteShow(hostnameOf(props.report.siteUrl)),
                  },
                  {
                      title: props.report.auditId,
                      href: show(props.report.auditId),
                  },
              ]
            : [
                  { title: 'Audits', href: index() },
                  {
                      title: props.report.auditId,
                      href: show(props.report.auditId),
                  },
              ],
});
