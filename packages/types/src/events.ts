import { ProgressState, QueueStatus, ServerityBreakdown, StatisticState } from './common';

export enum EventEnum {
    Queued = 'audit.queued',
    Started = 'audit.started',
    Progress = 'audit.progress',
    Completed = 'audit.completed',
    Failed = 'audit.failed',
    Cancelled = 'audit.cancelled',
    PageStarted = 'audit.page.started',
    PageSkipped = 'audit.page.skipped',
    PageFailed = 'audit.page.failed',
    PageCompleted = 'audit.page.completed',
    CrawlerTelemetry = 'crawler.telemetry',
}

export type EventType = keyof EventPayloadMap;

export type EventEnumKeys = keyof typeof EventEnum;

export interface EventPayloadMap {
    [EventEnum.Queued]: QueuedPayload;
    [EventEnum.Started]: StartedPayload;
    [EventEnum.Progress]: ProgressPayload;
    [EventEnum.Completed]: CompletedPayload;
    [EventEnum.Failed]: FailedPayload;
    [EventEnum.Cancelled]: CancelledPayload;
    [EventEnum.PageStarted]: PageStartedPayload;
    [EventEnum.PageSkipped]: PageSkippedPayload;
    [EventEnum.PageFailed]: PageFailedPayload;
    [EventEnum.PageCompleted]: PageCompletedPayload;
    [EventEnum.CrawlerTelemetry]: TelemetryPayload;
}

interface BasePayload {
    auditId: string;
}

export interface PageStartedPayload extends BasePayload {
    pageUrl: string;
    attemptsCount: number;
}

export interface PageSkippedPayload extends BasePayload {
    pageUrl: string;
    reason: string;
}

export type CrawlErrorCode =
    | 'dns_error'
    | 'timeout'
    | 'connection_failed'
    | 'tls_error'
    | 'http_error'
    | 'internal_error'
    | 'abandoned_incomplete';

export interface PageFailedPayload extends BasePayload {
    pageUrl: string;
    attemptsCount: number;
    errorMessage: string;
    errorCode: CrawlErrorCode;
}

export interface PageCompletedPayload extends BasePayload {
    pageUrl: string;
    violationsCount: number;
    passesCount?: number;
    severityBreakdown: ServerityBreakdown;
}

export interface ProgressPayload extends BasePayload, ProgressState { }

export interface FailedPayload extends BasePayload {
    error: string;
    errorCode: CrawlErrorCode;
}

export interface QueuedPayload extends BasePayload, QueueStatus { }

export interface CompletedPayload extends BasePayload, StatisticState { }

export interface CancelledPayload extends BasePayload, StatisticState { }

export interface StartedPayload extends BasePayload { }

export interface TelemetryPayload {
    process: {
        pid: number;
        uptime: number;
        memory: {
            rss: number;
            heapUsed: number;
            heapTotal: number;
        }
    },
    system: {
        loadAverage: number[];
        freeMemory: number;
        totalMemory: number;
    },
    queue: {
        waiting: number;
        active: number;
    },
    crawlers: {
        active: number;
    },
}

export interface PublishedEvent<T = EventType, P = unknown> {
    type: T;
    payload: P;
    version: string;
    timestamp: number;
}

export type TelemetryEvent = PublishedEvent<'crawler.telemetry', TelemetryPayload>;
export type CompletedEvent = PublishedEvent<'audit.completed', CompletedPayload>;
export type FailedEvent = PublishedEvent<'audit.failed', FailedPayload>;
export type CancelledEvent = PublishedEvent<'audit.cancelled', CancelledPayload>;
export type StartedEvent = PublishedEvent<'audit.started', StartedPayload>;
export type QueuedEvent = PublishedEvent<'audit.queued', QueuedPayload>;
export type PageStartedEvent = PublishedEvent<'audit.page.started', PageStartedPayload>;
export type PageFailedEvent = PublishedEvent<'audit.page.failed', PageFailedPayload>;
export type PageSkippedEvent = PublishedEvent<'audit.page.skipped', PageSkippedPayload>;
export type PageCompletedEvent = PublishedEvent<'audit.page.completed', PageCompletedPayload>;
export type ProgressEvent = PublishedEvent<'audit.progress', ProgressPayload>;
