import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { PublicHeader } from '@/components/public-header';
import { create } from '@/routes/audit';

type CardState = 'queued' | 'processing' | 'complete' | 'cancelled' | 'failed';

const CARD_SHELL: Record<CardState, string> = {
    queued: 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-900/10',
    processing:
        'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-900/10',
    complete:
        'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-900/10',
    cancelled:
        'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40',
    failed: 'border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-900/10',
};

const HISTORY_ROWS = [
    {
        site: 'acme-shop.com',
        status: 'complete' as const,
        score: '65',
        pagesWithIssues: '14 / 22',
        issuesFound: '31',
        runtime: '1m 48s',
        requested: 'Jun 28',
    },
    {
        site: 'acme-shop.com/blog',
        status: 'cancelled' as const,
        score: '—',
        pagesWithIssues: '—',
        issuesFound: '—',
        runtime: '—',
        requested: 'Jun 25',
    },
    {
        site: 'acme-shop.com',
        status: 'complete' as const,
        score: '58',
        pagesWithIssues: '16 / 22',
        issuesFound: '39',
        runtime: '1m 52s',
        requested: 'Jun 18',
    },
];

function CurrentAuditCard({
    cardState,
    queuePos,
    processPct,
    onCancel,
}: {
    cardState: CardState;
    queuePos: number;
    processPct: number;
    onCancel: () => void;
}) {
    return (
        <div
            className={`mb-8 rounded-lg border p-5 transition-colors ${CARD_SHELL[cardState]}`}
        >
            {cardState === 'queued' && (
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                            queued
                        </p>
                        <p className="truncate text-sm font-medium">
                            acme-shop.com
                        </p>
                        <p className="mt-1 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                            position {queuePos} in queue · ~
                            {Math.max(1, Math.round(queuePos * 1.5))} min
                            estimated wait
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            className="flex h-9 items-center rounded-lg border border-indigo-300 px-3.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
                        >
                            view progress
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="h-9 rounded-lg px-3.5 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        >
                            cancel
                        </button>
                    </div>
                </div>
            )}

            {cardState === 'processing' && (
                <>
                    <div className="mb-3 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="animate-spin"
                                >
                                    <path d="M21 12a9 9 0 11-3.5-7.1" />
                                </svg>
                                processing
                            </p>
                            <p className="truncate text-sm font-medium">
                                acme-shop.com
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <button
                                type="button"
                                className="flex h-9 items-center rounded-lg border border-indigo-300 px-3.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
                            >
                                view progress
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="h-9 rounded-lg px-3.5 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                            >
                                cancel
                            </button>
                        </div>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-900/40">
                        <div
                            className="h-full rounded-full bg-indigo-700 transition-[width] duration-500 ease-out"
                            style={{ width: `${processPct}%` }}
                        />
                    </div>
                </>
            )}

            {cardState === 'complete' && (
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M9 12l2 2 4-4" />
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                            complete
                        </p>
                        <p className="truncate text-sm font-medium">
                            acme-shop.com — 31 issues found
                        </p>
                    </div>
                    <button
                        type="button"
                        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-indigo-700 px-3.5 text-xs font-medium text-white hover:bg-indigo-800"
                    >
                        view report
                    </button>
                </div>
            )}

            {cardState === 'cancelled' && (
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M6 6l12 12M18 6L6 18" />
                            </svg>
                            cancelled
                        </p>
                        <p className="truncate text-sm font-medium">
                            acme-shop.com
                        </p>
                    </div>
                    <Link
                        href={create().url}
                        className="flex h-9 shrink-0 items-center rounded-lg border border-slate-300 px-3.5 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/40"
                    >
                        run another
                    </Link>
                </div>
            )}

            {cardState === 'failed' && (
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-red-700 dark:text-red-400">
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M12 9v4M12 17h.01" />
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                            failed
                        </p>
                        <p className="truncate text-sm font-medium">
                            acme-shop.com — couldn't reach the site
                        </p>
                    </div>
                    <Link
                        href={create().url}
                        className="flex h-9 shrink-0 items-center rounded-lg border border-slate-300 px-3.5 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/40"
                    >
                        try again
                    </Link>
                </div>
            )}
        </div>
    );
}

