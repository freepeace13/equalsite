import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { AuditRequestModal } from '@/components/audit-request-modal';
import { PublicHeader } from '@/components/public-header';
import { dashboard } from '@/routes';
import { index, show } from '@/routes/sites';
import { isActiveStatus, SCAN_STATUS_BADGE } from '@/lib/audit-status';
import { humanReadableDateTime, str } from '@/lib/utils';
import { LiveSiteRow, type Site } from '@/components/scanning/live-site-row';
import {
    ArrowRightIcon,
    Button,
    EmptyState,
    StatusBadge,
    Table,
    TableBody,
    TableCard,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@equalsite/ui';

type SitesIndexProps = {
    sites: Site[];
};

function ScoreCell({ score }: { score: number | null }) {
    if (score === null) {
        return <span className="text-slate-400 dark:text-slate-500">—</span>;
    }

    const tone =
        score >= 90
            ? 'text-emerald-600 dark:text-emerald-400'
            : score >= 60
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-red-600 dark:text-red-400';

    return <span className={`font-medium tabular-nums ${tone}`}>{score}</span>;
}

function SiteRow({ site }: { site: Site }) {
    return (
        <TableRow>
            <TableCell className="font-medium">
                <Link href={show(site.domain).url} className="hover:underline">
                    {site.domain}
                </Link>
            </TableCell>
            <TableCell>
                <StatusBadge {...SCAN_STATUS_BADGE[site.status]} />
            </TableCell>
            <TableCell>
                <ScoreCell score={site.score} />
            </TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">
                {site.auditCount}
            </TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">
                {humanReadableDateTime(site.lastRunAt)}
            </TableCell>
            <TableCell className="text-right">
                <Link
                    href={show(site.domain).url}
                    className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                >
                    view site
                </Link>
            </TableCell>
        </TableRow>
    );
}

export default function Index({ sites }: SitesIndexProps) {
    const [auditFormOpen, setAuditFormOpen] = useState(false);

    return (
        <>
            <Head title="Your sites" />

            <main className="container mx-auto py-10">
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-xl font-medium">
                            your sites
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {sites.length} {str.plural('site', sites.length)}{' '}
                            tracked
                        </p>
                    </div>
                    {sites.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setAuditFormOpen(true)}
                            className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                        >
                            run a new audit
                        </button>
                    )}
                </div>

                {sites.length === 0 ? (
                    <EmptyState
                        title="no sites yet"
                        description="run your first audit and it'll show up here, grouped with the rest of that site's history."
                        action={
                            <Button
                                size="sm"
                                onClick={() => setAuditFormOpen(true)}
                            >
                                run your first audit
                                <ArrowRightIcon />
                            </Button>
                        }
                    />
                ) : (
                    <TableCard>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 dark:bg-slate-900">
                                    <TableHead>domain</TableHead>
                                    <TableHead>status</TableHead>
                                    <TableHead>score</TableHead>
                                    <TableHead>audits</TableHead>
                                    <TableHead>last run</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sites.map((site) =>
                                    isActiveStatus(site.status) ? (
                                        <LiveSiteRow
                                            key={site.domain}
                                            site={site}
                                        />
                                    ) : (
                                        <SiteRow
                                            key={site.domain}
                                            site={site}
                                        />
                                    ),
                                )}
                            </TableBody>
                        </Table>
                    </TableCard>
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
            title: 'Sites',
            href: index(),
        },
    ],
};
