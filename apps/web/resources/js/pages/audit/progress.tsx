import { Head, Link, router } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import { PublicHeader } from '@/components/public-header';
import { cancel, result } from '@/routes/audit';
import { omit } from '@/lib/obj';
import type { ScanInfo, ScanProgress, ScanQueue, ScannedUrl } from '@/types';
import type {
    CancelledWsEvent,
    CompletedWsEvent,
    FailedWsEvent,
    PageCompletedWsEvent,
    PageFailedWsEvent,
    PageSkippedWsEvent,
    PageStartedWsEvent,
    ProgressWsEvent,
    QueuedWsEvent,
    StartedWsEvent,
} from '@equalsite/types';
import {
    AlertTriangleIcon,
    ArrowRightIcon,
    Button,
    Callout,
    CheckCircleIcon,
    GlobeIcon,
    MetricCard,
    MinusCircleIcon,
    ProgressBar,
    SpinnerIcon,
    StatPair,
    StatusBadge,
    type StatusBadgeStatus,
    XCircleIcon,
} from '@equalsite/ui';

type ScanProgressPageProps = {
    scanInfo: ScanInfo;
    scanProgress: ScanProgress;
    scanQueue: ScanQueue;
    scanUrls: Record<string, ScannedUrl>;
};

type WsEvents =
    | QueuedWsEvent
    | StartedWsEvent
    | ProgressWsEvent
    | CompletedWsEvent
    | FailedWsEvent
    | CancelledWsEvent
    | PageStartedWsEvent
    | PageFailedWsEvent
    | PageSkippedWsEvent
    | PageCompletedWsEvent;

const SCAN_STATUS_BADGE: Record<
    ScanInfo['status'],
    { status: StatusBadgeStatus; label?: string }
> = {
    queued: { status: 'queued' },
    started: { status: 'processing', label: 'crawling' },
    completed: { status: 'complete' },
    failed: { status: 'failed' },
    cancelled: { status: 'cancelled' },
};

function hostnameOf(url: string) {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}

function pathnameOf(url: string) {
    try {
        return new URL(url).pathname || '/';
    } catch {
        return url;
    }
}

function countIssues(scanUrls: Record<string, ScannedUrl>) {
    return Object.values(scanUrls).reduce(
        (sum, u) => sum + (u.violationsCount ?? 0),
        0,
    );
}

function CancelButton({ onCancel }: { onCancel: () => void }) {
    return (
        <Button variant="ghost-destructive" size="sm" onClick={onCancel}>
            cancel audit
        </Button>
    );
}

