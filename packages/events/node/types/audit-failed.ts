/**
 * Published when an audit crawl fails outright.
 */
export interface AuditFailed {
    payload:   AuditFailedPayload;
    timestamp: number;
    type:      AuditFailedType;
    version:   string;
}

export interface AuditFailedPayload {
    auditId: string;
    error:   string;
}

export type AuditFailedType = "audit.failed";
