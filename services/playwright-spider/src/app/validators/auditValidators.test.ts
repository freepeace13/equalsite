import { afterEach, describe, expect, it } from "vitest";
import type { Express } from "express";
import { validationMiddleware } from "../middleware/validationMiddleware";
import { cancelAuditValidationRules, createAuditValidationRules } from "./auditValidators";
import { startTestServer } from "../../test/support/createTestServer";
import type { TestServer } from "../../test/support/createTestServer";

function buildApp(app: Express) {
    app.post(
        '/audit',
        validationMiddleware(createAuditValidationRules),
        (_req, res) => res.status(202).json({ ok: true })
    );
    app.delete(
        '/audit/:auditId',
        validationMiddleware(cancelAuditValidationRules),
        (_req, res) => res.json({ ok: true })
    );
}

const validAuditBody = {
    urls: ['https://example.com'],
    callbackUrl: 'https://example.com/callback',
    options: {
        maxPages: 5,
        enqueueLinks: true,
        enqueueStrategy: 'same-domain',
    },
};

type ErrorPayload = { errors: Array<{ field: string; message: string }> };

describe("auditValidators", () => {
    let server: TestServer;

    afterEach(async () => {
        await server?.close();
    });

    async function postAudit(body: unknown) {
        server = await startTestServer(buildApp);
        return await fetch(`${server.baseUrl}/audit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    }

    async function deleteAudit(auditId: string) {
        server = await startTestServer(buildApp);
        return await fetch(`${server.baseUrl}/audit/${auditId}`, { method: 'DELETE' });
    }

    describe("createAuditValidationRules", () => {
        it("accepts a fully valid payload", async () => {
            const response = await postAudit(validAuditBody);

            expect(response.status).toBe(202);
        });

        it("accepts a valid payload with optional fields provided", async () => {
            const response = await postAudit({
                ...validAuditBody,
                options: {
                    ...validAuditBody.options,
                    maxDepth: null,
                    includeGlobs: ['**/blog/**'],
                    excludeGlobs: ['**/admin/**'],
                },
            });

            expect(response.status).toBe(202);
        });

        it("rejects an empty urls array", async () => {
            const response = await postAudit({ ...validAuditBody, urls: [] });
            const payload = await response.json() as ErrorPayload;

            expect(response.status).toBe(400);
            expect(payload.errors).toContainEqual({
                field: 'urls',
                message: 'urls is required and must be a non-empty array of strings.',
            });
        });

        it("rejects a non-URL entry in urls", async () => {
            const response = await postAudit({ ...validAuditBody, urls: ['not-a-url'] });
            const payload = await response.json() as ErrorPayload;

            expect(response.status).toBe(400);
            expect(payload.errors).toContainEqual({
                field: 'urls[0]',
                message: 'each url must be a valid URL.',
            });
        });

        it("rejects a missing callbackUrl", async () => {
            const { callbackUrl: _callbackUrl, ...rest } = validAuditBody;
            const response = await postAudit(rest);
            const payload = await response.json() as ErrorPayload;

            expect(response.status).toBe(400);
            expect(payload.errors).toContainEqual({
                field: 'callbackUrl',
                message: 'callbackUrl is required and must be a string.',
            });
        });

        it("accepts a callbackUrl pointing at an internal hostname without a TLD", async () => {
            const response = await postAudit({ ...validAuditBody, callbackUrl: 'http://web/api/crawler/callback' });

            expect(response.status).toBe(202);
        });

        it("rejects a callbackUrl that is not a valid URL", async () => {
            const response = await postAudit({ ...validAuditBody, callbackUrl: 'not-a-url' });
            const payload = await response.json() as ErrorPayload;

            expect(response.status).toBe(400);
            expect(payload.errors).toContainEqual({
                field: 'callbackUrl',
                message: 'callbackUrl must be a valid URL.',
            });
        });

        it("rejects a missing options object", async () => {
            const { options: _options, ...rest } = validAuditBody;
            const response = await postAudit(rest);
            const payload = await response.json() as ErrorPayload;

            expect(response.status).toBe(400);
            expect(payload.errors).toContainEqual({
                field: 'options',
                message: 'options is required and must be an object.',
            });
        });

        it.each([
            ['maxPages', { maxPages: 0 }, 'options.maxPages is required and must be a positive integer.'],
            ['enqueueLinks', { enqueueLinks: 'yes' }, 'options.enqueueLinks is required and must be a boolean.'],
            ['enqueueStrategy', { enqueueStrategy: '' }, 'options.enqueueStrategy must not be empty.'],
        ])("rejects an invalid options.%s", async (field, override, expectedMessage) => {
            const response = await postAudit({
                ...validAuditBody,
                options: { ...validAuditBody.options, ...override },
            });
            const payload = await response.json() as ErrorPayload;

            expect(response.status).toBe(400);
            expect(payload.errors).toContainEqual({
                field: `options.${field}`,
                message: expectedMessage,
            });
        });

        it("rejects a negative options.maxDepth", async () => {
            const response = await postAudit({
                ...validAuditBody,
                options: { ...validAuditBody.options, maxDepth: -1 },
            });
            const payload = await response.json() as ErrorPayload;

            expect(response.status).toBe(400);
            expect(payload.errors).toContainEqual({
                field: 'options.maxDepth',
                message: 'options.maxDepth must be a non-negative integer or null.',
            });
        });

        it("rejects a non-string entry in options.includeGlobs", async () => {
            const response = await postAudit({
                ...validAuditBody,
                options: { ...validAuditBody.options, includeGlobs: [123] },
            });
            const payload = await response.json() as ErrorPayload;

            expect(response.status).toBe(400);
            expect(payload.errors).toContainEqual({
                field: 'options.includeGlobs[0]',
                message: 'each options.includeGlobs entry must be a string.',
            });
        });
    });

    describe("cancelAuditValidationRules", () => {
        it("accepts a non-empty auditId", async () => {
            const response = await deleteAudit('abc-123');

            expect(response.status).toBe(200);
        });

        it("rejects a blank auditId", async () => {
            const response = await deleteAudit('%20');
            const payload = await response.json() as ErrorPayload;

            expect(response.status).toBe(400);
            expect(payload.errors).toContainEqual({
                field: 'auditId',
                message: 'auditId is required.',
            });
        });
    });
});
