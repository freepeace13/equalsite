import { router } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import { useState } from 'react';
import type {
    CancelledWsEvent,
    CompletedWsEvent,
    FailedWsEvent,
    ProgressWsEvent,
    QueuedWsEvent,
    StartedWsEvent,
} from '@equalsite/types';
import type { ScanProgress, ScanQueue, ScanStatus } from '@/types';

type AuditStatusWsEvent =
    | QueuedWsEvent
    | StartedWsEvent
    | ProgressWsEvent
    | CompletedWsEvent
    | FailedWsEvent
    | CancelledWsEvent;

type UseAuditLiveStatusParams = {
    auditId: string;
    initialStatus: ScanStatus;
    initialScanQueue: ScanQueue | null;
    initialScanProgress: ScanProgress | null;
    /** Passed to `router.reload({ only })` when a terminal event arrives —
     * score/issue counts aren't in the WS payload, so the authoritative
     * values are refetched instead of guessed client-side. */
    reloadProps: string[];
};

type UseAuditLiveStatusResult = {
    status: ScanStatus;
    scanQueue: ScanQueue | null;
    scanProgress: ScanProgress | null;
};

export function useAuditLiveStatus({
    auditId,
    initialStatus,
    initialScanQueue,
    initialScanProgress,
    reloadProps,
}: UseAuditLiveStatusParams): UseAuditLiveStatusResult {
    const [status, setStatus] = useState<ScanStatus>(initialStatus);
    const [scanQueue, setScanQueue] = useState(initialScanQueue);
    const [scanProgress, setScanProgress] = useState(initialScanProgress);

    useEchoPublic<AuditStatusWsEvent>(
        `audit-${auditId}-scanning`,
        [
            '.audit.queued',
            '.audit.started',
            '.audit.progress',
            '.audit.completed',
            '.audit.failed',
            '.audit.cancelled',
        ],
        (e) => {
            if (e.type === 'audit.queued') {
                setScanQueue({ ...(e as QueuedWsEvent).data });
            } else if (e.type === 'audit.started') {
                setStatus('started');
            } else if (e.type === 'audit.progress') {
                setScanProgress({ ...(e as ProgressWsEvent).data });
            } else if (
                e.type === 'audit.completed' ||
                e.type === 'audit.failed' ||
                e.type === 'audit.cancelled'
            ) {
                router.reload({ only: reloadProps });
            }
        },
    );

    return { status, scanQueue, scanProgress };
}
