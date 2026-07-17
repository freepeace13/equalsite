import { Link, router } from '@inertiajs/react';
import { show as auditShow, cancel, progress } from '@/routes/audit';
import { scanProgressPercent } from '@/lib/audit-status';
import { str } from '@/lib/utils';
import { useAuditLiveStatus } from '@/hooks/use-audit-live-status';
import type { ScanProgress, ScanQueue, ScanStatus } from '@/types';
import { Button, ProgressBar, StatusBadge } from '@equalsite/ui';
import { runNewAudit } from './run-new-audit';

export type CurrentAudit = {
    auditId: string;
    siteUrl: string;
    status: ScanStatus;
    failureReason: string | null;
    score: number | null;
    issuesFound: number | null;
    scanQueue: ScanQueue | null;
    scanProgress: ScanProgress | null;
};

const CARD_SHELL: Record<ScanStatus, string> = {
    queued: 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-900/10',
    started:
        'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-900/10',
    completed:
        'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-900/10',
    cancelled:
        'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40',
    failed: 'border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-900/10',
};

export function CurrentAuditCard({ audit }: { audit: CurrentAudit }) {
    const { status, scanQueue, scanProgress } = useAuditLiveStatus({
        auditId: audit.auditId,
        initialStatus: audit.status,
        initialScanQueue: audit.scanQueue,
        initialScanProgress: audit.scanProgress,
        reloadProps: [
            'currentAudit',
            'issuesSnapshot',
            'scoreTrend',
            'history',
        ],
    });

    const handleCancel = () => {
        if (
            !window.confirm(
                "cancel this audit? it'll stay in your history marked as cancelled.",
            )
        ) {
            return;
        }
        router.delete(cancel(audit.auditId).url);
    };

    const pct = scanProgressPercent(scanProgress);
    const scanned = scanProgress?.completedRequests ?? 0;
    const total = scanProgress?.totalRequests ?? 0;

    return (
        <div
            className={`mb-8 rounded-lg border p-5 transition-colors ${CARD_SHELL[status]}`}
        >
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
                            <Link href={progress(audit.auditId).url}>
                                view progress
                            </Link>
                        </Button>
                        <Button
                            variant="ghost-destructive"
                            size="sm"
                            onClick={handleCancel}
                        >
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
                                <Link href={progress(audit.auditId).url}>
                                    view progress
                                </Link>
                            </Button>
                            <Button
                                variant="ghost-destructive"
                                size="sm"
                                onClick={handleCancel}
                            >
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
                            score {audit.score} — {audit.issuesFound}{' '}
                            {str.plural('issue', audit.issuesFound ?? 0)} found
                        </p>
                    </div>
                    <Button size="sm" asChild>
                        <Link
                            href={
                                auditShow(audit.auditId, {
                                    query: { from: 'site' },
                                }).url
                            }
                        >
                            view report
                        </Link>
                    </Button>
                </div>
            )}

            {status === 'cancelled' && (
                <div className="flex items-center justify-between gap-4">
                    <StatusBadge status="cancelled" />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runNewAudit(audit.siteUrl)}
                    >
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
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runNewAudit(audit.siteUrl)}
                    >
                        try again
                    </Button>
                </div>
            )}
        </div>
    );
}
