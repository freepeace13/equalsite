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

    const config = new Configuration({
        purgeOnStart: false,
        storageClientOptions: {
            localDataDirectory: storageDir
        },
    });

    return new PlaywrightCrawler(
        {
            requestHandler: createAuditPageRequestHandler(auditId, eventPublisher, options),
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
            respectRobotsTxtFile: true,
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
