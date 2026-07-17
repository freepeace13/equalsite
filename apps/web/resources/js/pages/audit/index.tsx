import { Head, Link, router } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import { useState } from 'react';
import { AuditRequestModal } from '@/components/audit-request-modal';
import { index, progress, show } from '@/routes/audit';
import { show as siteShow } from '@/routes/sites';
import { humanReadableDateTime, str } from '@/lib/utils';
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
    EmptyState,
    ProgressBar,
    SectionLabel,
    StatusBadge,
    type StatusBadgeStatus,
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
    domain: string;
    status: ScanStatus;
    score: number | null;
    issuesFound: number | null;
    scanQueue: ScanQueue | null;
    scanProgress: ScanProgress | null;
    requestedAt: string;
};

type AuditIndexProps = {
    history: HistoryRow[];
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

function isActiveStatus(status: ScanStatus) {
    return status === 'queued' || status === 'started';
}

function LiveHistoryRow({ row }: { row: HistoryRow }) {
    const [status, setStatus] = useState<ScanStatus>(row.status);
    const [scanQueue, setScanQueue] = useState(row.scanQueue);
    const [scanProgress, setScanProgress] = useState(row.scanProgress);

    useEchoPublic<WsEvents>(
        `audit-${row.auditId}-scanning`,
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
                // Score/issue counts aren't in the terminal WS payload — refetch
                // this row's authoritative data instead of guessing client-side.
                router.reload({ only: ['history'] });
            }
        },
    );

    const scanned = scanProgress?.completedRequests ?? 0;
    const total = scanProgress?.totalRequests ?? 0;
    const pct = total > 0 ? Math.round((scanned / total) * 100) : (scanProgress?.progressPercentage ?? 0);

    return (
        <TableRow className="bg-indigo-50/40 dark:bg-indigo-900/10">
            <TableCell className="font-medium">
                <Link href={siteShow(row.domain).url} className="hover:underline">
                    {row.domain}
                </Link>
            </TableCell>
            <TableCell>
                <StatusBadge {...STATUS_BADGE[status]} />
            </TableCell>
            <TableCell colSpan={2}>
                {status === 'started' ? (
                    <div className="min-w-32">
                        <ProgressBar value={pct} size="sm" className="mb-1" />
                        <p className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                            {scanned} of {total} pages
                        </p>
                    </div>
                ) : (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        position {scanQueue?.position ?? '—'} in queue
                    </span>
                )}
            </TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">running now</TableCell>
            <TableCell className="text-right">
                <Link
                    href={progress(row.auditId).url}
                    className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                >
                    view progress
                </Link>
            </TableCell>
        </TableRow>
    );
}

function HistoryTableRow({ row }: { row: HistoryRow }) {
    return (
        <TableRow>
            <TableCell className="font-medium">
                <Link href={siteShow(row.domain).url} className="hover:underline">
                    {row.domain}
                </Link>
            </TableCell>
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
                        href={show(row.auditId).url}
                        className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                    >
                        view report
                    </Link>
                )}
            </TableCell>
        </TableRow>
    );
}

export default function Index({ history }: AuditIndexProps) {
    const [auditFormOpen, setAuditFormOpen] = useState(false);

    return (
        <>
            <Head title="Your audits" />

            <main className="mx-auto container py-10">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-xl font-medium">your audits</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {history.length} {str.plural('audit', history.length)} run across all your sites
                        </p>
                    </div>
                    <Button size="sm" onClick={() => setAuditFormOpen(true)}>
                        run a new audit
                        <ArrowRightIcon />
                    </Button>
                </div>

                {history.length === 0 ? (
                    <EmptyState
                        title="no audits yet"
                        description="run one above and it'll show up here, along with the rest of your audit history."
                    />
                ) : (
                    <>
                        <SectionLabel className="mb-2">history</SectionLabel>
                        <TableCard>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 dark:bg-slate-900">
                                        <TableHead>domain</TableHead>
                                        <TableHead>status</TableHead>
                                        <TableHead>score</TableHead>
                                        <TableHead>issues found</TableHead>
                                        <TableHead>requested</TableHead>
                                        <TableHead />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map((row) =>
                                        isActiveStatus(row.status) ? (
                                            <LiveHistoryRow key={row.auditId} row={row} />
                                        ) : (
                                            <HistoryTableRow key={row.auditId} row={row} />
                                        ),
                                    )}
                                </TableBody>
                            </Table>
                        </TableCard>
                    </>
                )}
            </main>

            <AuditRequestModal open={auditFormOpen} onOpenChange={setAuditFormOpen} />
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Audits',
            href: index(),
        },
    ],
};
