import usePagination from '@/hooks/use-pagination';
import { friendlyErrorMessage } from '@/lib/audit-errors';
import { pathnameOf } from '@/lib/utils';
import type { AuditPage, ScanProgress } from '@/types';
import {
    AlertTriangleIcon,
    CheckCircleIcon,
    MetricCard,
    MinusCircleIcon,
    ProgressBar,
    SpinnerIcon,
    XCircleIcon,
} from '@equalsite/ui';
import { CancelButton } from './cancel-button';

export function countIssues(scanUrls: AuditPage[]) {
    return scanUrls.reduce((sum, u) => sum + (u.violationsCount ?? 0), 0);
}

export function countFailedPages(scanUrls: AuditPage[]) {
    return scanUrls.filter((u) => u.status === 'failed').length;
}

function FeedRow({ entry }: { entry: AuditPage }) {
    const path = pathnameOf(entry.url);

    if (entry.status === 'completed') {
        const count = entry.violationsCount ?? 0;
        const critical = entry.criticalCount ?? 0;
        const serious = entry.seriousCount ?? 0;
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
                <span className="text-xs text-red-500">
                    {friendlyErrorMessage(entry.errorCode)}
                </span>
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

export function CrawlingPanel({
    scanProgress,
    scanUrls,
    onCancel,
}: {
    scanProgress: ScanProgress;
    scanUrls: AuditPage[];
    onCancel: () => void;
}) {
    const scanned = scanProgress.completedRequests ?? 0;
    const total = scanProgress.totalRequests ?? 0;
    const pct =
        total > 0
            ? Math.round((scanned / total) * 100)
            : (scanProgress.progressPercentage ?? 0);
    const issuesCount = countIssues(scanUrls);

    const orderedUrls = scanUrls
        .filter((e) => e.status !== 'started')
        .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));

    const {
        currentItems: pagedUrls,
        currentPage,
        totalPages,
        nextPage,
        prevPage,
        firstPage,
        lastPage,
    } = usePagination(orderedUrls, 15);

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
                    pagedUrls.map((entry) => (
                        <FeedRow key={entry.url} entry={entry} />
                    ))
                )}
            </div>
            {totalPages > 1 && (
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                    <button
                        type="button"
                        onClick={prevPage}
                        disabled={firstPage}
                        className="disabled:opacity-40"
                    >
                        Previous
                    </button>
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        type="button"
                        onClick={nextPage}
                        disabled={lastPage}
                        className="disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </>
    );
}
