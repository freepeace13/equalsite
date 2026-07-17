import type { PlaywrightCrawler } from "crawlee";
import type AuditEntity from "../entities/audit";
import type { AuditRepository } from "../repositories/auditRepository";
import type { EventPublisher } from "../repositories/eventPublisher";
import { completedEvent } from "../events/completedEvent";
import { startedEvent } from "../events/startedEvent";
import { failedEvent } from "../events/failedEvent";
import { cancelledEvent } from "../events/cancelledEvent";
import { progressEvent } from "../events/progressEvent";


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
        const error = typeof err === 'string' ? err : (err as Error).message;
        await auditRepository.save(audit.markAsFailed(error));
        await eventPublisher(failedEvent({
            auditId: audit.id,
            error
        }));
    },
})
