import * as Sentry from "@sentry/node";
import type { Express } from "express";

export function initSentry(): void {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.SENTRY_ENVIRONMENT || 'production',
    });
}

export function attachSentryErrorHandler(app: Express): void {
    Sentry.setupExpressErrorHandler(app);
}

export function captureWorkerFailure(error: unknown): void {
    Sentry.captureException(error);
}

export function onUncaughtException(error: unknown): void {
    Sentry.captureException(error);
    console.error('Uncaught exception', error);
}

export function onUnhandledRejection(reason: unknown): void {
    Sentry.captureException(reason);
    console.error('Unhandled rejection', reason);
}
