/**
 * Published when an audit crawl is cancelled mid-run, carrying statistics up to the
 * cancellation point.
 */
export interface AuditCancelled {
    payload:   AuditCancelledPayload;
    timestamp: number;
    type:      AuditCancelledType;
    version:   string;
}

export interface AuditCancelledPayload {
    auditId:                            string;
    crawlerFinishedAt:                  null | string;
    crawlerRuntimeMillis:               number;
    crawlerStartedAt:                   null | string;
    errors:                             { [key: string]: unknown };
    requestMaxDurationMillis:           number;
    requestMinDurationMillis:           number;
    requestsFailed:                     number;
    requestsFailedPerMinute:            number;
    requestsFinished:                   number;
    requestsFinishedPerMinute:          number;
    requestsRetries:                    number;
    requestsWithStatusCode:             { [key: string]: number };
    requestTotalFailedDurationMillis:   number;
    requestTotalFinishedDurationMillis: number;
    retryErrors:                        { [key: string]: unknown };
    statsPersistedAt:                   null | string;
}

export type AuditCancelledType = "audit.cancelled";
