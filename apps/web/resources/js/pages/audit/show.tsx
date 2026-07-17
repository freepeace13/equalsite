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
