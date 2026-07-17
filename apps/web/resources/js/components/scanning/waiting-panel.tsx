import type { ScanQueue } from '@/types';
import { Callout, StatPair } from '@equalsite/ui';
import { CancelButton } from './cancel-button';

export function WaitingPanel({
    scanQueue,
    onCancel,
}: {
    scanQueue: ScanQueue;
    onCancel: () => void;
}) {
    const position = scanQueue.position ?? 0;
    const estMinutes = Math.max(1, Math.round(position * 1.5));
    const totalDots = Math.max(position + 2, 4);

    return (
        <>
            <div className="mb-1 flex items-start justify-between gap-4">
                <h1 className="font-display text-xl font-medium">
                    your audit is in line
                </h1>
                <CancelButton onCancel={onCancel} />
            </div>
            <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
                we'll start crawling as soon as a slot opens up — this page
                updates on its own.
            </p>

            <StatPair
                className="mb-6"
                items={[
                    { value: position, label: 'position in queue' },
                    { value: `~${estMinutes}`, label: 'min estimated wait' },
                ]}
            />

            <div className="mb-6 flex items-center gap-1" aria-hidden="true">
                {Array.from({ length: totalDots }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${i < totalDots - position ? 'bg-indigo-700' : 'bg-slate-200 dark:bg-slate-800'}`}
                    />
                ))}
            </div>

            <Callout>
                2 audits run at a time so every scan gets a full, accurate
                crawl. no need to keep this tab open — bookmark the link to
                check back later.
            </Callout>
        </>
    );
}
