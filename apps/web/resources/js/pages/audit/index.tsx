import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { AuditRequestModal } from '@/components/audit-request-modal';
import { index, show } from '@/routes/audit';
import { show as siteShow } from '@/routes/sites';
import { SCAN_STATUS_BADGE, isActiveStatus } from '@/lib/audit-status';
import { humanReadableDateTime, str } from '@/lib/utils';
import {
    type HistoryRow,
    LiveHistoryRow,
} from '@/components/scanning/live-history-row';
import {
    ArrowRightIcon,
    Button,
    EmptyState,
    SectionLabel,
    StatusBadge,
    Table,
    TableBody,
    TableCard,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@equalsite/ui';

type AuditIndexProps = {
    history: HistoryRow[];
};

function HistoryTableRow({ row }: { row: HistoryRow }) {
    return (
        <TableRow>
            <TableCell className="font-medium">
                <Link
                    href={siteShow(row.domain).url}
                    className="hover:underline"
                >
                    {row.domain}
                </Link>
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
                        href={show(row.auditId).url}
                        className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                    >
                        view report
                    </Link>
                )}
            </TableCell>
        </TableRow>
    );
}

export default function Index({ history }: AuditIndexProps) {
    const [auditFormOpen, setAuditFormOpen] = useState(false);

    return (
        <>
            <Head title="Your audits" />

            <main className="container mx-auto py-10">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-xl font-medium">
                            your audits
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {history.length}{' '}
                            {str.plural('audit', history.length)} run across all
                            your sites
                        </p>
                    </div>
                    <Button size="sm" onClick={() => setAuditFormOpen(true)}>
                        run a new audit
                        <ArrowRightIcon />
                    </Button>
                </div>

                {history.length === 0 ? (
                    <EmptyState
                        title="no audits yet"
                        description="run one above and it'll show up here, along with the rest of your audit history."
                    />
                ) : (
                    <>
                        <SectionLabel className="mb-2">history</SectionLabel>
                        <TableCard>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 dark:bg-slate-900">
                                        <TableHead>domain</TableHead>
                                        <TableHead>status</TableHead>
                                        <TableHead>score</TableHead>
                                        <TableHead>issues found</TableHead>
                                        <TableHead>requested</TableHead>
                                        <TableHead />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map((row) =>
                                        isActiveStatus(row.status) ? (
                                            <LiveHistoryRow
                                                key={row.auditId}
                                                row={row}
                                            />
                                        ) : (
                                            <HistoryTableRow
                                                key={row.auditId}
                                                row={row}
                                            />
                                        ),
                                    )}
                                </TableBody>
                            </Table>
                        </TableCard>
                    </>
                )}
            </main>

            <AuditRequestModal
                open={auditFormOpen}
                onOpenChange={setAuditFormOpen}
            />
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Audits',
            href: index(),
        },
    ],
};
