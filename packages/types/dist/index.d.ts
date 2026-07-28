type ImpactLevel = 'critical' | 'serious' | 'moderate' | 'minor';
type ImpactKey = Exclude<ImpactLevel, null>;
type AllKeysRequired<T extends Record<ImpactKey, number>> = Pick<T, ImpactKey> & Partial<Record<Exclude<keyof T, ImpactKey>, never>>;
type ServerityBreakdown = AllKeysRequired<Record<ImpactLevel, number>>;
interface Stats {
    totalRequests: number;
    pendingRequests: number;
    processedRequests: number;
    failedRequests: number;
    concurrency: number;
}
interface QueueStatus {
    position: number;
    ahead: number;
    waiting: number;
}
interface ProgressState {
    completedRequests: number;
    pendingRequests: number;
    totalRequests: number;
    progressPercentage: number;
}
interface StatisticState {
    requestsFinished: number;
    requestsFailed: number;
    requestsRetries: number;
    requestsFailedPerMinute: number;
    requestsFinishedPerMinute: number;
    requestMinDurationMillis: number;
    requestMaxDurationMillis: number;
    requestTotalFailedDurationMillis: number;
    requestTotalFinishedDurationMillis: number;
    crawlerStartedAt: Date | string | null;
    crawlerFinishedAt: Date | string | null;
    crawlerRuntimeMillis: number;
    statsPersistedAt: Date | string | null;
    errors: Record<string, unknown>;
    retryErrors: Record<string, unknown>;
    requestsWithStatusCode: Record<string, number>;
}

