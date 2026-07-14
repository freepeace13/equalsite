import { afterEach, describe, expect, it } from "vitest";
import { body } from "express-validator";
import { validationMiddleware } from "./validationMiddleware";
import { startTestServer } from "../../test/support/createTestServer";
import type { TestServer } from "../../test/support/createTestServer";

describe("validationMiddleware", () => {
    let server: TestServer | undefined;

    afterEach(async () => {
        await server?.close();
        server = undefined;
    });

    it("calls next() and lets the handler respond when validation passes", async () => {
        server = await startTestServer((app) => {
            app.post(
                '/things',
                validationMiddleware([body('name').notEmpty()]),
                (_req, res) => res.json({ ok: true })
            );
        });

        const response = await fetch(`${server.baseUrl}/things`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'example' }),
        });

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ ok: true });
    });

    it("returns a normalized 400 response when validation fails", async () => {
        server = await startTestServer((app) => {
            app.post(
                '/things',
                validationMiddleware([body('name').notEmpty().withMessage('name is required')]),
                (_req, res) => res.json({ ok: true })
            );
        });

        const response = await fetch(`${server.baseUrl}/things`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
            error: 'Invalid request body',
            message: 'The request failed validation.',
            errors: [{ field: 'name', message: 'name is required.' }],
        });
    });

    it("trims whitespace and avoids doubling the trailing period", async () => {
        server = await startTestServer((app) => {
            app.post(
                '/things',
                validationMiddleware([body('name').notEmpty().withMessage('  name is required.  ')]),
                (_req, res) => res.json({ ok: true })
            );
        });

        const response = await fetch(`${server.baseUrl}/things`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });

        const payload = await response.json() as { errors: unknown };
        expect(payload.errors).toEqual([{ field: 'name', message: 'name is required.' }]);
    });

    it("falls back to a default message when express-validator provides none", async () => {
        server = await startTestServer((app) => {
            app.post(
                '/things',
                validationMiddleware([body('name').notEmpty()]),
                (_req, res) => res.json({ ok: true })
            );
        });

        const response = await fetch(`${server.baseUrl}/things`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });

        const payload = await response.json() as { errors: unknown };
        expect(payload.errors).toEqual([{ field: 'name', message: 'Invalid value.' }]);
    });

    it("collects one normalized error per invalid field", async () => {
        server = await startTestServer((app) => {
            app.post(
                '/things',
                validationMiddleware([
                    body('name').notEmpty().withMessage('name is required'),
                    body('age').isInt().withMessage('age must be an integer'),
                ]),
                (_req, res) => res.json({ ok: true })
            );
        });

        const response = await fetch(`${server.baseUrl}/things`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });

        const payload = await response.json() as { errors: unknown[] };
        expect(response.status).toBe(400);
        expect(payload.errors).toHaveLength(2);
        expect(payload.errors).toEqual(expect.arrayContaining([
            { field: 'name', message: 'name is required.' },
            { field: 'age', message: 'age must be an integer.' },
        ]));
    });
});
