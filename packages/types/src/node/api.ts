type ResponseError = {
    error: string;
    message: string;
}

export type AuditOptions = {
    maxPages: number;
    enqueueLinks: boolean;
    enqueueStrategy: string;
    maxDepth?: number | null;
    includeGlobs?: string[];
    excludeGlobs?: string[];
    captureScreenshot?: boolean;
}

export type CreateAuditRequestBody = {
    urls: string[];
    options: AuditOptions;
}

export interface CreateAuditResponseBody {
    id: string;
    options: AuditOptions;
}
export type CreateAuditResponseData = CreateAuditResponseBody | ResponseError;

export type CancelAuditRequestParams = {
    auditId: string;
}

export type CancelAuditResponseData = CancelAuditRequestParams | ResponseError;
