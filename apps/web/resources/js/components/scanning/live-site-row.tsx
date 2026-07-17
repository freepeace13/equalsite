import { Link } from '@inertiajs/react';
import { progress } from '@/routes/audit';
import { show } from '@/routes/sites';
import { SCAN_STATUS_BADGE } from '@/lib/audit-status';
import { useAuditLiveStatus } from '@/hooks/use-audit-live-status';
import type { ScanProgress, ScanQueue, ScanStatus } from '@/types';
import { StatusBadge, TableCell, TableRow } from '@equalsite/ui';
import { ScanProgressCell } from './scan-progress-cell';

export type Site = {
    domain: string;
    auditCount: number;
    lastRunAt: string;
    auditId: string;
    status: ScanStatus;
    score: number | null;
    scanQueue: ScanQueue | null;
    scanProgress: ScanProgress | null;
};

export function LiveSiteRow({ site }: { site: Site }) {
    const { status, scanProgress } = useAuditLiveStatus({
        auditId: site.auditId,
        initialStatus: site.status,
        initialScanQueue: site.scanQueue,
        initialScanProgress: site.scanProgress,
        reloadProps: ['sites'],
    });

    return (
        <TableRow className="bg-indigo-50/40 dark:bg-indigo-900/10">
            <TableCell className="font-medium">
                <Link href={show(site.domain).url} className="hover:underline">
                    {site.domain}
                </Link>
            </TableCell>
            <TableCell>
                <StatusBadge {...SCAN_STATUS_BADGE[status]} />
            </TableCell>
            <TableCell>
                <ScanProgressCell
                    status={status}
                    scanQueue={site.scanQueue}
                    scanProgress={scanProgress}
                />
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
