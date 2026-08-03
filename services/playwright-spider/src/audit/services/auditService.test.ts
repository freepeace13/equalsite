import { describe, expect, it, vi } from "vitest";
import type { PlaywrightCrawler } from "crawlee";
import type { AuditRepository } from "../repositories/auditRepository";
import AuditEntity from "../entities/audit";
import Status from "../value/status";
import { createAuditService } from "./auditService";

function makeAudit(): AuditEntity {
    return AuditEntity.make({
        id: "audit-1",
        urls: ["https://example.com"],
        status: Status.active(),
        options: { maxPages: 10, enqueueLinks: true, enqueueStrategy: "same-domain" },
        createdAt: Date.now(),
    });
}

function makeCrawler(overrides: { getInfo: object; listHead?: object }): PlaywrightCrawler {
    return {
        getRequestQueue: vi.fn().mockResolvedValue({
            getInfo: vi.fn().mockResolvedValue(overrides.getInfo),
            client: {
                listHead: vi.fn().mockResolvedValue(overrides.listHead ?? { items: [] }),
            },
        }),
        stats: { state: {} },
    } as unknown as PlaywrightCrawler;
}

describe("createAuditService.completeAudit", () => {
    it("does not publish a page.failed event when the queue has no pending requests", async () => {
        const auditRepository = { save: vi.fn().mockResolvedValue(undefined) } as unknown as AuditRepository;
        const eventPublisher = vi.fn().mockResolvedValue(undefined);
        const auditService = createAuditService(auditRepository, eventPublisher);

        const crawler = makeCrawler({
            getInfo: { handledRequestCount: 5, pendingRequestCount: 0, totalRequestCount: 5 },
        });

        await auditService.completeAudit(makeAudit(), crawler);

        expect(eventPublisher).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: "audit.page.failed" }),
        );
        expect(eventPublisher).toHaveBeenCalledWith(
            expect.objectContaining({ type: "audit.completed" }),
        );
    });

    it("publishes a page.failed event for each request still stuck in the queue when the crawl ends", async () => {
        const auditRepository = { save: vi.fn().mockResolvedValue(undefined) } as unknown as AuditRepository;
        const eventPublisher = vi.fn().mockResolvedValue(undefined);
        const auditService = createAuditService(auditRepository, eventPublisher);

        const crawler = makeCrawler({
            getInfo: { handledRequestCount: 25, pendingRequestCount: 2, totalRequestCount: 27 },
            listHead: {
                items: [
                    { url: "https://example.com/", retryCount: 1, id: "1", uniqueKey: "1", method: "GET" },
                    { url: "https://example.com/about", retryCount: 0, id: "2", uniqueKey: "2", method: "GET" },
                ],
            },
        });

        await auditService.completeAudit(makeAudit(), crawler);

        expect(eventPublisher).toHaveBeenCalledWith({
            type: "audit.page.failed",
            payload: expect.objectContaining({
                pageUrl: "https://example.com/",
                attemptsCount: 1,
                errorCode: "abandoned_incomplete",
            }),
        });
        expect(eventPublisher).toHaveBeenCalledWith({
            type: "audit.page.failed",
            payload: expect.objectContaining({
                pageUrl: "https://example.com/about",
                attemptsCount: 0,
                errorCode: "abandoned_incomplete",
            }),
        });

        const failedCallCount = eventPublisher.mock.calls.filter(
            ([event]) => event.type === "audit.page.failed",
        ).length;
        expect(failedCallCount).toBe(2);
    });
});
