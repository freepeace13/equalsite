import type AuditEntity from "../entities/audit";

export function wasCancelledExternally(freshAudit: AuditEntity | null): boolean {
    return freshAudit === null || freshAudit.status.is('cancelled');
}
