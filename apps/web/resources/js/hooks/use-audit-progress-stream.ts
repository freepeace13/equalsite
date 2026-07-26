import { router } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import type {
    CancelledWsEvent,
    CompletedWsEvent,
    FailedWsEvent,
    PageCompletedWsEvent,
    PageFailedWsEvent,
    PageSkippedWsEvent,
    PageStartedWsEvent,
    ProgressWsEvent,
    QueuedWsEvent,
    StartedWsEvent,
} from '@equalsite/types';
import { omit } from '@/lib/obj';
import type { AuditPage, ScanInfo, ScanProgress, ScanQueue } from '@/types';

type AuditProgressWsEvent =
    | QueuedWsEvent
    | StartedWsEvent
    | ProgressWsEvent
    | CompletedWsEvent
    | FailedWsEvent
    | CancelledWsEvent
    | PageStartedWsEvent
    | PageFailedWsEvent
    | PageSkippedWsEvent
    | PageCompletedWsEvent;

export type AuditProgressStreamProps = {
    scanInfo: ScanInfo;
    scanProgress: ScanProgress;
    scanQueue: ScanQueue;
    scanUrls: AuditPage[];
};

function upsertPage(
    pages: AuditPage[],
    url: string,
    patch: Partial<AuditPage>,
): AuditPage[] {
    const index = pages.findIndex((page) => page.url === url);

    if (index === -1) {
        return [...pages, { url, ...patch } as AuditPage];
    }

    const next = [...pages];
    next[index] = { ...next[index], ...patch } as AuditPage;
    return next;
}

export function useAuditProgressStream(auditId: string): void {
    useEchoPublic<AuditProgressWsEvent>(
        `audit-${auditId}-scanning`,
        [
            '.audit.queued',
            '.audit.started',
            '.audit.progress',
            '.audit.completed',
            '.audit.failed',
            '.audit.cancelled',
            '.audit.page.started',
            '.audit.page.skipped',
            '.audit.page.failed',
            '.audit.page.completed',
        ],
        (e) => {
            if (e.type === 'audit.queued') {
                const data = (e as QueuedWsEvent).data;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanQueue: omit(data, ['auditId']) as ScanQueue,
                    }),
                });
            } else if (e.type === 'audit.started') {
                const { timestamp } = e as StartedWsEvent;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanInfo: {
                            ...current.scanInfo,
                            status: 'started',
                            startedAt: timestamp,
                        },
                    }),
                });
            } else if (e.type === 'audit.progress') {
                const { data } = e as ProgressWsEvent;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanProgress: { ...data },
                    }),
                });
            } else if (e.type === 'audit.completed') {
                const { timestamp } = e as CompletedWsEvent;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanInfo: {
                            ...current.scanInfo,
                            status: 'completed',
                            completedAt: timestamp,
                        },
                    }),
                });
            } else if (e.type === 'audit.failed') {
                const { error, errorCode } = (e as FailedWsEvent).data;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanInfo: {
                            ...current.scanInfo,
                            status: 'failed',
                            failureReason: error,
                            failureCode: errorCode,
                        },
                    }),
                });
            } else if (e.type === 'audit.cancelled') {
                const { timestamp } = e as CancelledWsEvent;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanInfo: {
                            ...current.scanInfo,
                            status: 'cancelled',
                            cancelledAt: timestamp,
                        },
                    }),
                });
            } else if (e.type === 'audit.page.started') {
                const { data, timestamp } = e as PageStartedWsEvent;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanUrls: upsertPage(current.scanUrls, data.pageUrl, {
                            status: 'started',
                            attemptsCount: data.attemptsCount,
                            startedAt: timestamp,
                            lastActivityAt: timestamp,
                        }),
                    }),
                });
            } else if (e.type === 'audit.page.skipped') {
                const { data, timestamp } = e as PageSkippedWsEvent;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanUrls: upsertPage(current.scanUrls, data.pageUrl, {
                            status: 'skipped',
                            skippingReason: data.reason,
                            skippedAt: timestamp,
                            lastActivityAt: timestamp,
                        }),
                    }),
                });
            } else if (e.type === 'audit.page.failed') {
                const { data, timestamp } = e as PageFailedWsEvent;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanUrls: upsertPage(current.scanUrls, data.pageUrl, {
                            status: 'failed',
                            errorMessage: data.errorMessage,
                            errorCode: data.errorCode,
                            attemptsCount: data.attemptsCount,
                            failedAt: timestamp,
                            lastActivityAt: timestamp,
                        }),
                    }),
                });
            } else if (e.type === 'audit.page.completed') {
                const { data, timestamp } = e as PageCompletedWsEvent;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanUrls: upsertPage(current.scanUrls, data.pageUrl, {
                            status: 'completed',
                            violationsCount: data.violationsCount,
                            criticalCount: data.severityBreakdown.critical,
                            seriousCount: data.severityBreakdown.serious,
                            moderateCount: data.severityBreakdown.moderate,
                            minorCount: data.severityBreakdown.minor,
                            completedAt: timestamp,
                            lastActivityAt: timestamp,
                        }),
                    }),
                });
            }
        },
    );
}
