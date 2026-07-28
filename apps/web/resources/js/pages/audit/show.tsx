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
    Button,
    CheckIcon,
    EmptyState,
    GlobeIcon,
    MetricCard,
    ScoreRing,
    SectionLabel,
} from '@equalsite/ui';

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

            <main className="container mx-auto py-10">
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

                {report.scanSettings && (
                    <div className="mb-8">
                        <SectionLabel className="mb-2">
                            scan settings
                        </SectionLabel>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-lg border border-slate-200 p-4 text-sm sm:grid-cols-3 dark:border-slate-800">
                            <div>
                                <dt className="text-xs text-slate-500 dark:text-slate-400">
                                    page limit
                                </dt>
                                <dd>
                                    up to {report.scanSettings.maxPages}{' '}
                                    {str.plural(
                                        'page',
                                        report.scanSettings.maxPages,
                                    )}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs text-slate-500 dark:text-slate-400">
                                    crawl depth
                                </dt>
                                <dd>
                                    {report.scanSettings.maxDepth !== null
                                        ? (CRAWL_DEPTH_LABELS[
                                              report.scanSettings.maxDepth
                                          ] ??
                                          `${report.scanSettings.maxDepth} levels`)
                                        : 'unlimited'}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs text-slate-500 dark:text-slate-400">
                                    crawl scope
                                </dt>
                                <dd>
                                    {ENQUEUE_STRATEGY_LABELS[
                                        report.scanSettings.enqueueStrategy
                                    ] ?? report.scanSettings.enqueueStrategy}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs text-slate-500 dark:text-slate-400">
                                    include patterns
                                </dt>
                                <dd>
                                    {report.scanSettings.includeGlobs.length >
                                    0
                                        ? report.scanSettings.includeGlobs.join(
                                              ', ',
                                          )
                                        : 'none'}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs text-slate-500 dark:text-slate-400">
                                    exclude patterns
                                </dt>
                                <dd>
                                    {report.scanSettings.excludeGlobs.length >
                                    0
                                        ? report.scanSettings.excludeGlobs.join(
                                              ', ',
                                          )
                                        : 'none'}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs text-slate-500 dark:text-slate-400">
                                    screenshots
                                </dt>
                                <dd>
                                    {report.scanSettings.captureScreenshot
                                        ? 'captured'
                                        : 'not captured'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                )}

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
