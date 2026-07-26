import usePagination from '@/hooks/use-pagination';
import { friendlyErrorMessage } from '@/lib/audit-errors';
import { pathWithQueryOf } from '@/lib/utils';
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
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { CancelButton } from './cancel-button';

export function countIssues(scanUrls: AuditPage[]) {
    return scanUrls.reduce((sum, u) => sum + (u.violationsCount ?? 0), 0);
}

export function countFailedPages(scanUrls: AuditPage[]) {
    return scanUrls.filter((u) => u.status === 'failed').length;
}

// Icon/label crossfade for a row whose status just changed in place —
// deliberately separate from the row-level enter animation below, which
// only ever plays once, the first time a URL appears in the feed.
const STATUS_TRANSITION_CLASSES = 'animate-in fade-in zoom-in-90 duration-300';
const STATUS_FLASH_DURATION_MS = 900;

const FeedRow = memo(function FeedRow({
    entry,
    isNew,
}: {
    entry: AuditPage;
    isNew: boolean;
}) {
    const path = pathWithQueryOf(entry.url);

    const prevStatusRef = useRef(entry.status);
    const [justUpdated, setJustUpdated] = useState(false);

    useEffect(() => {
        if (prevStatusRef.current === entry.status) {
            return;
        }
        prevStatusRef.current = entry.status;
        setJustUpdated(true);
        const timeout = setTimeout(
            () => setJustUpdated(false),
            STATUS_FLASH_DURATION_MS,
        );
        return () => clearTimeout(timeout);
    }, [entry.status]);

    const rowClasses = `flex items-center gap-2.5 px-4 py-2.5 transition-colors duration-700 ${
        isNew
            ? 'animate-in fade-in slide-in-from-bottom-1'
            : justUpdated
              ? 'bg-slate-50 dark:bg-slate-800/60'
              : ''
    }`;
    switch (entry.status) {
        case 'completed': {
            const count = entry.violationsCount ?? 0;
            const critical = entry.criticalCount ?? 0;
            const serious = entry.seriousCount ?? 0;
            const isCritical = critical > 0;
            const isModerate = !isCritical && serious > 0;

            return (
                <div className={rowClasses}>
                    <span
                        key={entry.status}
                        className={`inline-flex ${STATUS_TRANSITION_CLASSES}`}
                    >
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
                    </span>
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

        case 'failed':
            return (
                <div className={rowClasses}>
                    <span
                        key={entry.status}
                        className={`inline-flex ${STATUS_TRANSITION_CLASSES}`}
                    >
                        <XCircleIcon className="text-red-500" />
                    </span>
                    <span className="flex-1 truncate text-sm">{path}</span>
                    <span className="text-xs text-red-500">
                        {friendlyErrorMessage(entry.errorCode)}
                    </span>
                </div>
            );

        case 'skipped':
            return (
                <div className={rowClasses}>
                    <span
                        key={entry.status}
                        className={`inline-flex ${STATUS_TRANSITION_CLASSES}`}
                    >
                        <MinusCircleIcon className="text-slate-400" />
                    </span>
                    <span className="flex-1 truncate text-sm">{path}</span>
                    <span className="text-xs text-slate-400">skipped</span>
                </div>
            );

        case 'started':
            return (
                <div className={rowClasses}>
                    <SpinnerIcon className="text-slate-400" />
                    <span className="flex-1 truncate text-sm">{path}</span>
                    <span className="text-xs text-slate-400">scanning…</span>
                </div>
            );
    }
});

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

    const orderedUrls = useMemo(
        () =>
            [...scanUrls].sort((a, b) =>
                b.createdAt.localeCompare(a.createdAt),
            ),
        [scanUrls],
    );

    const {
        currentItems: pagedUrls,
        currentPage,
        totalPages,
        nextPage,
        prevPage,
        firstPage,
        lastPage,
    } = usePagination(orderedUrls, 15);

    const seenUrlsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        pagedUrls.forEach((entry) => seenUrlsRef.current.add(entry.url));
    }, [pagedUrls]);

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
                        <FeedRow
                            key={entry.url}
                            entry={entry}
                            isNew={!seenUrlsRef.current.has(entry.url)}
                        />
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
