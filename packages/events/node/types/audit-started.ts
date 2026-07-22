/**
 * Published when the crawler begins processing an audit.
 */
export interface AuditStarted {
    payload:   AuditStartedPayload;
    timestamp: number;
    type:      AuditStartedType;
    version:   string;
}

export interface AuditStartedPayload {
    auditId: string;
}

export type AuditStartedType = "audit.started";
