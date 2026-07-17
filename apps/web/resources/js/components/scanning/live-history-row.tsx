import { Link } from '@inertiajs/react';
import { progress } from '@/routes/audit';
import { show as siteShow } from '@/routes/sites';
import { SCAN_STATUS_BADGE } from '@/lib/audit-status';
import { useAuditLiveStatus } from '@/hooks/use-audit-live-status';
import type { ScanProgress, ScanQueue, ScanStatus } from '@/types';
import { StatusBadge, TableCell, TableRow } from '@equalsite/ui';
import { ScanProgressCell } from './scan-progress-cell';

export type HistoryRow = {
    auditId: string;
    domain: string;
    status: ScanStatus;
    score: number | null;
    issuesFound: number | null;
    scanQueue: ScanQueue | null;
    scanProgress: ScanProgress | null;
    requestedAt: string;
};

export function LiveHistoryRow({ row }: { row: HistoryRow }) {
    const { status, scanQueue, scanProgress } = useAuditLiveStatus({
        auditId: row.auditId,
        initialStatus: row.status,
        initialScanQueue: row.scanQueue,
        initialScanProgress: row.scanProgress,
        reloadProps: ['history'],
    });

    return (
        <TableRow className="bg-indigo-50/40 dark:bg-indigo-900/10">
            <TableCell className="font-medium">
                <Link
                    href={siteShow(row.domain).url}
                    className="hover:underline"
                >
                    {row.domain}
                </Link>
            </TableCell>
            <TableCell>
                <StatusBadge {...SCAN_STATUS_BADGE[status]} />
            </TableCell>
            <TableCell colSpan={2}>
                <ScanProgressCell
                    status={status}
                    scanQueue={scanQueue}
                    scanProgress={scanProgress}
                />
            </TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">
                running now
            </TableCell>
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
