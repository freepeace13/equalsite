import type { EnqueueStrategy, PlaywrightCrawlerOptions , RequestOptions } from "crawlee";
import { Request } from "crawlee";
import { pageStartedEvent } from "../events/pageStartedEvent";
import type { EventPublisher } from "../repositories/eventPublisher";
import { createProcessAxeResultAction } from "./processAxeResult";
import AxeBuilder from "@axe-core/playwright";
import { progressEvent } from "../events/progressEvent";
import type { AuditOptions } from "@equalsite/types";

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
    options: AuditOptions
): PlaywrightCrawlerOptions['requestHandler'] => async ({
    request,
    page,
    pushData,
    enqueueLinks,
    crawler
}) => {
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

    await processAxeResultAction.run({
        pageUrl: request.url,
        auditId,
        axeResults
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

    if (options.enqueueLinks && withinMaxDepth) {
        await enqueueLinks({
            strategy: options.enqueueStrategy as EnqueueStrategy,
            selector: 'a',
            globs: options.includeGlobs?.length ? options.includeGlobs : undefined,
            exclude: options.excludeGlobs?.length ? options.excludeGlobs : undefined,
            userData: { depth: currentDepth + 1 },
            transformRequestFunction: canonicalizeRequestUniqueKey,
        });
    }
}
