import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AuditEntity from "../entities/audit";
import Status from "../value/status";
import type { AuditRepository } from "../repositories/auditRepository";
import { crawlerMap } from "../services/crawlerMap";
import { createCancelAuditAction } from "./cancelAudit";

function makeAudit(id: string): AuditEntity {
    return AuditEntity.make({
        id,
        urls: ["https://example.com"],
        status: Status.active(),
        options: { maxPages: 10, enqueueLinks: false, enqueueStrategy: "same-domain" },
        createdAt: Date.now(),
    });
}

function makeAuditRepository(audit: AuditEntity): AuditRepository {
    return {
        find: vi.fn().mockResolvedValue(audit),
        all: vi.fn().mockResolvedValue([audit]),
        save: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
        exists: vi.fn().mockResolvedValue(true),
        findOrFail: vi.fn().mockResolvedValue(audit),
        create: vi.fn().mockResolvedValue(audit),
        getByStatus: vi.fn().mockResolvedValue([audit]),
    };
}

describe("cancelAudit", () => {
    let artifactDirectory: string;

    beforeEach(() => {
        artifactDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "equalsite-cancel-test-"));
    });

    afterEach(() => {
        fs.rmSync(artifactDirectory, { recursive: true, force: true });
        crawlerMap.clear();
    });

    it("deletes only the cancelled audit's own directory, not sibling audits' files", async () => {
        const cancelledAuditId = "audit-cancelled";
        const otherAuditId = "audit-other";

        fs.mkdirSync(path.join(artifactDirectory, cancelledAuditId), { recursive: true });
        fs.writeFileSync(path.join(artifactDirectory, cancelledAuditId, "marker.json"), "{}");
        fs.mkdirSync(path.join(artifactDirectory, otherAuditId), { recursive: true });
        fs.writeFileSync(path.join(artifactDirectory, otherAuditId, "marker.json"), "{}");

        const audit = makeAudit(cancelledAuditId);
        const auditRepository = makeAuditRepository(audit);
        const eventPublisher = vi.fn().mockResolvedValue(undefined);

        await createCancelAuditAction(auditRepository, eventPublisher, {
            artifactDirectory,
        }).run(cancelledAuditId);

        expect(fs.existsSync(path.join(artifactDirectory, cancelledAuditId))).toBe(false);
        expect(fs.existsSync(path.join(artifactDirectory, otherAuditId))).toBe(true);
    });

    it("gracefully stops the in-flight crawler instead of tearing it down immediately", async () => {
        const auditId = "audit-with-crawler";
        fs.mkdirSync(path.join(artifactDirectory, auditId), { recursive: true });

        const audit = makeAudit(auditId);
        const auditRepository = makeAuditRepository(audit);
        const eventPublisher = vi.fn().mockResolvedValue(undefined);

        const stop = vi.fn();
        const teardown = vi.fn();
        const fakeCrawler = {
            stats: { state: {} },
            stop,
            teardown,
        } as any;
        crawlerMap.set(auditId, fakeCrawler);

        await createCancelAuditAction(auditRepository, eventPublisher, {
            artifactDirectory,
        }).run(auditId);

        expect(stop).toHaveBeenCalledWith('Audit cancelled by user');
        expect(teardown).not.toHaveBeenCalled();
    });

    it("leaves the crawler in crawlerMap so performCleanUp can tear it down once it actually stops", async () => {
        const auditId = "audit-map-ownership";
        fs.mkdirSync(path.join(artifactDirectory, auditId), { recursive: true });

        const audit = makeAudit(auditId);
        const auditRepository = makeAuditRepository(audit);
        const eventPublisher = vi.fn().mockResolvedValue(undefined);

        const fakeCrawler = {
            stats: { state: {} },
            stop: vi.fn(),
            teardown: vi.fn(),
        } as any;
        crawlerMap.set(auditId, fakeCrawler);

        await createCancelAuditAction(auditRepository, eventPublisher, {
            artifactDirectory,
        }).run(auditId);

        expect(crawlerMap.get(auditId)).toBe(fakeCrawler);
    });
});
