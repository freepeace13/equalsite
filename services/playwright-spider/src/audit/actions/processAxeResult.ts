import type { AxeResults } from "axe-core";
import type { EventPublisher } from "../repositories/eventPublisher";
import type { ServerityBreakdown } from "@equalsite/types";
import { pageCompletedEvent } from "../events/pageCompletedEvent";
import type { PlaywrightCrawler } from "crawlee";
import type { ViolationScreenshotMap } from "./captureViolationScreenshots";

export interface IProcessAxeResultAction {
    run: (params: {
        auditId: string;
        pageUrl: string;
        axeResults: AxeResults;
        screenshotPaths?: ViolationScreenshotMap;
    }) => Promise<void>;
}

export const createProcessAxeResultAction = (
    pushData: PlaywrightCrawler['pushData'],
    eventPublisher: EventPublisher,
): IProcessAxeResultAction => ({
    run: async ({
        auditId,
        pageUrl,
        axeResults,
        screenshotPaths
    }) => {
        const violations = axeResults.violations;
        await pushData({
            auditId,
            pageUrl,
            violations: violations.map((violation) => ({
                ...violation,
                screenshotPath: screenshotPaths?.[violation.id],
            })),
            // passes: axeResults.passes // @todo customizable by request
        });

        const severityBreakdown = violations
            .reduce<ServerityBreakdown>(
                (prev, curr) => {
                    if (curr.impact) {
                        prev[curr.impact] = prev[curr.impact] + 1;
                    }
                    return prev;
                },
                {
                    critical: 0,
                    serious: 0,
                    moderate: 0,
                    minor: 0
                }
            );

        await eventPublisher(pageCompletedEvent({
            auditId,
            pageUrl,
            severityBreakdown,
            violationsCount: violations.length,
            // passesCount: passes.length, // @todo customizable by request
        }));
    }
})
