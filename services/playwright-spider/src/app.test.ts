import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const initSentryMock = vi.fn();
const attachSentryErrorHandlerMock = vi.fn();

vi.mock("./sentry", () => ({
    initSentry: () => initSentryMock(),
    attachSentryErrorHandler: (...args: unknown[]) => attachSentryErrorHandlerMock(...args),
}));

describe("app", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    afterEach(() => {
        vi.resetModules();
    });

    it("initializes Sentry and attaches its Express error handler when the app module loads", async () => {
        const { default: app } = await import("./app");

        expect(initSentryMock).toHaveBeenCalledTimes(1);
        expect(attachSentryErrorHandlerMock).toHaveBeenCalledWith(app);
    });
});
