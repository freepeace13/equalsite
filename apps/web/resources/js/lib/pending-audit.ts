const STORAGE_KEY = 'equalsite:pending-audit';

export type PendingAuditRequest = {
    url: string;
    crawlDepth: string;
    include: string;
    exclude: string;
    sameDomain: boolean;
};

/** Called when a guest submits the audit form, right before the auth modal opens. */
export function savePendingAudit(request: PendingAuditRequest): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(request));
}

export function clearPendingAudit(): void {
    sessionStorage.removeItem(STORAGE_KEY);
}

/**
 * Reads and clears the pending audit in one step — it's meant to fire the
 * stored request exactly once, right after the login/register redirect lands.
 */
export function takePendingAudit(): PendingAuditRequest | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return null;
    }

    clearPendingAudit();

    try {
        return JSON.parse(raw) as PendingAuditRequest;
    } catch {
        return null;
    }
}
