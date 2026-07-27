import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { store } from '@/routes/audit';
import { AuditRequestModal } from '@/components/audit-request-modal';
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
    const [auditFormOpen, setAuditFormOpen] = useState(false);
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
                                <Link href="/">
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

            <AuditRequestModal
                open={auditFormOpen}
                onOpenChange={setAuditFormOpen}
            />
        </>
    );
}