function WaitingPanel({
    scanQueue,
    onCancel,
}: {
    scanQueue: ScanQueue;
    onCancel: () => void;
}) {
    const position = scanQueue.position ?? 0;
    const estMinutes = Math.max(1, Math.round(position * 1.5));
    const totalDots = Math.max(position + 2, 4);

    return (
        <>
            <div className="mb-1 flex items-start justify-between gap-4">
                <h1 className="font-display text-xl font-medium">
                    your audit is in line
                </h1>
                <CancelButton onCancel={onCancel} />
            </div>
            <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
                we'll start crawling as soon as a slot opens up — this page
                updates on its own.
            </p>

            <StatPair
                className="mb-6"
                items={[
                    { value: position, label: 'position in queue' },
                    { value: `~${estMinutes}`, label: 'min estimated wait' },
                ]}
            />

            <div className="mb-6 flex items-center gap-1" aria-hidden="true">
                {Array.from({ length: totalDots }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${i < totalDots - position ? 'bg-indigo-700' : 'bg-slate-200 dark:bg-slate-800'}`}
                    />
                ))}
            </div>

            <Callout>
                2 audits run at a time so every scan gets a full, accurate
                crawl. no need to keep this tab open — bookmark the link to
                check back later.
            </Callout>
        </>
    );
}

function FeedRow({ url, entry }: { url: string; entry: ScannedUrl }) {
    const path = pathnameOf(url);

    if (entry.status === 'completed') {
        const count = entry.violationsCount ?? 0;
        const critical = entry.severityBreakdown?.critical ?? 0;
        const serious = entry.severityBreakdown?.serious ?? 0;
        const isCritical = critical > 0;
        const isModerate = !isCritical && serious > 0;

        return (
            <div className="flex animate-in items-center gap-2.5 px-4 py-2.5 fade-in slide-in-from-bottom-1">
                {count === 0 ? (
                    <CheckCircleIcon className="text-emerald-600 dark:text-emerald-400" />
                ) : (
                    <AlertTriangleIcon
                        className={
                            isCritical
                                ? 'text-red-600 dark:text-red-400'
                                : isModerate
                                    ? 'text-yellow-600 dark:text-yellow-400'
                                    : 'text-slate-500'
                        }
                    />
                )}
                <span className="flex-1 truncate text-sm">{path}</span>
                <span
                    className={`text-xs ${count === 0 ? 'text-emerald-600 dark:text-emerald-400' : isCritical ? 'text-red-600 dark:text-red-400' : isModerate ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-500'}`}
                >
                    {count === 0
                        ? 'no issues'
                        : `${count} issue${count !== 1 ? 's' : ''}`}
                </span>
            </div>
        );
    }

    if (entry.status === 'failed') {
        return (
            <div className="flex animate-in items-center gap-2.5 px-4 py-2.5 fade-in slide-in-from-bottom-1">
                <XCircleIcon className="text-red-500" />
                <span className="flex-1 truncate text-sm">{path}</span>
                <span className="text-xs text-red-500">failed</span>
            </div>
        );
    }

    if (entry.status === 'skipped') {
        return (
            <div className="flex animate-in items-center gap-2.5 px-4 py-2.5 fade-in slide-in-from-bottom-1">
                <MinusCircleIcon className="text-slate-400" />
                <span className="flex-1 truncate text-sm">{path}</span>
                <span className="text-xs text-slate-400">skipped</span>
            </div>
        );
    }

    return (
        <div className="flex animate-in items-center gap-2.5 px-4 py-2.5 fade-in slide-in-from-bottom-1">
            <SpinnerIcon className="text-slate-400" />
            <span className="flex-1 truncate text-sm">{path}</span>
            <span className="text-xs text-slate-400">scanning…</span>
        </div>
    );
}

function CrawlingPanel({
    scanProgress,
    scanUrls,
    onCancel,
}: {
    scanProgress: ScanProgress;
    scanUrls: Record<string, ScannedUrl>;
    onCancel: () => void;
}) {
    const scanned = scanProgress.completedRequests ?? 0;
    const total = scanProgress.totalRequests ?? 0;
    const pct =
        total > 0
            ? Math.round((scanned / total) * 100)
            : (scanProgress.progressPercentage ?? 0);
    const issuesCount = countIssues(scanUrls);

    const orderedUrls = Object.entries(scanUrls).filter(
        ([, e]) => e.status && e.status !== 'started',
    );

    return (
        <>
            <div className="mb-6 flex items-start justify-between gap-4">
                <h1 className="font-display text-xl font-medium">
                    checking every page for accessibility issues
                </h1>
                <CancelButton onCancel={onCancel} />
            </div>

            <ProgressBar value={pct} className="mb-2" />
            <p className="mb-8 text-xs text-slate-400 dark:text-slate-500">
                {scanned} of {total} pages
            </p>

            <div className="mb-8 grid grid-cols-3 gap-3">
                <MetricCard label="pages found" value={total} />
                <MetricCard label="pages scanned" value={scanned} />
                <MetricCard
                    label="issues found so far"
                    value={issuesCount}
                    tone="warning"
                />
            </div>

            <p className="mb-2 text-xs text-slate-400 dark:text-slate-500">
                activity
            </p>
            <div
                role="log"
                aria-live="polite"
                className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800"
            >
                {orderedUrls.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                        starting crawl…
                    </div>
                ) : (
                    orderedUrls.map(([url, entry]) => (
                        <FeedRow key={url} url={url} entry={entry} />
                    ))
                )}
            </div>
        </>
    );
}

function ReportCta({
    auditId,
    issuesCount,
}: {
    auditId: string;
    issuesCount: number;
}) {
    return (
        <div className="mt-6 flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3.5 dark:bg-emerald-900/20">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
                <span className="font-medium">audit complete</span> —{' '}
                {issuesCount} issue{issuesCount !== 1 ? 's' : ''} found
            </p>
            <Button size="sm" asChild>
                <Link href={result(auditId).url}>
                    view report
                    <ArrowRightIcon />
                </Link>
            </Button>
        </div>
    );
}

export default function Progress({
    scanInfo,
    scanProgress,
    scanQueue,
    scanUrls,
}: ScanProgressPageProps) {
    const domain = hostnameOf(scanInfo.siteUrl);

    useEchoPublic<WsEvents>(
        `audit-${scanInfo.auditId}-scanning`,
        [
            '.audit.queued',
            '.audit.started',
            '.audit.progress',
            '.audit.completed',
            '.audit.failed',
            '.audit.cancelled',
            '.audit.page.started',
            '.audit.page.skipped',
            '.audit.page.failed',
            '.audit.page.completed',
        ],
        (e) => {
            if (e.type === 'audit.queued') {
                const data = (e as QueuedWsEvent).data;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanQueue: omit(data, ['auditId']),
                    }),
                });
            } else if (e.type === 'audit.started') {
                const { timestamp } = e as StartedWsEvent;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanInfo: {
                            ...current.scanInfo,
                            status: 'started',
                            startedAt: timestamp,
                        },
                    }),
                });
            } else if (e.type === 'audit.progress') {
                const { data } = e as ProgressWsEvent;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanProgress: { ...data },
                    }),
                });
            } else if (e.type === 'audit.completed') {
                const { timestamp } = e as CompletedWsEvent;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanInfo: {
                            ...current.scanInfo,
                            status: 'completed',
                            completedAt: timestamp,
                        },
                    }),
                });
            } else if (e.type === 'audit.failed') {
                const { error } = (e as FailedWsEvent).data;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanInfo: {
                            ...current.scanInfo,
                            status: 'failed',
                            failureReason: error,
                        },
                    }),
                });
            } else if (e.type === 'audit.cancelled') {
                const { timestamp } = e as CancelledWsEvent;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanInfo: {
                            ...current.scanInfo,
                            status: 'cancelled',
                            cancelledAt: timestamp,
                        },
                    }),
                });
            } else if (e.type === 'audit.page.started') {
                const { data, timestamp } = e as PageStartedWsEvent;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanUrls: {
                            ...current.scanUrls,
                            [data.pageUrl]: {
                                status: 'started',
                                attemptsCount: data.attemptsCount,
                                startedAt: timestamp,
                            },
                        },
                    }),
                });
            } else if (e.type === 'audit.page.skipped') {
                const { data, timestamp } = e as PageSkippedWsEvent;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanUrls: {
                            ...current.scanUrls,
                            [data.pageUrl]: {
                                status: 'skipped',
                                skippingReason: data.reason,
                                skippedAt: timestamp,
                            },
                        },
                    }),
                });
            } else if (e.type === 'audit.page.failed') {
                const { data, timestamp } = e as PageFailedWsEvent;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanUrls: {
                            ...current.scanUrls,
                            [data.pageUrl]: {
                                ...current.scanUrls[data.pageUrl],
                                status: 'failed',
                                errorMessage: data.errorMessage,
                                attemptsCount: data.attemptsCount,
                                failedAt: timestamp,
                            },
                        },
                    }),
                });
            } else if (e.type === 'audit.page.completed') {
                const { data, timestamp } = e as PageCompletedWsEvent;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanUrls: {
                            ...current.scanUrls,
                            [data.pageUrl]: {
                                ...current.scanUrls[data.pageUrl],
                                status: 'completed',
                                violationsCount: data.violationsCount,
                                passesCount: data.passesCount,
                                severityBreakdown: data.severityBreakdown,
                                completedAt: timestamp,
                            },
                        },
                    }),
                });
            }
        },
    );

    const handleCancel = () => {
        if (
            !window.confirm(
                'Cancel this audit? It will stay in your history marked as cancelled.',
            )
        ) {
            return;
        }

        router.delete(cancel(scanInfo.auditId).url, {
            preserveScroll: true,
        });
    };

    const activePanel =
        scanInfo.status === 'started' || scanInfo.status === 'completed'
            ? 'crawling'
            : scanInfo.status === 'queued'
                ? 'waiting'
                : null;
    const issuesCount = countIssues(scanUrls);
    const badge = SCAN_STATUS_BADGE[scanInfo.status];

    return (
        <>
            <Head title={`Auditing ${domain}`} />

            <main className="mx-auto container py-10">
                <div className="mb-6 flex items-center justify-between">
                    <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <GlobeIcon />
                        {domain}
                    </p>
                    <StatusBadge status={badge.status} label={badge.label} />
                </div>

                {activePanel === 'waiting' && (
                    <WaitingPanel
                        scanQueue={scanQueue}
                        onCancel={handleCancel}
                    />
                )}
                {activePanel === 'crawling' && (
                    <CrawlingPanel
                        scanProgress={scanProgress}
                        scanUrls={scanUrls}
                        onCancel={handleCancel}
                    />
                )}

                {scanInfo.status === 'completed' && (
                    <ReportCta
                        auditId={scanInfo.auditId}
                        issuesCount={issuesCount}
                    />
                )}

                {scanInfo.status === 'failed' && (
                    <Callout
                        variant="danger"
                        title="Scan failed."
                        className="mt-6"
                    >
                        {scanInfo.failureReason ??
                            'An unexpected error occurred.'}
                    </Callout>
                )}

                {scanInfo.status === 'cancelled' && (
                    <Callout title="Audit cancelled." className="mt-6">
                        No report will be generated for this run.
                    </Callout>
                )}
            </main>
        </>
    );
}
