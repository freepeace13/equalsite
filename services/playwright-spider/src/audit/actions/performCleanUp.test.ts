import { afterEach, describe, expect, it, vi } from "vitest";
import AuditEntity from "../entities/audit";
import Status from "../value/status";
import type { AuditRepository } from "../repositories/auditRepository";
import { crawlerMap } from "../services/crawlerMap";
import { isCancelled, markCancelled } from "../services/cancellationSignal";
import { createPerformCleanUpAction } from "./performCleanUp";

function makeAudit(id: string): AuditEntity {
    return AuditEntity.make({
        id,
        urls: ["https://example.com"],
        status: Status.cancelled(),
        options: { maxPages: 10, enqueueLinks: false, enqueueStrategy: "same-domain" },
        createdAt: Date.now(),
    });
}

function makeAuditRepository(): AuditRepository {
    return {
        find: vi.fn().mockResolvedValue(null),
        all: vi.fn().mockResolvedValue([]),
        save: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
        exists: vi.fn().mockResolvedValue(true),
        findOrFail: vi.fn(),
        create: vi.fn(),
        getByStatus: vi.fn().mockResolvedValue([]),
    };
}

describe("performCleanUp", () => {
    afterEach(() => {
        crawlerMap.clear();
    });

    it("tears down and removes the crawler still present in crawlerMap", async () => {
        const audit = makeAudit("audit-cleanup");
        const teardown = vi.fn().mockResolvedValue(undefined);
        crawlerMap.set(audit.id, { teardown } as any);

        const auditRepository = makeAuditRepository();
        await createPerformCleanUpAction(auditRepository).run(audit);

        expect(teardown).toHaveBeenCalled();
        expect(crawlerMap.has(audit.id)).toBe(false);
        expect(auditRepository.delete).toHaveBeenCalledWith(audit.id);
    });

    it("clears the cancellation signal so it doesn't leak across audits", async () => {
        const audit = makeAudit("audit-cleanup-signal");
        markCancelled(audit.id);

        const auditRepository = makeAuditRepository();
        await createPerformCleanUpAction(auditRepository).run(audit);

        expect(isCancelled(audit.id)).toBe(false);
    });
});
