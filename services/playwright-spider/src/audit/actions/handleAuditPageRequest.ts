import type { EnqueueStrategy, PlaywrightCrawlerOptions , RequestOptions } from "crawlee";
import { Request } from "crawlee";
import { pageStartedEvent } from "../events/pageStartedEvent";
import type { EventPublisher } from "../repositories/eventPublisher";
import { createProcessAxeResultAction } from "./processAxeResult";
import { captureViolationScreenshots } from "./captureViolationScreenshots";
import AxeBuilder from "@axe-core/playwright";
import { progressEvent } from "../events/progressEvent";
import type { AuditOptions } from "@equalsite/types";
import { isCancelled } from "../services/cancellationSignal";

/**
 * SameDomain/SameHostname enqueue strategies treat http/https and www/non-www
 * as equivalent, but Crawlee's default uniqueKey does not - so the same page
 * reached via two href forms (e.g. seed uses https://example.com, a nav link
 * uses https://www.example.com/) would enqueue as two separate requests.
 * Canonicalize scheme + host before computing the uniqueKey so those collapse
 * to one request, without changing the actual URL that gets navigated to.
 */
const canonicalizeRequestUniqueKey = (request: RequestOptions): RequestOptions => {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.hostname = url.hostname.replace(/^www\./, '');

    return {
        ...request,
        uniqueKey: Request.computeUniqueKey({ url: url.href, method: 'GET' }),
    };
};

export const createAuditPageRequestHandler = (
    auditId: string,
    eventPublisher: EventPublisher,
    options: AuditOptions,
    screenshotsDir: string
): PlaywrightCrawlerOptions['requestHandler'] => {
    let pageIndex = 0;

    return async ({
        request,
        page,
        pushData,
        enqueueLinks,
        crawler
    }) => {
        if (isCancelled(auditId)) {
            return;
        }

        await eventPublisher(pageStartedEvent({
            auditId,
            pageUrl: request.url,
            attemptsCount: request.retryCount
        }));

        const processAxeResultAction = createProcessAxeResultAction(pushData, eventPublisher);

        const axeResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
            .options({ resultTypes: ['violations'] }) // @todo customizable by request
            .analyze();

        const screenshotPaths = options.captureScreenshot
            ? await captureViolationScreenshots({
                page,
                violations: axeResults.violations,
                screenshotsDir,
                pageIndex: pageIndex++,
            })
            : undefined;

        await processAxeResultAction.run({
            pageUrl: request.url,
            auditId,
            axeResults,
            screenshotPaths,
        });

        const queue = await crawler.getRequestQueue();
        const info = await queue.getInfo();

        await eventPublisher(progressEvent({
            auditId,
            completedRequests: info?.handledRequestCount ?? 0,
            pendingRequests: info?.pendingRequestCount ?? 0,
            totalRequests: info?.totalRequestCount ?? 0,
        }));

        const currentDepth = (request.userData?.depth as number | undefined) ?? 0;
        const withinMaxDepth = options.maxDepth === undefined || options.maxDepth === null || currentDepth < options.maxDepth;

        // An axe-core scan already in flight when cancellation lands cannot be interrupted
        // mid-analyze() - Crawlee and axe-core/Playwright expose no abort hook for that. This
        // check only stops it from enqueueing more work once cancellation has been signaled.
        if (options.enqueueLinks && withinMaxDepth && !isCancelled(auditId)) {
            await enqueueLinks({
                strategy: options.enqueueStrategy as EnqueueStrategy,
                selector: 'a',
                globs: options.includeGlobs?.length ? options.includeGlobs : undefined,
                exclude: options.excludeGlobs?.length ? options.excludeGlobs : undefined,
                userData: { depth: currentDepth + 1 },
                transformRequestFunction: canonicalizeRequestUniqueKey,
            });
        }
    };
}
