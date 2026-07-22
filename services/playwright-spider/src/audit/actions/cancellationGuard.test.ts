import { describe, expect, it } from "vitest";
import AuditEntity from "../entities/audit";
import Status from "../value/status";
import { wasCancelledExternally } from "./cancellationGuard";

function makeAudit(status: Status): AuditEntity {
    return AuditEntity.make({
        id: "audit-1",
        urls: ["https://example.com"],
        status,
        options: { maxPages: 10, enqueueLinks: false, enqueueStrategy: "same-domain" },
        createdAt: Date.now(),
    });
}

describe("wasCancelledExternally", () => {
    it("returns true when the audit no longer exists", () => {
        expect(wasCancelledExternally(null)).toBe(true);
    });

    it("returns true when the audit's current status is cancelled", () => {
        expect(wasCancelledExternally(makeAudit(Status.cancelled()))).toBe(true);
    });

    it("returns false when the audit is still active", () => {
        expect(wasCancelledExternally(makeAudit(Status.active()))).toBe(false);
    });

    it("returns false when the audit already completed", () => {
        expect(wasCancelledExternally(makeAudit(Status.completed()))).toBe(false);
    });
});
