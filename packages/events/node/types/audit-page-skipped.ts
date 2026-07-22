/**
 * Published when the crawler skips a page without attempting it.
 */
export interface AuditPageSkipped {
    payload:   AuditPageSkippedPayload;
    timestamp: number;
    type:      AuditPageSkippedType;
    version:   string;
}

export interface AuditPageSkippedPayload {
    auditId: string;
    pageUrl: string;
    reason:  string;
}

export type AuditPageSkippedType = "audit.page.skipped";
