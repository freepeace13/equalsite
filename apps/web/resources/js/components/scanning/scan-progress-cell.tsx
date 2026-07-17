import { scanProgressPercent } from '@/lib/audit-status';
import type { ScanProgress, ScanQueue, ScanStatus } from '@/types';
import { ProgressBar } from '@equalsite/ui';

export function ScanProgressCell({
    status,
    scanQueue,
    scanProgress,
}: {
    status: ScanStatus;
    scanQueue: ScanQueue | null;
    scanProgress: ScanProgress | null;
}) {
    if (status === 'started') {
        const pct = scanProgressPercent(scanProgress);
        const scanned = scanProgress?.completedRequests ?? 0;
        const total = scanProgress?.totalRequests ?? 0;

        return (
            <div className="min-w-32">
                <ProgressBar value={pct} size="sm" className="mb-1" />
                <p className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                    {scanned} of {total} pages
                </p>
            </div>
        );
    }

    return (
        <span className="text-xs text-slate-500 dark:text-slate-400">
            position {scanQueue?.position ?? '—'} in queue
        </span>
    );
}
