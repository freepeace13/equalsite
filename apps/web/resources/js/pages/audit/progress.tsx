import { Head, Link, router } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import { PublicHeader } from '@/components/public-header';
import { result } from '@/routes/audit';
import { omit } from '@/lib/obj';
import type { ScanInfo, ScanProgress, ScanQueue, ScannedUrl } from '@/types';
import type {
    CompletedWsEvent, FailedWsEvent,
    PageCompletedWsEvent, PageFailedWsEvent,
    PageSkippedWsEvent, PageStartedWsEvent,
    ProgressWsEvent, QueuedWsEvent, StartedWsEvent,
} from '@equalsite/types';

type ScanProgressPageProps = {
    scanInfo: ScanInfo;
    scanProgress: ScanProgress;
    scanQueue: ScanQueue;
    scanUrls: Record<string, ScannedUrl>;
};

type WsEvents =
    | QueuedWsEvent | StartedWsEvent | ProgressWsEvent
    | CompletedWsEvent | FailedWsEvent
    | PageStartedWsEvent | PageFailedWsEvent
    | PageSkippedWsEvent | PageCompletedWsEvent;

function StatusBadge({ status }: { status: ScanInfo['status'] }) {
    if (status === 'started') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs px-3 py-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                    <path d="M21 12a9 9 0 11-3.5-7.1" />
                </svg>
                crawling
            </span>
        );
    }
    if (status === 'completed') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs px-3 py-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
                </svg>
                complete
            </span>
        );
    }
    if (status === 'failed') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs px-3 py-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
                </svg>
                failed
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-3 py-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            queued
        </span>
    );
}

function WaitingPanel({ scanQueue }: { scanQueue: ScanQueue }) {
    const position = scanQueue.position ?? 0;
    const estMinutes = Math.max(1, Math.round(position * 1.5));
    const totalDots = Math.max(position + 2, 4);

    return (
        <>
            <h1 className="font-display text-xl font-medium mb-1">your audit is in line</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                we'll start crawling as soon as a slot opens up — this page updates on its own.
            </p>

            <div className="flex items-center justify-center gap-8 rounded-lg bg-slate-100 dark:bg-slate-800/60 py-7 mb-6">
                <div className="text-center">
                    <p className="text-3xl font-medium leading-none">{position}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">position in queue</p>
                </div>
                <div className="w-px h-10 bg-slate-300 dark:bg-slate-700" />
                <div className="text-center">
                    <p className="text-3xl font-medium leading-none">~{estMinutes}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">min estimated wait</p>
                </div>
            </div>

            <div className="flex items-center gap-1 mb-6" aria-hidden="true">
                {Array.from({ length: totalDots }).map((_, i) => (
                    <div
                        key={i}
                        className={`flex-1 h-1.5 rounded-full ${i < (totalDots - position) ? 'bg-indigo-700' : 'bg-slate-200 dark:bg-slate-800'}`}
                    />
                ))}
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-3.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
                    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                </svg>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    2 audits run at a time so every scan gets a full, accurate crawl. no need to keep this tab open — bookmark the link to check back later.
                </p>
            </div>
        </>
    );
}

type UrlStatus = 'started' | 'completed' | 'failed' | 'skipped';

