import type { Request, Response } from "express";
import { crawlerQueue } from "../services/queue";
import { bullClient, cacheClient, streamClient } from "../services/redis";
import { createArtifactStorage } from "../../audit/services/artifactStorage";
import { storage as storageConfig } from "../../config";

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
    const [cache, stream, bull, queueCounts, artifacts] = await Promise.all([
        pingRedisClient(cacheClient),
        pingRedisClient(streamClient),
        pingRedisClient(bullClient),
        crawlerQueue.getJobCounts(),
        artifactStorage.healthcheck(),
    ]);

    const ok = cache.ok && stream.ok && bull.ok && artifacts.ok;

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
};
