import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { vi } from "vitest";
import { createArtifactStorage } from "./artifactStorage";

vi.mock("@aws-sdk/client-s3", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@aws-sdk/client-s3")>();
    return {
        ...actual,
        S3Client: vi.fn(),
    };
});

function makeScratchDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "equalsite-scratch-"));
    const datasetsDir = path.join(dir, "datasets", "default");
    const screenshotsDir = path.join(dir, "screenshots");
    const requestQueueDir = path.join(dir, "request_queues", "default");
    fs.mkdirSync(datasetsDir, { recursive: true });
    fs.mkdirSync(screenshotsDir, { recursive: true });
    fs.mkdirSync(requestQueueDir, { recursive: true });

    fs.writeFileSync(path.join(datasetsDir, "000000001.json"), JSON.stringify({ auditId: "audit-1" }));
    fs.writeFileSync(path.join(screenshotsDir, "0__color-contrast.png"), "fake-png-bytes");
    fs.writeFileSync(path.join(requestQueueDir, "000000001.json"), JSON.stringify({ url: "https://example.com" }));

    return dir;
}

describe("artifactStorage driver selection", () => {
    it("builds an S3Client with the configured bucket, endpoint, and path-style flag when driver is s3", async () => {
        const { S3Client } = await import("@aws-sdk/client-s3");

        createArtifactStorage({
            driver: "s3",
            bucket: "equalsite-audit-artifacts",
            region: "us-east-1",
            endpoint: "https://s3.us-east-1.backblazeb2.com",
            accessKeyId: "key",
            secretAccessKey: "secret",
            forcePathStyle: true,
        });

        expect(S3Client).toHaveBeenCalledWith(
            expect.objectContaining({
                region: "us-east-1",
                endpoint: "https://s3.us-east-1.backblazeb2.com",
                forcePathStyle: true,
                credentials: { accessKeyId: "key", secretAccessKey: "secret" },
            })
        );
    });
});

describe("artifactStorage", () => {
    it("publishes dataset JSON and screenshots to the local disk and removes the scratch dir", async () => {
        const scratchDir = makeScratchDir();
        const destinationRoot = fs.mkdtempSync(path.join(os.tmpdir(), "equalsite-dest-"));

        const artifactStorage = createArtifactStorage({ driver: "local", localPath: destinationRoot });
        await artifactStorage.publish("audit-1", scratchDir);

        expect(
            fs.readFileSync(path.join(destinationRoot, "audits", "audit-1", "artifacts", "000000001.json"), "utf-8")
        ).toBe(JSON.stringify({ auditId: "audit-1" }));
        expect(
            fs.readFileSync(path.join(destinationRoot, "audits", "audit-1", "screenshots", "0__color-contrast.png"), "utf-8")
        ).toBe("fake-png-bytes");
        expect(fs.existsSync(path.join(destinationRoot, "audits", "audit-1", "request_queues"))).toBe(false);
        expect(fs.existsSync(scratchDir)).toBe(false);
    });

    it("does nothing for a subdirectory that does not exist in the scratch dir", async () => {
        const scratchDir = fs.mkdtempSync(path.join(os.tmpdir(), "equalsite-scratch-empty-"));
        const destinationRoot = fs.mkdtempSync(path.join(os.tmpdir(), "equalsite-dest-empty-"));

        const artifactStorage = createArtifactStorage({ driver: "local", localPath: destinationRoot });
        await artifactStorage.publish("audit-2", scratchDir);

        expect(fs.existsSync(path.join(destinationRoot, "audits", "audit-2"))).toBe(false);
    });
});