function FeedRow({ url, entry }: { url: string; entry: ScannedUrl }) {
    const status = entry.status as UrlStatus | undefined;
    const path = (() => {
        try { return new URL(url).pathname || '/'; } catch { return url; }
    })();

    if (status === 'completed') {
        const count = entry.violationsCount ?? 0;
        const critical = entry.severityBreakdown?.critical ?? 0;
        const serious = entry.severityBreakdown?.serious ?? 0;
        const isCritical = critical > 0;
        const isModerate = !isCritical && serious > 0;

        return (
            <div className="flex items-center gap-2.5 px-4 py-2.5 animate-in fade-in slide-in-from-bottom-1">
                {count === 0 ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600 dark:text-emerald-400 shrink-0">
                        <circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" />
                    </svg>
                ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 ${isCritical ? 'text-red-600 dark:text-red-400' : isModerate ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-500'}`}>
                        <path d="M12 9v4M12 17h.01M10.3 3.9L2.5 18a2 2 0 001.7 3h15.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
                    </svg>
                )}
                <span className="text-sm flex-1 truncate">{path}</span>
                <span className={`text-xs ${count === 0 ? 'text-emerald-600 dark:text-emerald-400' : isCritical ? 'text-red-600 dark:text-red-400' : isModerate ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-500'}`}>
                    {count === 0 ? 'no issues' : `${count} issue${count !== 1 ? 's' : ''}`}
                </span>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="flex items-center gap-2.5 px-4 py-2.5 animate-in fade-in slide-in-from-bottom-1">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 shrink-0">
                    <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
                </svg>
                <span className="text-sm flex-1 truncate">{path}</span>
                <span className="text-xs text-red-500">failed</span>
            </div>
        );
    }

    if (status === 'skipped') {
        return (
            <div className="flex items-center gap-2.5 px-4 py-2.5 animate-in fade-in slide-in-from-bottom-1">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
                    <circle cx="12" cy="12" r="10" /><path d="M8 12h8" />
                </svg>
                <span className="text-sm flex-1 truncate">{path}</span>
                <span className="text-xs text-slate-400">skipped</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2.5 px-4 py-2.5 animate-in fade-in slide-in-from-bottom-1">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 animate-spin shrink-0">
                <path d="M21 12a9 9 0 11-3.5-7.1" />
            </svg>
            <span className="text-sm flex-1 truncate">{path}</span>
            <span className="text-xs text-slate-400">scanning…</span>
        </div>
    );
}

function CrawlingPanel({ scanProgress, scanUrls }: { scanProgress: ScanProgress; scanUrls: Record<string, ScannedUrl> }) {
    const scanned = scanProgress.completedRequests ?? 0;
    const total = scanProgress.totalRequests ?? 0;
    const pct = total > 0 ? Math.round((scanned / total) * 100) : (scanProgress.progressPercentage ?? 0);
    const issuesCount = Object.values(scanUrls).reduce((sum, u) => sum + (u.violationsCount ?? 0), 0);

    const orderedUrls = Object.entries(scanUrls).filter(([, e]) => e.status && e.status !== 'started');

    return (
        <>
            <h1 className="font-display text-xl font-medium mb-6">
                checking every page for accessibility issues
            </h1>

            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-2">
                <div
                    className="h-full bg-indigo-700 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-8">
                {scanned} of {total} pages
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800/60 p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">pages found</p>
                    <p className="text-xl font-medium">{total}</p>
                </div>
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800/60 p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">pages scanned</p>
                    <p className="text-xl font-medium">{scanned}</p>
                </div>
                <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4">
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-1">issues found so far</p>
                    <p className="text-xl font-medium text-yellow-700 dark:text-yellow-400">{issuesCount}</p>
                </div>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">activity</p>
            <div role="log" aria-live="polite" className="rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden">
                {orderedUrls.length === 0 ? (
                    <div className="px-4 py-6 text-xs text-slate-400 dark:text-slate-500 text-center">starting crawl…</div>
                ) : (
                    orderedUrls.map(([url, entry]) => (
                        <FeedRow key={url} url={url} entry={entry} />
                    ))
                )}
            </div>
        </>
    );
}

function ReportCta({ auditId, issuesCount }: { auditId: string; issuesCount: number }) {
    return (
        <div className="mt-6 flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3.5">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
                <span className="font-medium">audit complete</span> — {issuesCount} issue{issuesCount !== 1 ? 's' : ''} found
            </p>
            <Link
                href={result(auditId).url}
                className="h-9 px-4 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-medium inline-flex items-center gap-1.5"
            >
                view report
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
            </Link>
        </div>
    );
}

export default function Progress({
    scanInfo,
    scanProgress,
    scanQueue,
    scanUrls,
}: ScanProgressPageProps) {
    const domain = (() => {
        try { return new URL(scanInfo.siteUrl).hostname; } catch { return scanInfo.siteUrl; }
    })();

    useEchoPublic<WsEvents>(
        `audit-${scanInfo.auditId}-scanning`,
        [
            '.audit.queued', '.audit.started', '.audit.progress', '.audit.completed',
            '.audit.failed', '.audit.page.started', '.audit.page.skipped',
            '.audit.page.failed', '.audit.page.completed',
        ],
        (e) => {
            if (e.type === 'audit.queued') {
                const data = (e as QueuedWsEvent).data;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({ ...current, scanQueue: omit(data, ['auditId']) }),
                });
            } else if (e.type === 'audit.started') {
                const { timestamp } = e as StartedWsEvent;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanInfo: { ...current.scanInfo, status: 'started', startedAt: timestamp },
                    }),
                });
            } else if (e.type === 'audit.progress') {
                const { data } = e as ProgressWsEvent;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({ ...current, scanProgress: { ...data } }),
                });
            } else if (e.type === 'audit.completed') {
                const { timestamp } = e as CompletedWsEvent;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanInfo: { ...current.scanInfo, status: 'completed', completedAt: timestamp },
                    }),
                });
            } else if (e.type === 'audit.failed') {
                const { error } = (e as FailedWsEvent).data;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanInfo: { ...current.scanInfo, status: 'failed', failureReason: error },
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
                            [data.pageUrl]: { status: 'started', attemptsCount: data.attemptsCount, startedAt: timestamp },
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
                            [data.pageUrl]: { status: 'skipped', skippingReason: data.reason, skippedAt: timestamp },
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

    const activePanel = scanInfo.status === 'started' || scanInfo.status === 'completed'
        ? 'crawling'
        : 'waiting';
    const issuesCount = Object.values(scanUrls).reduce((sum, u) => sum + (u.violationsCount ?? 0), 0);

    return (
        <>
            <Head title={`Auditing ${domain}`} />

            <PublicHeader />

            <main className="max-w-3xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M2 12h20M12 2a15 15 0 010 20 15 15 0 010-20z" />
                        </svg>
                        {domain}
                    </p>
                    <StatusBadge status={scanInfo.status} />
                </div>

                {activePanel === 'waiting' && <WaitingPanel scanQueue={scanQueue} />}
                {activePanel === 'crawling' && <CrawlingPanel scanProgress={scanProgress} scanUrls={scanUrls} />}

                {scanInfo.status === 'completed' && (
                    <ReportCta auditId={scanInfo.auditId} issuesCount={issuesCount} />
                )}

                {scanInfo.status === 'failed' && (
                    <div className="mt-6 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-4 py-3.5">
                        <p className="text-sm text-red-700 dark:text-red-400">
                            <strong>Scan failed.</strong>{' '}
                            {scanInfo.failureReason ?? 'An unexpected error occurred.'}
                        </p>
                    </div>
                )}
            </main>
        </>
    );
}
