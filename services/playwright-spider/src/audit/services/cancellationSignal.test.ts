import { describe, expect, it } from "vitest";
import { clearCancelled, isCancelled, markCancelled } from "./cancellationSignal";

describe("cancellationSignal", () => {
    it("reports false for an audit that was never marked cancelled", () => {
        expect(isCancelled("audit-untouched")).toBe(false);
    });

    it("reports true once an audit is marked cancelled", () => {
        markCancelled("audit-1");

        expect(isCancelled("audit-1")).toBe(true);
    });

    it("reports false again once the signal is cleared", () => {
        markCancelled("audit-2");
        clearCancelled("audit-2");

        expect(isCancelled("audit-2")).toBe(false);
    });
});
