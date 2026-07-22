/**
 * Published when an audit is enqueued for crawling.
 */
export interface AuditQueued {
    payload:   AuditQueuedPayload;
    timestamp: number;
    type:      AuditQueuedType;
    version:   string;
}

export interface AuditQueuedPayload {
    ahead:    number;
    auditId:  string;
    position: number;
    waiting:  number;
}

export type AuditQueuedType = "audit.queued";
