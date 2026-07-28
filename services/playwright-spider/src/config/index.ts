import path from 'node:path';

export const secretKey = String(process.env.CRAWLER_SECRET);

export const redis = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
}

export const bullmq = {
    queue: 'crawl-queue',
    concurrency: 2
}

const storagePath = path.join(process.cwd(), 'storage');
export const crawler = {
    maxRequestsPerCrawl: Number(process.env.CRAWLER_PAGE_LIMIT || 50),
    artifactDirectory: path.join(storagePath, 'artifacts'),
}

export type StorageConfig =
    | { driver: 'local'; localPath: string }
    | {
        driver: 's3';
        bucket: string;
        region?: string;
        endpoint?: string;
        accessKeyId: string;
        secretAccessKey: string;
        forcePathStyle: boolean;
    };

export const storage: StorageConfig = process.env.STORAGE_DRIVER === 's3'
    ? {
        driver: 's3',
        bucket: String(process.env.AUDIT_ARTIFACTS_BUCKET),
        region: process.env.AUDIT_ARTIFACTS_REGION,
        endpoint: process.env.AUDIT_ARTIFACTS_ENDPOINT,
        accessKeyId: String(process.env.AUDIT_ARTIFACTS_KEY),
        secretAccessKey: String(process.env.AUDIT_ARTIFACTS_SECRET),
        forcePathStyle: process.env.AUDIT_ARTIFACTS_USE_PATH_STYLE === 'true',
    }
    : {
        driver: 'local',
        localPath: process.env.AUDIT_ARTIFACTS_PATH || path.join(storagePath, 'audit-artifacts'),
    };
