/**
 * Published periodically with process/system/queue health metrics for a crawler worker.
 */
export interface CrawlerTelemetry {
    payload:   CrawlerTelemetryPayload;
    timestamp: number;
    type:      CrawlerTelemetryType;
    version:   string;
}

export interface CrawlerTelemetryPayload {
    crawlers: CrawlerTelemetryCrawlers;
    process:  CrawlerTelemetryProcess;
    queue:    CrawlerTelemetryQueue;
    system:   CrawlerTelemetrySystem;
}

export interface CrawlerTelemetryCrawlers {
    active: number;
}

export interface CrawlerTelemetryProcess {
    memory: CrawlerTelemetryMemory;
    pid:    number;
    uptime: number;
}

export interface CrawlerTelemetryMemory {
    heapTotal: number;
    heapUsed:  number;
    rss:       number;
}

export interface CrawlerTelemetryQueue {
    active:  number;
    waiting: number;
}

export interface CrawlerTelemetrySystem {
    freeMemory:  number;
    loadAverage: number[];
    totalMemory: number;
}

export type CrawlerTelemetryType = "crawler.telemetry";
