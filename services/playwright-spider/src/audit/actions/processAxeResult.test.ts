import { describe, expect, it, vi } from "vitest";
import type { AxeResults } from "axe-core";
import { createProcessAxeResultAction } from "./processAxeResult";

function makeAxeResults(): AxeResults {
    return {
        violations: [
            { id: "color-contrast", impact: "serious", nodes: [{}] },
            { id: "image-alt", impact: "critical", nodes: [{}] },
        ],
    } as unknown as AxeResults;
}

describe("createProcessAxeResultAction", () => {
    it("merges the screenshot path map onto matching violations before pushing", async () => {
        const pushData = vi.fn().mockResolvedValue(undefined);
        const eventPublisher = vi.fn().mockResolvedValue(undefined);
        const action = createProcessAxeResultAction(pushData, eventPublisher);

        await action.run({
            auditId: "audit-1",
            pageUrl: "https://example.com",
            axeResults: makeAxeResults(),
            screenshotPaths: { "color-contrast": "screenshots/0__color-contrast.png" },
        });

        const [pushedPayload] = pushData.mock.calls[0]!;
        expect(pushedPayload.violations).toEqual([
            expect.objectContaining({ id: "color-contrast", screenshotPath: "screenshots/0__color-contrast.png" }),
            expect.objectContaining({ id: "image-alt", screenshotPath: undefined }),
        ]);
    });

    it("pushes violations unchanged when no screenshot paths are provided", async () => {
        const pushData = vi.fn().mockResolvedValue(undefined);
        const eventPublisher = vi.fn().mockResolvedValue(undefined);
        const action = createProcessAxeResultAction(pushData, eventPublisher);

        await action.run({
            auditId: "audit-1",
            pageUrl: "https://example.com",
            axeResults: makeAxeResults(),
        });

        const [pushedPayload] = pushData.mock.calls[0]!;
        expect(pushedPayload.violations[0].screenshotPath).toBeUndefined();
    });
});
