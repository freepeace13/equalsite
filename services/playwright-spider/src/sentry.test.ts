import type { Express } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const initMock = vi.fn();
const setupExpressErrorHandlerMock = vi.fn();
const captureExceptionMock = vi.fn();

vi.mock("@sentry/node", () => ({
    init: (...args: unknown[]) => initMock(...args),
    setupExpressErrorHandler: (...args: unknown[]) => setupExpressErrorHandlerMock(...args),
    captureException: (...args: unknown[]) => captureExceptionMock(...args),
}));

describe("sentry", () => {
    const originalDsn = process.env.SENTRY_DSN;
    const originalEnvironment = process.env.SENTRY_ENVIRONMENT;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    afterEach(() => {
        process.env.SENTRY_DSN = originalDsn;
        process.env.SENTRY_ENVIRONMENT = originalEnvironment;
    });

    it("initializes Sentry with the DSN and environment from process.env", async () => {
        process.env.SENTRY_DSN = "https://example@o0.ingest.sentry.io/1";
        process.env.SENTRY_ENVIRONMENT = "production";

        const { initSentry } = await import("./sentry");
        initSentry();

        expect(initMock).toHaveBeenCalledWith({
            dsn: "https://example@o0.ingest.sentry.io/1",
            environment: "production",
        });
    });

    it("passes an undefined dsn through when SENTRY_DSN is unset, relying on the SDK's no-op behavior", async () => {
        delete process.env.SENTRY_DSN;
        delete process.env.SENTRY_ENVIRONMENT;

        const { initSentry } = await import("./sentry");
        initSentry();

        expect(initMock).toHaveBeenCalledWith({
            dsn: undefined,
            environment: "production",
        });
    });

    it("attaches the Sentry Express error handler to the given app", async () => {
        const { attachSentryErrorHandler } = await import("./sentry");
        const fakeApp = {} as Express;

        attachSentryErrorHandler(fakeApp);

        expect(setupExpressErrorHandlerMock).toHaveBeenCalledWith(fakeApp);
    });

    it("reports worker job failures to Sentry", async () => {
        const { captureWorkerFailure } = await import("./sentry");
        const error = new Error("crawl failed");

        captureWorkerFailure(error);

        expect(captureExceptionMock).toHaveBeenCalledWith(error);
    });

    it("reports uncaught exceptions to Sentry", async () => {
        const { onUncaughtException } = await import("./sentry");
        const error = new Error("uncaught");

        onUncaughtException(error);

        expect(captureExceptionMock).toHaveBeenCalledWith(error);
    });

    it("reports unhandled promise rejections to Sentry", async () => {
        const { onUnhandledRejection } = await import("./sentry");
        const reason = new Error("unhandled rejection");

        onUnhandledRejection(reason);

        expect(captureExceptionMock).toHaveBeenCalledWith(reason);
    });
});
