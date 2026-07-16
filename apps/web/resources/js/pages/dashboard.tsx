import { Head, Link, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { Line, LineChart } from 'recharts';
import { PublicHeader } from '@/components/public-header';
import { create, store } from '@/routes/audit';
import { show as siteShow, index as sitesIndex } from '@/routes/sites';
import { humanReadableDateTime, str } from '@/lib/utils';
import { takePendingAudit } from '@/lib/pending-audit';
import type { ScanStatus } from '@/types';
import {
    ArrowRightIcon,
    Button,
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    MetricCard,
    type MetricCardTone,
    StatusBadge,
    type StatusBadgeStatus,
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

const STATUS_BADGE: Record<ScanStatus, { status: StatusBadgeStatus; label?: string }> = {
    queued: { status: 'queued' },
    started: { status: 'processing', label: 'crawling' },
    completed: { status: 'complete' },
    failed: { status: 'failed' },
    cancelled: { status: 'cancelled' },
};

function isActiveStatus(status: ScanStatus) {
    return status === 'queued' || status === 'started';
}

function scoreTone(score: number): MetricCardTone {
    if (score >= 90) {
        return 'success';
    }
    if (score >= 60) {
        return 'default';
    }
    return 'warning';
}

function scoreRingColor(score: number) {
    if (score >= 90) {
        return '#059669'; // emerald-600
    }
    if (score >= 60) {
        return '#CA8A04'; // yellow-600
    }
    return '#DC2626'; // red-600
}

function narrative({ sitesTracked, criticalCount, oldestOpenCriticalDays, quickWinsCount }: DashboardProps) {
    if (sitesTracked === 0) {
        return null;
    }

    if (criticalCount > 0) {
        const age = oldestOpenCriticalDays !== null ? `, oldest one ${oldestOpenCriticalDays} ${str.plural('day', oldestOpenCriticalDays)} old` : '';
        return `${criticalCount} critical ${str.plural('issue', criticalCount)} open across your sites${age}.`;
    }

    if (quickWinsCount > 0) {
        return `no critical issues open — ${quickWinsCount} quick ${str.plural('win', quickWinsCount)} waiting across your sites.`;
    }

    return 'no open issues across your sites right now.';
}

function ScoreTrendSparkline({ data }: { data: ScoreTrendPoint[] }) {
    const chartData = data.map((point) => ({
        date: new Date(point.requestedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        domain: point.domain,
        score: point.score,
    }));

    const chartConfig = {
        score: { label: 'score', color: '#4338CA' },
    } satisfies ChartConfig;

    return (
        <div className="mt-2 h-10 w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart data={chartData} margin={{ left: 0, right: 0, top: 2, bottom: 0 }}>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent nameKey="domain" labelKey="date" hideIndicator />}
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

function ScoreRing({ score }: { score: number }) {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - score / 100);
    const color = scoreRingColor(score);

    return (
        <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0" aria-hidden="true">
            <circle
                cx="20"
                cy="20"
                r={radius}
                fill="none"
                strokeWidth="4"
                className="stroke-slate-200 dark:stroke-slate-700"
            />
            <circle
                cx="20"
                cy="20"
                r={radius}
                fill="none"
                strokeWidth="4"
                stroke={color}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 20 20)"
            />
            <text
                x="20"
                y="21"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-current text-[10px] font-medium tabular-nums"
            >
                {score}
            </text>
        </svg>
    );
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
                    <p className="truncate text-sm font-medium">{site.domain}</p>
                    <StatusBadge {...STATUS_BADGE[site.status]} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">running now</p>
            </Link>
        );
    }

    return (
        <Link
            href={siteShow(site.domain).url}
            className="flex min-w-48 shrink-0 items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
        >
            {site.score !== null ? (
                <ScoreRing score={site.score} />
            ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                    <StatusBadge {...STATUS_BADGE[site.status]} />
                </span>
            )}
            <div className="min-w-0">
                <p className="truncate text-sm font-medium">{site.domain}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{humanReadableDateTime(site.lastRunAt)}</p>
            </div>
        </Link>
    );
}

function EmptyState() {
    return (
        <div className="rounded-lg border border-slate-200 p-10 text-center dark:border-slate-800">
            <p className="text-sm font-medium">no audits yet</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                run your first audit and this page fills in with your portfolio's score trend and open issues.
            </p>
            <Button size="sm" className="mt-5" asChild>
                <Link href={create().url}>
                    run your first audit
                    <ArrowRightIcon />
                </Link>
            </Button>
        </div>
    );
}

export default function Dashboard(props: DashboardProps) {
    const { sitesTracked, auditsRun, scoreTrend, criticalCount, quickWinsCount, sitesPreview } = props;
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

            <main className="mx-auto container py-10">
                <div className="mb-8">
                    <h1 className="font-display text-xl font-medium">dashboard</h1>
                    {story && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{story}</p>}
                </div>

                {sitesTracked === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div>
                                <MetricCard label="sites tracked" value={sitesTracked} />
                                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    {auditsRun} {str.plural('audit', auditsRun)} run in total
                                </p>
                            </div>

                            <div>
                                <MetricCard
                                    label="overall score"
                                    value={latestScore ?? '—'}
                                    tone={latestScore !== null ? scoreTone(latestScore) : 'default'}
                                />
                                {scoreTrend.length >= 2 && <ScoreTrendSparkline data={scoreTrend} />}
                            </div>

                            <div>
                                <MetricCard
                                    label="critical issues open"
                                    value={criticalCount}
                                    tone={criticalCount > 0 ? 'warning' : 'success'}
                                />
                                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    {criticalCount > 0 && props.oldestOpenCriticalDays !== null
                                        ? `oldest open ${props.oldestOpenCriticalDays} ${str.plural('day', props.oldestOpenCriticalDays)}`
                                        : 'none open right now'}
                                </p>
                            </div>

                            <div>
                                <MetricCard
                                    label="quick wins available"
                                    value={quickWinsCount}
                                    tone={quickWinsCount > 0 ? 'success' : 'default'}
                                />
                                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    {quickWinsCount > 0 ? 'high impact — do these first' : 'nothing queued up'}
                                </p>
                            </div>
                        </div>

                        <div className="mb-3 flex items-end justify-between gap-4">
                            <p className="text-xs text-slate-400 dark:text-slate-500">your sites</p>
                            <Link
                                href={sitesIndex().url}
                                className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                            >
                                view all sites
                            </Link>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-1">
                            {sitesPreview.map((site) => (
                                <SitePreviewCard key={site.domain} site={site} />
                            ))}
                        </div>
                    </>
                )}
            </main>
        </>
    );
}
