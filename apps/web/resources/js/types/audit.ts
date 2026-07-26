import type { ProgressState, QueueStatus } from '@equalsite/types';

export enum ImpactLevel {
    critical = 0,
    serious = 1,
    moderate = 2,
    minor = 3,
}

export type ImpactLevelKey = keyof typeof ImpactLevel;

export type ScanStatus =
    | 'queued'
    | 'started'
    | 'failed'
    | 'cancelled'
    | 'completed';

export type UrlStatus = 'started' | 'failed' | 'completed' | 'skipped';

export type ScanQueue = QueueStatus;
export type ScanProgress = ProgressState;

export type ScanInfo = {
    auditId: string;
    siteUrl: string;
    status: ScanStatus;
    failureReason?: string;
    failureCode?: string;
    startedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    createdAt: string;
};

export type AuditPage = {
    url: string;
    status: UrlStatus;
    attemptsCount: number | null;
    createdAt: string;
    startedAt: string | null;
    completedAt: string | null;
    failedAt: string | null;
    skippedAt: string | null;
    lastActivityAt: string;
    violationsCount: number | null;
    criticalCount: number | null;
    seriousCount: number | null;
    moderateCount: number | null;
    minorCount: number | null;
    errorCode: string | null;
    errorMessage: string | null;
    skippingReason: string | null;
};

export interface RemediationSampleNode {
    url: string;
    target: string;
    html: string;
    fingerprint: string;
}

export interface RemediationGroup {
    violationId: number;
    ruleId: string;
    impact: string;
    impactLabel: string;
    summary: string;
    failureSummary: string | null;
    helpUrl: string | null;
    fixInstruction: string | null;
    remediationScope: string;
    clusterReason: string;
    affectedPagesCount: number;
    instancesCount: number;
    samplePages: string[];
    sampleTargets: string[];
    sampleNodes: RemediationSampleNode[];
    affectedPages: string[];
}

export interface Remediation {
    groupsCount: number;
    groups: RemediationGroup[];
}

export interface DiscoveredPageViolation {
    id: number;
    ruleId: string;
    impact: string;
    impactLabel: string;
    summary: string;
    instancesOnPage: number;
}

export interface ReportPages {
    discovered: string[];
    atRisk: PageAtRisk[];
    violationsByUrl: Record<string, DiscoveredPageViolation[]>;
}

export interface PageAtRisk {
    url: string;
    issuesFound: number;
}

export type ViolationInstance = {
    fingerprint: string;
    html: string;
    target: string;
    affectedUrls: string[];
};

export type Violation = {
    auditId: string;
    ruleId: string;
    impactLevel: ImpactLevelKey;
    description: string;
    translatedDescription?: string;
    failureSummary: string;
    translatedFailureSummary?: string;
    helpUrl: string;
    totalAffectedUrls: number;
    totalUniqueInstances: number;
    instances: ViolationInstance[];
};

export interface IViolation {
    auditId: string;
    ruleId: string;
    impact: string;
    summary: string;
    failureSummary: string;
    helpUrl: string;
    fixInstruction?: string;
    remediationScope: string;
    clusterReason: string;
    affectedPagesCount: number;
    instancesCount: number;
    nodes: {
        fingerprint: string;
        html: string;
        target: string;
        urls: string[];
    }[];
}
