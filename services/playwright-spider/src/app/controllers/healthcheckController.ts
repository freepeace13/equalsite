import type { Request, Response } from "express";
import { crawlerQueue } from "../services/queue";
import { bullClient, cacheClient, streamClient } from "../services/redis";
import { createArtifactStorage } from "../../audit/services/artifactStorage";
import { storage as storageConfig } from "../../config";
import { captureWorkerFailure } from "../../sentry";

const artifactStorage = createArtifactStorage(storageConfig);

const pingRedisClient = async (client: { ping: () => Promise<string> }): Promise<{ ok: boolean; error?: string }> => {
    try {
        await client.ping();
        return { ok: true };
    } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
};

export const HealthcheckController = async (request: Request, response: Response) => {
    try {
        const [cache, stream, bull, queueCounts, artifacts] = await Promise.all([
            pingRedisClient(cacheClient),
            pingRedisClient(streamClient),
            pingRedisClient(bullClient),
            crawlerQueue.getJobCounts(),
            artifactStorage.healthcheck(),
        ]);

        const ok = cache.ok && stream.ok && bull.ok && artifacts.ok;

        if (!ok) {
            console.error("Healthcheck reporting unhealthy", { cache, stream, bull, artifacts });
        }

        return response.status(ok ? 200 : 503).json({
            ok,
            timestamp: new Date().toISOString(),
            uptimeSeconds: process.uptime(),
            memory: process.memoryUsage(),
            redis: {
                cache,
                stream,
                bull,
            },
            queue: {
                name: crawlerQueue.name,
                counts: queueCounts,
            },
            artifactStorage: {
                driver: storageConfig.driver,
                ...artifacts,
            },
        });
    } catch (error) {
        console.error("Healthcheck failed unexpectedly", error);
        captureWorkerFailure(error);

        return response.status(503).json({
            ok: false,
            error: error instanceof Error ? error.message : String(error),
        });
    }
};
