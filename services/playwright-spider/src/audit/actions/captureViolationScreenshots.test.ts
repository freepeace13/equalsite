import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Result } from "axe-core";
import type { Page } from "playwright";
import { captureViolationScreenshots } from "./captureViolationScreenshots";

function makeViolation(overrides: Partial<Result> = {}): Result {
    return {
        id: "color-contrast",
        impact: "serious",
        tags: [],
        description: "",
        help: "",
        helpUrl: "",
        nodes: [
            {
                target: ["button.cta"],
                html: "<button class=\"cta\">Buy</button>",
                any: [],
                all: [],
                none: [],
            } as unknown as Result["nodes"][number],
        ],
        ...overrides,
    } as Result;
}

function makePage(overrides: Partial<Page> = {}): Page {
    return {
        evaluate: vi.fn().mockResolvedValue(undefined),
        screenshot: vi.fn().mockResolvedValue(Buffer.from("")),
        ...overrides,
    } as unknown as Page;
}

describe("captureViolationScreenshots", () => {
    it("captures one screenshot per violation and maps the rule id to a relative path", async () => {
        const screenshotsDir = fs.mkdtempSync(path.join(os.tmpdir(), "equalsite-shots-"));
        const page = makePage();

        const result = await captureViolationScreenshots({
            page,
            violations: [makeViolation()],
            screenshotsDir,
            pageIndex: 0,
        });

        expect(result).toEqual({ "color-contrast": "screenshots/0__color-contrast.png" });
        expect(page.screenshot).toHaveBeenCalledWith(
            expect.objectContaining({ fullPage: true, path: path.join(screenshotsDir, "0__color-contrast.png") })
        );
    });

    it("highlights before and clears overlays after each screenshot", async () => {
        const screenshotsDir = fs.mkdtempSync(path.join(os.tmpdir(), "equalsite-shots-"));
        const evaluate = vi.fn().mockResolvedValue(undefined);
        const screenshot = vi.fn().mockResolvedValue(Buffer.from(""));
        const page = makePage({ evaluate, screenshot });

        await captureViolationScreenshots({
            page,
            violations: [makeViolation()],
            screenshotsDir,
            pageIndex: 0,
        });

        const evaluateCallOrder = evaluate.mock.invocationCallOrder;
        const screenshotCallOrder = screenshot.mock.invocationCallOrder[0]!;

        expect(evaluate).toHaveBeenCalledTimes(2); // highlight, then clear
        expect(evaluateCallOrder[0]).toBeLessThan(screenshotCallOrder);
        expect(evaluateCallOrder[1]).toBeGreaterThan(screenshotCallOrder);
    });

    it("skips a violation whose nodes have no resolvable CSS selector", async () => {
        const screenshotsDir = fs.mkdtempSync(path.join(os.tmpdir(), "equalsite-shots-"));
        const screenshot = vi.fn().mockResolvedValue(Buffer.from(""));
        const page = makePage({ screenshot });

        const violation = makeViolation({
            nodes: [
                {
                    target: [["shadow-host", "button"]], // shadow DOM selector, not a plain string
                    html: "<button>Buy</button>",
                    any: [],
                    all: [],
                    none: [],
                } as unknown as Result["nodes"][number],
            ],
        });

        const result = await captureViolationScreenshots({
            page,
            violations: [violation],
            screenshotsDir,
            pageIndex: 0,
        });

        expect(result).toEqual({});
        expect(screenshot).not.toHaveBeenCalled();
    });

    it("continues capturing remaining violations if one screenshot call throws", async () => {
        const screenshotsDir = fs.mkdtempSync(path.join(os.tmpdir(), "equalsite-shots-"));
        const screenshot = vi.fn()
            .mockRejectedValueOnce(new Error("page closed"))
            .mockResolvedValueOnce(Buffer.from(""));
        const page = makePage({ screenshot });

        const result = await captureViolationScreenshots({
            page,
            violations: [
                makeViolation({ id: "color-contrast" }),
                makeViolation({ id: "image-alt" }),
            ],
            screenshotsDir,
            pageIndex: 0,
        });

        expect(result).toEqual({ "image-alt": "screenshots/0__image-alt.png" });
    });
});
