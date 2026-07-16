import { Head, Link, router } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import { useState } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
} from 'recharts';
import { PublicHeader } from '@/components/public-header';
import { dashboard } from '@/routes';
import { cancel, progress, result, store } from '@/routes/audit';
import { show, index as sitesIndex } from '@/routes/sites';
import { humanReadableDateTime, relativeTimeUntil, str } from '@/lib/utils';
import type { ScanProgress, ScanQueue, ScanStatus } from '@/types';
import type {
    CancelledWsEvent,
    CompletedWsEvent,
    FailedWsEvent,
    ProgressWsEvent,
    QueuedWsEvent,
    StartedWsEvent,
} from '@equalsite/types';
import {
    ArrowRightIcon,
    Button,
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ProgressBar,
    StatPair,
    StatusBadge,
    type StatusBadgeStatus,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@equalsite/ui';

type CurrentAudit = {
    auditId: string;
    siteUrl: string;
    status: ScanStatus;
    failureReason: string | null;
    score: number | null;
    issuesFound: number | null;
    scanQueue: ScanQueue | null;
    scanProgress: ScanProgress | null;
};

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

type WsEvents =
    | QueuedWsEvent
    | StartedWsEvent
    | ProgressWsEvent
    | CompletedWsEvent
    | FailedWsEvent
    | CancelledWsEvent;

const STATUS_BADGE: Record<ScanStatus, { status: StatusBadgeStatus; label?: string }> = {
    queued: { status: 'queued' },
    started: { status: 'processing', label: 'crawling' },
    completed: { status: 'complete' },
    failed: { status: 'failed' },
    cancelled: { status: 'cancelled' },
};

const CARD_SHELL: Record<ScanStatus, string> = {
    queued: 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-900/10',
    started: 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-900/10',
    completed: 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-900/10',
    cancelled: 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40',
    failed: 'border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-900/10',
};

function runNewAudit(url: string) {
    router.post(store().url, { url });
}

function CurrentAuditCard({ audit }: { audit: CurrentAudit }) {
    const [status, setStatus] = useState<ScanStatus>(audit.status);
    const [scanQueue, setScanQueue] = useState(audit.scanQueue);
    const [scanProgress, setScanProgress] = useState(audit.scanProgress);

    useEchoPublic<WsEvents>(
        `audit-${audit.auditId}-scanning`,
        [
            '.audit.queued',
            '.audit.started',
            '.audit.progress',
            '.audit.completed',
            '.audit.failed',
            '.audit.cancelled',
        ],
        (e) => {
            if (e.type === 'audit.queued') {
                setScanQueue({ ...(e as QueuedWsEvent).data });
            } else if (e.type === 'audit.started') {
                setStatus('started');
            } else if (e.type === 'audit.progress') {
                setScanProgress({ ...(e as ProgressWsEvent).data });
            } else if (
                e.type === 'audit.completed' ||
                e.type === 'audit.failed' ||
                e.type === 'audit.cancelled'
            ) {
                router.reload({ only: ['currentAudit', 'issuesSnapshot', 'scoreTrend', 'history'] });
            }
        },
    );

    const handleCancel = () => {
        if (!window.confirm("cancel this audit? it'll stay in your history marked as cancelled.")) {
            return;
        }
        router.delete(cancel(audit.auditId).url);
    };

    const scanned = scanProgress?.completedRequests ?? 0;
    const total = scanProgress?.totalRequests ?? 0;
    const pct = total > 0 ? Math.round((scanned / total) * 100) : (scanProgress?.progressPercentage ?? 0);

    return (
        <div className={`mb-8 rounded-lg border p-5 transition-colors ${CARD_SHELL[status]}`}>
            {status === 'queued' && (
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <StatusBadge status="queued" className="mb-1" />
                        <p className="mt-1 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                            position {scanQueue?.position ?? '—'} in queue
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={progress(audit.auditId).url}>view progress</Link>
                        </Button>
                        <Button variant="ghost-destructive" size="sm" onClick={handleCancel}>
                            cancel
                        </Button>
                    </div>
                </div>
            )}

            {status === 'started' && (
                <>
                    <div className="mb-3 flex items-start justify-between gap-4">
                        <StatusBadge status="processing" label="crawling" />
                        <div className="flex shrink-0 items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={progress(audit.auditId).url}>view progress</Link>
                            </Button>
                            <Button variant="ghost-destructive" size="sm" onClick={handleCancel}>
                                cancel
                            </Button>
                        </div>
                    </div>
                    <ProgressBar value={pct} size="sm" className="mb-2" />
                    <p className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                        {scanned} of {total} pages
                    </p>
                </>
            )}

            {status === 'completed' && (
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <StatusBadge status="complete" className="mb-1" />
                        <p className="mt-1 text-sm">
                            score {audit.score} —{' '}
                            {audit.issuesFound} {str.plural('issue', audit.issuesFound ?? 0)} found
                        </p>
                    </div>
                    <Button size="sm" asChild>
                        <Link href={result(audit.auditId).url}>view report</Link>
                    </Button>
                </div>
            )}

            {status === 'cancelled' && (
                <div className="flex items-center justify-between gap-4">
                    <StatusBadge status="cancelled" />
                    <Button variant="outline" size="sm" onClick={() => runNewAudit(audit.siteUrl)}>
                        run another
                    </Button>
                </div>
            )}

            {status === 'failed' && (
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <StatusBadge status="failed" className="mb-1" />
                        <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-400">
                            {audit.failureReason ?? "couldn't reach the site"}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => runNewAudit(audit.siteUrl)}>
                        try again
                    </Button>
                </div>
            )}
        </div>
    );
}

function ScoreTrendChart({ data }: { data: HistoryRow[] }) {
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

function HistoryTableRow({ row }: { row: HistoryRow }) {
    const isActive = row.status === 'queued' || row.status === 'started';

    return (
        <TableRow className={isActive ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : undefined}>
            <TableCell>
                <StatusBadge {...STATUS_BADGE[row.status]} />
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
                        href={result(row.auditId).url}
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
                        <p className="mb-2 text-xs text-slate-400 dark:text-slate-500">score trend</p>
                        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                            <ScoreTrendChart data={scoreTrend} />
                        </div>
                    </div>
                )}

                {issuesSnapshot && (
                    <div className="mb-8">
                        <p className="mb-2 text-xs text-slate-400 dark:text-slate-500">open issues</p>
                        <StatPair
                            items={[
                                { value: issuesSnapshot.critical, label: 'critical issues' },
                                { value: issuesSnapshot.quickWins, label: 'quick wins available' },
                            ]}
                        />
                    </div>
                )}

                <p className="mb-2 text-xs text-slate-400 dark:text-slate-500">history</p>
                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
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
                </div>
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
