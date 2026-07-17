import { Head, Link, router } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import { useState } from 'react';
import { AuditRequestModal } from '@/components/audit-request-modal';
import { PublicHeader } from '@/components/public-header';
import { dashboard } from '@/routes';
import { progress } from '@/routes/audit';
import { index, show } from '@/routes/sites';
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

type Site = {
    domain: string;
    auditCount: number;
    lastRunAt: string;
    auditId: string;
    status: ScanStatus;
    score: number | null;
    scanQueue: ScanQueue | null;
    scanProgress: ScanProgress | null;
};

type SitesIndexProps = {
    sites: Site[];
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

function ScoreCell({ score }: { score: number | null }) {
    if (score === null) {
        return <span className="text-slate-400 dark:text-slate-500">—</span>;
    }

    const tone =
        score >= 90
            ? 'text-emerald-600 dark:text-emerald-400'
            : score >= 60
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400';

    return <span className={`font-medium tabular-nums ${tone}`}>{score}</span>;
}

function LiveSiteRow({ site }: { site: Site }) {
    const [status, setStatus] = useState<ScanStatus>(site.status);
    const [scanProgress, setScanProgress] = useState<ScanProgress | null>(site.scanProgress);

    useEchoPublic<WsEvents>(
        `audit-${site.auditId}-scanning`,
        [
            '.audit.queued',
            '.audit.started',
            '.audit.progress',
            '.audit.completed',
            '.audit.failed',
            '.audit.cancelled',
        ],
        (e) => {
            if (e.type === 'audit.started') {
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
                router.reload({ only: ['sites'] });
            }
        },
    );

    const scanned = scanProgress?.completedRequests ?? 0;
    const total = scanProgress?.totalRequests ?? 0;
    const pct = total > 0 ? Math.round((scanned / total) * 100) : (scanProgress?.progressPercentage ?? 0);

    return (
        <TableRow className="bg-indigo-50/40 dark:bg-indigo-900/10">
            <TableCell className="font-medium">
                <Link href={show(site.domain).url} className="hover:underline">
                    {site.domain}
                </Link>
            </TableCell>
            <TableCell>
                <StatusBadge {...STATUS_BADGE[status]} />
            </TableCell>
            <TableCell>
                {status === 'started' ? (
                    <div className="min-w-32">
                        <ProgressBar value={pct} size="sm" className="mb-1" />
                        <p className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                            {scanned} of {total} pages
                        </p>
                    </div>
                ) : (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        position {site.scanQueue?.position ?? '—'} in queue
                    </span>
                )}
            </TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">{site.auditCount}</TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">running now</TableCell>
            <TableCell className="text-right">
                <Link
                    href={progress(site.auditId).url}
                    className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                >
                    view progress
                </Link>
            </TableCell>
        </TableRow>
    );
}

function SiteRow({ site }: { site: Site }) {
    return (
        <TableRow>
            <TableCell className="font-medium">
                <Link href={show(site.domain).url} className="hover:underline">
                    {site.domain}
                </Link>
            </TableCell>
            <TableCell>
                <StatusBadge {...STATUS_BADGE[site.status]} />
            </TableCell>
            <TableCell>
                <ScoreCell score={site.score} />
            </TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">{site.auditCount}</TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">
                {humanReadableDateTime(site.lastRunAt)}
            </TableCell>
            <TableCell className="text-right">
                <Link
                    href={show(site.domain).url}
                    className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                >
                    view site
                </Link>
            </TableCell>
        </TableRow>
    );
}

export default function Index({ sites }: SitesIndexProps) {
    const [auditFormOpen, setAuditFormOpen] = useState(false);

    return (
        <>
            <Head title="Your sites" />

            <main className="mx-auto container py-10">
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-xl font-medium">your sites</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {sites.length} {str.plural('site', sites.length)} tracked
                        </p>
                    </div>
                    {sites.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setAuditFormOpen(true)}
                            className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                        >
                            run a new audit
                        </button>
                    )}
                </div>

                {sites.length === 0 ? (
                    <EmptyState
                        title="no sites yet"
                        description="run your first audit and it'll show up here, grouped with the rest of that site's history."
                        action={
                            <Button size="sm" onClick={() => setAuditFormOpen(true)}>
                                run your first audit
                                <ArrowRightIcon />
                            </Button>
                        }
                    />
                ) : (
                    <TableCard>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 dark:bg-slate-900">
                                    <TableHead>domain</TableHead>
                                    <TableHead>status</TableHead>
                                    <TableHead>score</TableHead>
                                    <TableHead>audits</TableHead>
                                    <TableHead>last run</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sites.map((site) =>
                                    isActiveStatus(site.status) ? (
                                        <LiveSiteRow key={site.domain} site={site} />
                                    ) : (
                                        <SiteRow key={site.domain} site={site} />
                                    ),
                                )}
                            </TableBody>
                        </Table>
                    </TableCard>
                )}
            </main>

            <AuditRequestModal open={auditFormOpen} onOpenChange={setAuditFormOpen} />
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Sites',
            href: index(),
        },
    ],
};
