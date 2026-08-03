import type AuditEntity from "../entities/audit";
import type { AuditRepository } from "../repositories/auditRepository";
import { crawlerMap } from "../services/crawlerMap";
import { clearCancelled } from "../services/cancellationSignal";

export interface IPerformCleanUpAction {
    run: (audit: AuditEntity) => Promise<void>;
}

export const createPerformCleanUpAction = (
    auditRepository: AuditRepository,
): IPerformCleanUpAction => ({
    run: async (audit) => {
        try {
            await crawlerMap.get(audit.id)?.teardown();
            crawlerMap.delete(audit.id);
            clearCancelled(audit.id);
            await auditRepository.delete(audit.id);
            console.log('Cleanup successfully!');
        } catch (err) {
            console.log('Clean up failed: ', err);
        }
    }
});
