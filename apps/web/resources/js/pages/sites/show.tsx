import { Head, Link } from '@inertiajs/react';
import { show as auditShow, progress } from '@/routes/audit';
import { show, index as sitesIndex } from '@/routes/sites';
import { SCAN_STATUS_BADGE } from '@/lib/audit-status';
import { humanReadableDateTime, relativeTimeUntil, str } from '@/lib/utils';
import {
    type CurrentAudit,
    CurrentAuditCard,
} from '@/components/scanning/current-audit-card';
import { runNewAudit } from '@/components/scanning/run-new-audit';
import { ScoreTrendChart } from '@/components/reporting/score-trend-chart';
import type { ScanStatus } from '@/types';
import {
    ArrowRightIcon,
    Button,
    SectionLabel,
    StatPair,
    StatusBadge,
    SurfacePanel,
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
    status: ScanStatus;
    score: number | null;
    issuesFound: number | null;
    requestedAt: string;
};

type IssuesSnapshot = {
    critical: number;
    quickWins: number;
};

type Rescan = {
    availableAt: string | null;
};

type SiteShowProps = {
    domain: string;
    currentAudit: CurrentAudit;
    issuesSnapshot: IssuesSnapshot | null;
    scoreTrend: HistoryRow[];
    history: HistoryRow[];
    lastAuditUrl: string;
    rescan: Rescan;
};

function HistoryTableRow({ row }: { row: HistoryRow }) {
    const isActive = row.status === 'queued' || row.status === 'started';

    return (
        <TableRow
            className={
                isActive ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : undefined
            }
        >
            <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {row.auditId}
            </TableCell>
            <TableCell>
                <StatusBadge {...SCAN_STATUS_BADGE[row.status]} />
            </TableCell>
            <TableCell
                className={
                    row.score === null
                        ? 'text-slate-400 dark:text-slate-500'
                        : 'font-medium tabular-nums'
                }
            >
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
                        href={
                            auditShow(row.auditId, { query: { from: 'site' } })
                                .url
                        }
                        className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                    >
                        view report
                    </Link>
                )}
                {isActive && (
                    <Link
                        href={progress(row.auditId).url}
                        className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                    >
                        view progress
                    </Link>
                )}
            </TableCell>
        </TableRow>
    );
}

export default function Show({
    domain,
    currentAudit,
    issuesSnapshot,
    scoreTrend,
    history,
    lastAuditUrl,
    rescan,
}: SiteShowProps) {
    const rescanBlocked =
        rescan.availableAt !== null &&
        new Date(rescan.availableAt).getTime() > Date.now();
    const rescanCaption = rescanBlocked
        ? `next scan available in ${relativeTimeUntil(rescan.availableAt as string)}`
        : undefined;

    return (
        <>
            <Head title={`Audit history for ${domain}`} />

            <main className="container mx-auto py-10">
                <Link
                    href={sitesIndex().url}
                    className="mb-3 inline-block text-xs text-slate-500 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
                >
                    ← your sites
                </Link>

                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-xl font-medium">
                            {domain}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {history.length}{' '}
                            {str.plural('audit', history.length)} run
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Button
                            size="sm"
                            onClick={() => runNewAudit(lastAuditUrl)}
                            disabled={rescanBlocked}
                            title={rescanCaption}
                        >
                            run new audit
                            <ArrowRightIcon />
                        </Button>
                        {rescanCaption && (
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                {rescanCaption}
                            </p>
                        )}
                    </div>
                </div>

                <CurrentAuditCard audit={currentAudit} />

                {scoreTrend.length >= 2 && (
                    <div className="mb-8">
                        <SectionLabel className="mb-2">
                            score trend
                        </SectionLabel>
                        <SurfacePanel padding="sm">
                            <ScoreTrendChart data={scoreTrend} />
                        </SurfacePanel>
                    </div>
                )}

                {issuesSnapshot && (
                    <div className="mb-8">
                        <SectionLabel className="mb-2">
                            open issues
                        </SectionLabel>
                        <StatPair
                            items={[
                                {
                                    value: issuesSnapshot.critical,
                                    label: 'critical issues',
                                },
                                {
                                    value: issuesSnapshot.quickWins,
                                    label: 'quick wins available',
                                },
                            ]}
                        />
                    </div>
                )}

                <SectionLabel className="mb-2">history</SectionLabel>
                <TableCard>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-900">
                                <TableHead>ID</TableHead>
                                <TableHead>status</TableHead>
                                <TableHead>score</TableHead>
                                <TableHead>issues found</TableHead>
                                <TableHead>requested</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((row) => (
                                <HistoryTableRow key={row.auditId} row={row} />
                            ))}
                        </TableBody>
                    </Table>
                </TableCard>
            </main>
        </>
    );
}

Show.layout = (props: SiteShowProps) => ({
    breadcrumbs: [
        { title: 'Sites', href: sitesIndex() },
        { title: props.domain, href: show(props.domain) },
    ],
});