declare enum EventEnum {
    Queued = "audit.queued",
    Started = "audit.started",
    Progress = "audit.progress",
    Completed = "audit.completed",
    Failed = "audit.failed",
    Cancelled = "audit.cancelled",
    PageStarted = "audit.page.started",
    PageSkipped = "audit.page.skipped",
    PageFailed = "audit.page.failed",
    PageCompleted = "audit.page.completed",
    CrawlerTelemetry = "crawler.telemetry"
}
type EventType = keyof EventPayloadMap;
type EventEnumKeys = keyof typeof EventEnum;
interface EventPayloadMap {
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
interface PageStartedPayload extends BasePayload {
    pageUrl: string;
    attemptsCount: number;
}
interface PageSkippedPayload extends BasePayload {
    pageUrl: string;
    reason: string;
}
type CrawlErrorCode = 'dns_error' | 'timeout' | 'connection_failed' | 'tls_error' | 'http_error' | 'internal_error';
interface PageFailedPayload extends BasePayload {
    pageUrl: string;
    attemptsCount: number;
    errorMessage: string;
    errorCode: CrawlErrorCode;
}
interface PageCompletedPayload extends BasePayload {
    pageUrl: string;
    violationsCount: number;
    passesCount?: number;
    severityBreakdown: ServerityBreakdown;
}
interface ProgressPayload extends BasePayload, ProgressState {
}
interface FailedPayload extends BasePayload {
    error: string;
    errorCode: CrawlErrorCode;
}
interface QueuedPayload extends BasePayload, QueueStatus {
}
interface CompletedPayload extends BasePayload, StatisticState {
}
interface CancelledPayload extends BasePayload, StatisticState {
}
interface StartedPayload extends BasePayload {
}
interface TelemetryPayload {
    process: {
        pid: number;
        uptime: number;
        memory: {
            rss: number;
            heapUsed: number;
            heapTotal: number;
        };
    };
    system: {
        loadAverage: number[];
        freeMemory: number;
        totalMemory: number;
    };
    queue: {
        waiting: number;
        active: number;
    };
    crawlers: {
        active: number;
    };
}
interface PublishedEvent<T = EventType, P = unknown> {
    type: T;
    payload: P;
    version: string;
    timestamp: number;
}
type TelemetryEvent = PublishedEvent<'crawler.telemetry', TelemetryPayload>;
type CompletedEvent = PublishedEvent<'audit.completed', CompletedPayload>;
type FailedEvent = PublishedEvent<'audit.failed', FailedPayload>;
type CancelledEvent = PublishedEvent<'audit.cancelled', CancelledPayload>;
type StartedEvent = PublishedEvent<'audit.started', StartedPayload>;
type QueuedEvent = PublishedEvent<'audit.queued', QueuedPayload>;
type PageStartedEvent = PublishedEvent<'audit.page.started', PageStartedPayload>;
type PageFailedEvent = PublishedEvent<'audit.page.failed', PageFailedPayload>;
type PageSkippedEvent = PublishedEvent<'audit.page.skipped', PageSkippedPayload>;
type PageCompletedEvent = PublishedEvent<'audit.page.completed', PageCompletedPayload>;
type ProgressEvent = PublishedEvent<'audit.progress', ProgressPayload>;

declare enum StatusEnum {
    Queued = "queued",
    Started = "started",
    Cancelled = "cancelled",
    Failed = "failed",
    Completed = "completed"
}
type StatusEnumKeys = keyof typeof StatusEnum;
interface WsEvent<D> {
    type: EventType;
    data: D;
    version: string;
    timestamp: string;
}
interface StartedWsData extends StartedPayload {
}
interface QueuedWsData extends QueuedPayload {
}
interface FailedWsData extends FailedPayload {
}
interface CancelledWsData extends CancelledPayload {
}
interface CompletedWsData extends CompletedPayload {
}
interface PageStartedWsData extends PageStartedPayload {
}
interface PageSkippedWsData extends PageSkippedPayload {
}
interface PageFailedWsData extends PageFailedPayload {
}
interface PageCompletedWsData extends PageCompletedPayload {
}
interface ProgressWsData extends ProgressPayload {
}
type StartedWsEvent = WsEvent<StartedWsData>;
type QueuedWsEvent = WsEvent<QueuedWsData>;
type FailedWsEvent = WsEvent<FailedWsData>;
type CancelledWsEvent = WsEvent<CancelledWsData>;
type CompletedWsEvent = WsEvent<CompletedWsData>;
type PageStartedWsEvent = WsEvent<PageStartedWsData>;
type PageFailedWsEvent = WsEvent<PageFailedWsData>;
type PageSkippedWsEvent = WsEvent<PageSkippedWsData>;
type PageCompletedWsEvent = WsEvent<PageCompletedWsData>;
type ProgressWsEvent = WsEvent<ProgressWsData>;

type ResponseError = {
    error: string;
    message: string;
};
type AuditOptions = {
    maxPages: number;
    enqueueLinks: boolean;
    enqueueStrategy: string;
    maxDepth?: number | null;
    includeGlobs?: string[];
    excludeGlobs?: string[];
    captureScreenshot?: boolean;
};
type CreateAuditRequestBody = {
    urls: string[];
    options: AuditOptions;
};
interface CreateAuditResponseBody {
    id: string;
    options: AuditOptions;
}
type CreateAuditResponseData = CreateAuditResponseBody | ResponseError;
type CancelAuditRequestParams = {
    auditId: string;
};
type CancelAuditResponseData = CancelAuditRequestParams | ResponseError;
interface DownloadArtifactParams {
    auditId: string;
}

interface StreamData<T> {
    data: T;
}
type PageStartedStream = StreamData<PageStartedEvent>;
type PageSkippedStream = StreamData<PageSkippedEvent>;
type PageFailedStream = StreamData<PageFailedEvent>;
type PageCompletedStream = StreamData<PageCompletedEvent>;
type ProgressStream = StreamData<ProgressEvent>;
type QueuedStream = StreamData<QueuedEvent>;
type FailedStream = StreamData<FailedEvent>;
type CompletedStream = StreamData<CompletedEvent>;
type StartedStream = StreamData<StartedEvent>;
type CancelledStream = StreamData<CancelledEvent>;
type TelemetryStream = StreamData<TelemetryEvent>;

export { type AuditOptions, type CancelAuditRequestParams, type CancelAuditResponseData, type CancelledEvent, type CancelledPayload, type CancelledStream, type CancelledWsData, type CancelledWsEvent, type CompletedEvent, type CompletedPayload, type CompletedStream, type CompletedWsData, type CompletedWsEvent, type CrawlErrorCode, type CreateAuditRequestBody, type CreateAuditResponseBody, type CreateAuditResponseData, type DownloadArtifactParams, EventEnum, type EventEnumKeys, type EventPayloadMap, type EventType, type FailedEvent, type FailedPayload, type FailedStream, type FailedWsData, type FailedWsEvent, type ImpactKey, type ImpactLevel, type PageCompletedEvent, type PageCompletedPayload, type PageCompletedStream, type PageCompletedWsData, type PageCompletedWsEvent, type PageFailedEvent, type PageFailedPayload, type PageFailedStream, type PageFailedWsData, type PageFailedWsEvent, type PageSkippedEvent, type PageSkippedPayload, type PageSkippedStream, type PageSkippedWsData, type PageSkippedWsEvent, type PageStartedEvent, type PageStartedPayload, type PageStartedStream, type PageStartedWsData, type PageStartedWsEvent, type ProgressEvent, type ProgressPayload, type ProgressState, type ProgressStream, type ProgressWsData, type ProgressWsEvent, type PublishedEvent, type QueueStatus, type QueuedEvent, type QueuedPayload, type QueuedStream, type QueuedWsData, type QueuedWsEvent, type ServerityBreakdown, type StartedEvent, type StartedPayload, type StartedStream, type StartedWsData, type StartedWsEvent, type StatisticState, type Stats, StatusEnum, type StatusEnumKeys, type TelemetryEvent, type TelemetryPayload, type TelemetryStream, type WsEvent };