function HistoryStatusBadge({ status }: { status: 'complete' | 'cancelled' }) {
    if (status === 'complete') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                >
                    <path d="M20 6L9 17l-5-5" />
                </svg>
                complete
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
            >
                <path d="M6 6l12 12M18 6L6 18" />
            </svg>
            cancelled
        </span>
    );
}

export default function Lobby() {
    const [cardState, setCardState] = useState<CardState>('queued');
    const [queuePos, setQueuePos] = useState(4);
    const [processPct, setProcessPct] = useState(0);

    useEffect(() => {
        if (cardState !== 'queued' && cardState !== 'processing') {
            return;
        }

        const interval = setInterval(() => {
            if (cardState === 'queued') {
                setQueuePos((pos) => {
                    const next = pos - 1;
                    if (next <= 0) {
                        setCardState('processing');
                    }
                    return next;
                });
            } else {
                setProcessPct((pct) => {
                    const next = pct + 20;
                    if (next >= 100) {
                        setCardState('complete');
                    }
                    return next;
                });
            }
        }, 1300);

        return () => clearInterval(interval);
    }, [cardState]);

    const handleCancel = () => {
        if (
            !window.confirm(
                'Cancel this audit? It will stay in your history marked as cancelled.',
            )
        ) {
            return;
        }
        setCardState('cancelled');
    };

    return (
        <>
            <Head title="Your audits" />

            <PublicHeader />

            <main className="mx-auto max-w-4xl px-6 py-10">
                <h1 className="mb-1 font-display text-xl font-medium">
                    your audits
                </h1>
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                    signed in as{' '}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                        jamie@acme-shop.com
                    </span>{' '}
                    · no password, just this link
                </p>

                <CurrentAuditCard
                    cardState={cardState}
                    queuePos={queuePos}
                    processPct={processPct}
                    onCancel={handleCancel}
                />

                <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        history
                    </p>
                    <Link
                        href={create().url}
                        className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                    >
                        run another audit
                    </Link>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-sm tabular-nums">
                        <thead>
                            <tr className="bg-slate-50 text-left text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                                <th className="px-4 py-2.5 font-medium">
                                    site
                                </th>
                                <th className="px-4 py-2.5 font-medium">
                                    status
                                </th>
                                <th className="px-4 py-2.5 font-medium">
                                    score
                                </th>
                                <th className="px-4 py-2.5 font-medium">
                                    pages w/ issues
                                </th>
                                <th className="px-4 py-2.5 font-medium">
                                    issues found
                                </th>
                                <th className="px-4 py-2.5 font-medium">
                                    runtime
                                </th>
                                <th className="px-4 py-2.5 font-medium">
                                    requested
                                </th>
                                <th className="px-4 py-2.5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {HISTORY_ROWS.map((row, i) => (
                                <tr
                                    key={i}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                >
                                    <td className="max-w-[140px] truncate px-4 py-3 font-medium">
                                        {row.site}
                                    </td>
                                    <td className="px-4 py-3">
                                        <HistoryStatusBadge
                                            status={row.status}
                                        />
                                    </td>
                                    <td
                                        className={`px-4 py-3 ${row.score === '—' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}
                                    >
                                        {row.score}
                                    </td>
                                    <td
                                        className={`px-4 py-3 ${row.pagesWithIssues === '—' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}
                                    >
                                        {row.pagesWithIssues}
                                    </td>
                                    <td
                                        className={`px-4 py-3 ${row.issuesFound === '—' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}
                                    >
                                        {row.issuesFound}
                                    </td>
                                    <td
                                        className={`px-4 py-3 ${row.runtime === '—' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}
                                    >
                                        {row.runtime}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                        {row.requested}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {row.status === 'complete' && (
                                            <button
                                                type="button"
                                                className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                                            >
                                                view report
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
}
