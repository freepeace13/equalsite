const cancelledAuditIds = new Set<string>();

export const markCancelled = (auditId: string): void => {
    cancelledAuditIds.add(auditId);
};

export const isCancelled = (auditId: string): boolean => {
    return cancelledAuditIds.has(auditId);
};

export const clearCancelled = (auditId: string): void => {
    cancelledAuditIds.delete(auditId);
};
