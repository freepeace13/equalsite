import path from 'node:path';
import type { PlaywrightHook } from 'crawlee';
import { Configuration, PlaywrightCrawler } from 'crawlee';

import type { EventPublisher } from '../repositories/eventPublisher';
import { pageFailedEvent } from '../events/pageFailedEvent';
import { createAuditPageRequestHandler } from './handleAuditPageRequest';
import { classifyError } from '../utils/classifyError';
import type { AuditOptions } from '@equalsite/types';

type CrawlerFactoryParams = {
    auditId: string;
    eventPublisher: EventPublisher;
    artifactDirectory: string;
    options: AuditOptions
}

export default function createPlaywrightCrawler({
    auditId,
    eventPublisher,
    artifactDirectory,
    options
}: CrawlerFactoryParams): PlaywrightCrawler {
    const storageDir = path.join(artifactDirectory, String(auditId));
    const screenshotsDir = path.join(storageDir, 'screenshots');

    const config = new Configuration({
        purgeOnStart: false,
        storageClientOptions: {
            localDataDirectory: storageDir
        },
    });

    return new PlaywrightCrawler(
        {
            requestHandler: createAuditPageRequestHandler(auditId, eventPublisher, options, screenshotsDir),
            failedRequestHandler: async ({ request }, error) => {
                const classified = classifyError(error);
                await eventPublisher(pageFailedEvent({
                    auditId,
                    pageUrl: request.url,
                    attemptsCount: request.retryCount,
                    errorMessage: classified.message,
                    errorCode: classified.code,
                }));
            },
            // Disabled: robots.txt fetches go through got-scraping, not Playwright, and some
            // WAFs (e.g. Cloudflare on marketdragon.ph) block/challenge that fingerprint while
            // allowing the real page load. A failed fetch isn't cached, so every request pays
            // a ~60s retry-and-fail tax, which can blow the AutoscaledPool's taskTimeoutSecs and
            // fatally kill the whole crawl. We're not a search-engine crawler, so robots.txt
            // compliance isn't required here.
            respectRobotsTxtFile: false,
            // onSkippedRequest: async ({ url, reason }) => {
            //     await eventPublisher(pageSkippedEvent({
            //         auditId,
            //         reason,
            //         pageUrl: url,
            //     }));
            // },
            minConcurrency: 1,
            maxConcurrency: 2,
            maxRequestsPerCrawl: Math.min(options.maxPages, 200), // Safety max audit page limit
            maxRequestRetries: 2,
            requestHandlerTimeoutSecs: 120,
            navigationTimeoutSecs: 45,
            headless: true,
            useSessionPool: true,
            persistCookiesPerSession: false,
            autoscaledPoolOptions: {
                desiredConcurrency: 2,
                maxConcurrency: 2,
                autoscaleIntervalSecs: 10,
                maybeRunIntervalSecs: 1,
                loggingIntervalSecs: 30,
                taskTimeoutSecs: 180,
                snapshotterOptions: {
                    maxUsedMemoryRatio: 0.75
                }
            },
            launchContext: {
                launchOptions: {
                    args: [
                        '--disable-dev-shm-usage',
                        '--disable-gpu',
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                    ],
                },
            },
            preNavigationHooks: [
                resourceBlockingHook
            ],
        },
        config
    );
}

const resourceBlockingHook: PlaywrightHook = async ({ page }) => {
    await page.route('**/*', async (route) => {
        const request = route.request();
        const resourceType = request.resourceType();
        if ([
            'media',
            'font',
            'websocket',
            'manifest',
            'stylesheet',
        ].includes(resourceType)) {
            return await route.abort();
        }

        const url = request.url();
        if (
            url.includes('google-analytics') ||
            url.includes('doubleclick') ||
            url.includes('hotjar')
        ) {
            return await route.abort();
        }

        return await route.continue();
    });
}
