/**
 * Published when an audit crawl finishes successfully, carrying final Crawlee statistics.
 */
export interface AuditCompleted {
    payload:   AuditCompletedPayload;
    timestamp: number;
    type:      AuditCompletedType;
    version:   string;
}

export interface AuditCompletedPayload {
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

export type AuditCompletedType = "audit.completed";
