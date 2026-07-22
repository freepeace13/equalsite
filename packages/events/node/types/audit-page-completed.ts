/**
 * Published when axe-core finishes scanning a single page.
 */
export interface AuditPageCompleted {
    payload:   AuditPageCompletedPayload;
    timestamp: number;
    type:      AuditPageCompletedType;
    version:   string;
}

export interface AuditPageCompletedPayload {
    auditId:           string;
    pageUrl:           string;
    passesCount?:      number;
    severityBreakdown: AuditPageCompletedSeverityBreakdown;
    violationsCount:   number;
}

export interface AuditPageCompletedSeverityBreakdown {
    critical: number;
    minor:    number;
    moderate: number;
    serious:  number;
}

export type AuditPageCompletedType = "audit.page.completed";
