import { Head } from '@inertiajs/react';
import { PublicHeader } from '@/components/public-header';
import type { ServerityBreakdown } from '@equalsite/types';
import type {
    IViolation,
    RemediationGroup,
    ReportPages,
    ScannedUrl,
} from '@/types';
import { str } from '@/lib/utils';
import {
    BellIcon,
    CheckIcon,
    ClockIcon,
    Collapsible,
    CollapsibleChevron,
    CollapsibleContent,
    CollapsibleTrigger,
    EyeIcon,
    FileTextIcon,
    GlobeIcon,
    type IconProps,
    ImagePlaceholderIcon,
    InfoCircleIcon,
    KeyboardIcon,
    MetricCard,
    PackageIcon,
    SeverityBadge,
    type SeverityBadgeSeverity,
    ZapIcon,
} from '@equalsite/ui';
import type { ComponentType } from 'react';

type ReportSummary = {
    totalIssuesFound: number;
    totalPagesAtRisk: number;
    totalPagesScanned: number;
    totalPagesDiscovered: number;
    scannedAt: string | null;
    completedAt: string | null;
};

type ReportProps = {
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

type ImpactKey = Exclude<SeverityBadgeSeverity, 'pass'>;

const IMPACT_ORDER: ImpactKey[] = ['critical', 'serious', 'moderate', 'minor'];

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

function ScoreGauge({ score }: { score: number }) {
    const circumference = 201;
    const offset = circumference * (1 - score / 100);
    const color =
        score >= 90
            ? 'text-emerald-500'
            : score >= 70
              ? 'text-yellow-500'
              : 'text-red-500';

    return (
        <svg
            width="76"
            height="76"
            viewBox="0 0 76 76"
            className="shrink-0"
            aria-hidden="true"
        >
            <circle
                cx="38"
                cy="38"
                r="32"
                fill="none"
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="7"
            />
            <circle
                cx="38"
                cy="38"
                r="32"
                fill="none"
                stroke="currentColor"
                className={color}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 38 38)"
            />
            <text
                x="38"
                y="44"
                textAnchor="middle"
                fontSize="21"
                fontWeight="500"
                className="fill-slate-900 dark:fill-white"
            >
                {score}
            </text>
        </svg>
    );
}

function ViolationCard({ violation }: { violation: IViolation }) {
    const impact = violation.impact as SeverityBadgeSeverity;

    return (
        <article className="flex gap-3.5 rounded-lg border border-slate-200 p-3.5 dark:border-slate-800">
            <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                <ImagePlaceholderIcon className="text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium">{violation.summary}</h3>
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

function ImpactGroup({
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

export default function Report({ report }: ReportProps) {
    const domain = (() => {
        try {
            return new URL(report.siteUrl).hostname;
        } catch {
            return report.siteUrl;
        }
    })();

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

            <PublicHeader />

            <main className="mx-auto max-w-3xl px-6 py-10">
                {/* Score + narrative */}
                <div className="mb-6 flex items-start gap-5 border-b border-slate-200 pb-6 dark:border-slate-800">
                    <ScoreGauge score={report.healthScore} />
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

                <p className="mb-2 text-xs text-slate-400 dark:text-slate-500">
                    grouped by who's affected
                </p>

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
                        <div className="rounded-lg border border-slate-200 p-8 text-center dark:border-slate-800">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                                <CheckIcon className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="text-sm font-medium">
                                no issues found
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                great news — this site passed all WCAG 2.2 AA
                                checks.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
