/**
 * Published when the crawler exhausts retries attempting a page.
 */
export interface AuditPageFailed {
    payload:   AuditPageFailedPayload;
    timestamp: number;
    type:      AuditPageFailedType;
    version:   string;
}

export interface AuditPageFailedPayload {
    attemptsCount: number;
    auditId:       string;
    errorMessage:  string;
    pageUrl:       string;
}

export type AuditPageFailedType = "audit.page.failed";
