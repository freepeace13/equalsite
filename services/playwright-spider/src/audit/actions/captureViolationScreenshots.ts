import fs from "node:fs";
import path from "node:path";
import type { Result } from "axe-core";
import type { Page } from "playwright";

export type ViolationScreenshotMap = Record<string, string>;

interface CaptureViolationScreenshotsParams {
    page: Page;
    violations: Result[];
    screenshotsDir: string;
    pageIndex: number;
}

const HIGHLIGHT_CLASS = "__equalsite_violation_highlight__";

const sanitizeRuleId = (ruleId: string): string => ruleId.replace(/[^a-zA-Z0-9-_]/g, "-");

const resolveSelectors = (violation: Result): string[] =>
    violation.nodes
        .map((node) => node.target[0])
        .filter((target): target is string => typeof target === "string");

const highlightSelectors = async (page: Page, selectors: string[]): Promise<void> => {
    await page.evaluate(
        ({ selectors, className }) => {
            for (const selector of selectors) {
                let element: Element | null = null;
                try {
                    element = document.querySelector(selector);
                } catch {
                    continue;
                }
                if (!element) {
                    continue;
                }

                const rect = element.getBoundingClientRect();
                const box = document.createElement("div");
                box.className = className;
                box.style.position = "absolute";
                box.style.left = `${rect.left + window.scrollX}px`;
                box.style.top = `${rect.top + window.scrollY}px`;
                box.style.width = `${rect.width}px`;
                box.style.height = `${rect.height}px`;
                box.style.border = "3px solid #ff3b30";
                box.style.boxSizing = "border-box";
                box.style.pointerEvents = "none";
                box.style.zIndex = "2147483647";
                document.body.appendChild(box);
            }
        },
        { selectors, className: HIGHLIGHT_CLASS }
    );
};

const clearHighlights = async (page: Page): Promise<void> => {
    await page.evaluate((className) => {
        document.querySelectorAll(`.${className}`).forEach((element) => element.remove());
    }, HIGHLIGHT_CLASS);
};

export const captureViolationScreenshots = async ({
    page,
    violations,
    screenshotsDir,
    pageIndex,
}: CaptureViolationScreenshotsParams): Promise<ViolationScreenshotMap> => {
    const paths: ViolationScreenshotMap = {};

    for (const violation of violations) {
        const selectors = resolveSelectors(violation);

        if (selectors.length === 0) {
            continue;
        }

        try {
            await highlightSelectors(page, selectors);

            const fileName = `${pageIndex}__${sanitizeRuleId(violation.id)}.png`;
            const relativePath = path.join("screenshots", fileName);

            fs.mkdirSync(screenshotsDir, { recursive: true });
            await page.screenshot({ path: path.join(screenshotsDir, fileName), fullPage: true });

            paths[violation.id] = relativePath;
        } catch (error) {
            console.error(`Failed to capture screenshot for rule "${violation.id}":`, error);
        } finally {
            await clearHighlights(page);
        }
    }

    return paths;
};
