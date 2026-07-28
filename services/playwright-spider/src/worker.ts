import { Worker } from "bullmq";
import * as Config from "./config";
import { createRunAuditAction } from "./audit/actions/runAudit";
import { auditRepository } from "./app/adapters/redisAuditRepository";
import { publishEvent } from "./app/adapters/redisStreamPublisher";
import { bullClient } from "./app/services/redis";
import { crawlerQueue } from "./app/services/queue";
import { createQueuePositionService } from "./audit/services/queuePositionService";
import { captureWorkerFailure, initSentry, onUncaughtException, onUnhandledRejection } from "./sentry";

initSentry();
process.on('uncaughtException', onUncaughtException);
process.on('unhandledRejection', onUnhandledRejection);

const queuePositionService = createQueuePositionService(crawlerQueue, publishEvent);

// import './services/crawlWorker';
// import { startTelemetryLoop, stopTelemetryLoop } from './events/startTelemetryLoop';

// startTelemetryLoop();

// process.on(
//     'SIGTERM',
//     () => {
//         stopTelemetryLoop();
//         process.exit(0);
//     }
// )


const crawlerWorker = new Worker<{ auditId: string }>(
    Config.bullmq.queue,
    async ({ data }) => {
        await createRunAuditAction(
            auditRepository,
            publishEvent,
            {
                artifactDirectory: Config.crawler.artifactDirectory,
                storage: Config.storage,
            }
        ).run(data.auditId);
    },
    {
        connection: bullClient,
        concurrency: Config.bullmq.concurrency,
    }
);

crawlerWorker.on('active', (job) => {
    console.error('Crawler worker active', { jobId: job.id });
    queuePositionService.publishPositions().catch(console.error);
});

crawlerWorker.on('completed', () => {
    queuePositionService.publishPositions().catch(console.error);
});

crawlerWorker.on('failed', (_job, error) => {
    captureWorkerFailure(error);
    queuePositionService.publishPositions().catch(console.error);
});

crawlerWorker.on('error', (error) => {
    console.error('Crawler worker error', error);
});

crawlerWorker.on('ready', () => {
    console.log('Crawler worker ready');
});
