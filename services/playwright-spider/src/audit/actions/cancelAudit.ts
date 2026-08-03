import path from "node:path";
import type { AuditRepository } from "../repositories/auditRepository";
import type { EventPublisher } from "../repositories/eventPublisher";
import { createAuditService } from "../services/auditService";
import { deleteDirectoryIfExists } from "../utils/fsDirectory";
import { crawlerMap } from "../services/crawlerMap";
import { markCancelled } from "../services/cancellationSignal";

export interface ICancelAuditAction {
    run: (auditId: string) => Promise<void>;
}

export const createCancelAuditAction = (
    auditRepository: AuditRepository,
    eventPublisher: EventPublisher,
    config: {
        artifactDirectory: string;
    }
): ICancelAuditAction => {
    const auditService = createAuditService(auditRepository, eventPublisher);
    return {
        run: async (auditId) => {
            const audit = await auditRepository.findOrFail(auditId);

            if (! audit.status.is('active')) {
                return;
            }

            try {
                const crawler = crawlerMap.get(audit.id);
                if (crawler) {
                    await auditService.cancelAudit(audit, crawler);
                    markCancelled(audit.id);
                    crawler.stop('Audit cancelled by user');
                } else {
                    await auditRepository.save(audit.markAsCancelled());
                }
                await deleteDirectoryIfExists(path.join(config.artifactDirectory, String(audit.id)));
            } catch (err) {
                console.error(err);
            } finally {
                await auditRepository.delete(audit.id);
            }
        }
    }
}
