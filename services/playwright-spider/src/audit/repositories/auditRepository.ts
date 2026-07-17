import type AuditEntity from "../entities/audit";
import type Status from "../value/status";

export interface AuditRepository {
    find(id: string): Promise<AuditEntity | null>;
    all(): Promise<AuditEntity[]>;
    save(audit: AuditEntity): Promise<void>;
    delete(id: string): Promise<void>;
    exists(id: string): Promise<boolean>;
    findOrFail(id: string): Promise<AuditEntity>;
    create(attributes: Pick<AuditEntity, 'urls' | 'options'>): Promise<AuditEntity>;
    getByStatus(status: Status): Promise<AuditEntity[]>;
}
