import type { PlaywrightCrawler } from "crawlee";
import type AuditEntity from "../entities/audit";
import type { AuditRepository } from "../repositories/auditRepository";
import type { EventPublisher } from "../repositories/eventPublisher";
import { completedEvent } from "../events/completedEvent";
import { startedEvent } from "../events/startedEvent";
import { failedEvent } from "../events/failedEvent";
import { cancelledEvent } from "../events/cancelledEvent";
import { progressEvent } from "../events/progressEvent";
import { pageFailedEvent } from "../events/pageFailedEvent";
import { classifyError } from "../utils/classifyError";


export const createAuditService = (
    auditRepository: AuditRepository,
    eventPublisher: EventPublisher
) => ({
    startAudit: async (
        audit: AuditEntity,
    ) => {
        await auditRepository.save(audit.markAsActive());
        await eventPublisher(startedEvent({
            auditId: audit.id
        }));
    },

    cancelAudit: async (
        audit: AuditEntity,
        crawler: PlaywrightCrawler
    ) => {
        await auditRepository.save(audit.markAsCancelled());
        await eventPublisher(cancelledEvent({
            auditId: audit.id,
            statistics: crawler.stats.state
        }));
    },

    completeAudit: async (
        audit: AuditEntity,
        crawler: PlaywrightCrawler,
    ) => {
        const queue = await crawler.getRequestQueue();
        const info = await queue.getInfo();

        // Crawlee's maxRequestsPerCrawl only gates *dequeuing* new requests — a request that was
        // already dequeued and is mid-retry when the cap trips gets reclaimed into the queue but
        // never redequeued, so it never reaches requestHandler or failedRequestHandler and would
        // otherwise vanish with no terminal event at all. Surface it explicitly as failed instead
        // of leaving the page stuck at 'started' forever on the Laravel side.
        if (info && info.pendingRequestCount > 0) {
            const { items } = await queue.client.listHead({ limit: info.pendingRequestCount });

            for (const item of items) {
                await eventPublisher(pageFailedEvent({
                    auditId: audit.id,
                    pageUrl: item.url,
                    attemptsCount: item.retryCount,
                    errorMessage: 'Audit completed before this page could be retried within the page limit.',
                    errorCode: 'abandoned_incomplete',
                }));
            }
        }

        await eventPublisher(progressEvent({
            auditId: audit.id,
            completedRequests: info?.handledRequestCount ?? 0,
            pendingRequests: info?.pendingRequestCount ?? 0,
            totalRequests: info?.totalRequestCount ?? 0,
        }));

        await auditRepository.save(audit.markAsCompleted());

        await eventPublisher(completedEvent({
            auditId: audit.id,
            statistics: crawler.stats.state,
        }));
    },

    failAudit: async (
        audit: AuditEntity,
        err: unknown
    ) => {
        const classified = classifyError(err);
        await auditRepository.save(audit.markAsFailed(classified.message));
        await eventPublisher(failedEvent({
            auditId: audit.id,
            error: classified.message,
            errorCode: classified.code,
        }));
    },
})
