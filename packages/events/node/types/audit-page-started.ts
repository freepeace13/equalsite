/**
 * Published when the crawler begins processing a single page.
 */
export interface AuditPageStarted {
    payload:   AuditPageStartedPayload;
    timestamp: number;
    type:      AuditPageStartedType;
    version:   string;
}

export interface AuditPageStartedPayload {
    attemptsCount: number;
    auditId:       string;
    pageUrl:       string;
}

export type AuditPageStartedType = "audit.page.started";
