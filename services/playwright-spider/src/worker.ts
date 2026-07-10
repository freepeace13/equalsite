import { Worker } from "bullmq";
import * as Config from "./config";
import { createRunAuditAction } from "./audit/actions/runAudit";
import { auditRepository } from "./app/adapters/redisAuditRepository";
import { publishEvent } from "./app/adapters/redisStreamPublisher";
import { bullClient } from "./app/services/redis";

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
                archiveDirectory: Config.crawler.archiveDirectory,
                secretKey: Config.secretKey
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
});

crawlerWorker.on('error', (error) => {
    console.error('Crawler worker error', error);
});

crawlerWorker.on('ready', () => {
    console.log('Crawler worker ready');
});
