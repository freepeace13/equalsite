import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuditOptions } from "@equalsite/types";
import { clearCancelled, markCancelled } from "../services/cancellationSignal";
import { createAuditPageRequestHandler } from "./handleAuditPageRequest";

vi.mock("@axe-core/playwright", () => {
    return {
        default: class {
            withTags() {
                return this;
            }
            options() {
                return this;
            }
            async analyze() {
                return { violations: [] };
            }
        },
    };
});

function makeOptions(overrides: Partial<AuditOptions> = {}): AuditOptions {
    return {
        maxPages: 10,
        enqueueLinks: true,
        enqueueStrategy: "same-domain",
        ...overrides,
    };
}

describe("createAuditPageRequestHandler", () => {
    afterEach(() => {
        clearCancelled("audit-cancelled-before");
        clearCancelled("audit-cancelled-mid-flight");
    });

    it("skips scanning, pushing data, and enqueueing when cancelled before the request starts", async () => {
        const auditId = "audit-cancelled-before";
        markCancelled(auditId);

        const eventPublisher = vi.fn().mockResolvedValue(undefined);
        const pushData = vi.fn();
        const enqueueLinks = vi.fn();
        const handler = createAuditPageRequestHandler(auditId, eventPublisher, makeOptions(), "/tmp/screenshots");

        await handler!({
            request: { url: "https://example.com", retryCount: 0, userData: {} },
            page: {},
            pushData,
            enqueueLinks,
            crawler: {},
        } as never);

        expect(eventPublisher).not.toHaveBeenCalled();
        expect(pushData).not.toHaveBeenCalled();
        expect(enqueueLinks).not.toHaveBeenCalled();
    });

    it("skips enqueueing further links when cancellation lands mid-flight, after the scan already started", async () => {
        const auditId = "audit-cancelled-mid-flight";

        const eventPublisher = vi.fn().mockResolvedValue(undefined);
        const pushData = vi.fn().mockResolvedValue(undefined);
        const enqueueLinks = vi.fn().mockResolvedValue(undefined);
        const getRequestQueue = vi.fn().mockResolvedValue({
            getInfo: vi.fn().mockResolvedValue({
                handledRequestCount: 1,
                pendingRequestCount: 0,
                totalRequestCount: 1,
            }),
        });

        const handler = createAuditPageRequestHandler(auditId, eventPublisher, makeOptions(), "/tmp/screenshots");

        // Cancellation is signaled partway through, once the page has already started scanning.
        pushData.mockImplementationOnce(async () => {
            markCancelled(auditId);
        });

        await handler!({
            request: { url: "https://example.com", retryCount: 0, userData: {} },
            page: {},
            pushData,
            enqueueLinks,
            crawler: { getRequestQueue },
        } as never);

        expect(pushData).toHaveBeenCalled();
        expect(enqueueLinks).not.toHaveBeenCalled();
    });
});
