import fs from "node:fs";
import path from "node:path";
import { FileStorage, type StorageAdapter } from "@flystorage/file-storage";
import { LocalStorageAdapter } from "@flystorage/local-fs";
import { AwsS3StorageAdapter } from "@flystorage/aws-s3";
import { S3Client } from "@aws-sdk/client-s3";
import type { StorageConfig } from "../../config";
import { deleteDirectoryIfExists } from "../utils/fsDirectory";

const createAdapter = (config: StorageConfig): StorageAdapter => {
    if (config.driver === "s3") {
        const client = new S3Client({
            region: config.region,
            endpoint: config.endpoint,
            forcePathStyle: config.forcePathStyle,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        });

        return new AwsS3StorageAdapter(client, { bucket: config.bucket });
    }

    return new LocalStorageAdapter(config.localPath);
};

export const createArtifactStorage = (config: StorageConfig) => {
    const storage = new FileStorage(createAdapter(config));

    const publishDirectory = async (sourceDir: string, targetPrefix: string): Promise<void> => {
        if (!fs.existsSync(sourceDir)) {
            return;
        }

        for (const fileName of fs.readdirSync(sourceDir)) {
            const filePath = path.join(sourceDir, fileName);
            if (fs.statSync(filePath).isDirectory()) {
                continue;
            }

            await storage.write(`${targetPrefix}/${fileName}`, fs.createReadStream(filePath));
        }
    };

    return {
        publish: async (auditId: string, scratchDir: string): Promise<void> => {
            await publishDirectory(path.join(scratchDir, "datasets", "default"), `audits/${auditId}/artifacts`);
            await publishDirectory(path.join(scratchDir, "screenshots"), `audits/${auditId}/screenshots`);
            await deleteDirectoryIfExists(scratchDir);
        },
        healthcheck: async (): Promise<{ ok: boolean; error?: string }> => {
            const probePath = `healthcheck/${Date.now()}-${Math.random().toString(36).slice(2)}.probe`;
            const probeContents = "ok";

            try {
                await storage.write(probePath, probeContents);
                const readBack = await storage.readToString(probePath);

                if (readBack !== probeContents) {
                    return { ok: false, error: "Read-back contents did not match what was written" };
                }

                return { ok: true };
            } catch (error) {
                return { ok: false, error: error instanceof Error ? error.message : String(error) };
            } finally {
                await storage.deleteFile(probePath).catch(() => undefined);
            }
        },
    };
};
