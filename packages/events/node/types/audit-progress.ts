/**
 * Published periodically while an audit crawl is in progress.
 */
export interface AuditProgress {
    payload:   AuditProgressPayload;
    timestamp: number;
    type:      AuditProgressType;
    version:   string;
}

export interface AuditProgressPayload {
    auditId:            string;
    completedRequests:  number;
    pendingRequests:    number;
    progressPercentage: number;
    totalRequests:      number;
}

export type AuditProgressType = "audit.progress";
