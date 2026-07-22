import type { AuditRepository } from "../repositories/auditRepository";
import type { EventPublisher } from "../repositories/eventPublisher";
import { createAuditService } from "../services/auditService";
import { createArtifactService } from "../services/artifactService";
import { crawlerMap } from "../services/crawlerMap";

export interface ICancelAuditAction {
    run: (auditId: string) => Promise<void>;
}

export const createCancelAuditAction = (
    auditRepository: AuditRepository,
    eventPublisher: EventPublisher,
    config: {
        artifactDirectory: string;
        archiveDirectory: string;
    }
): ICancelAuditAction => {
    const auditService = createAuditService(auditRepository, eventPublisher);
    const artifactService = createArtifactService(config.artifactDirectory, config.archiveDirectory);
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
                    crawler.stop('Audit cancelled by user');
                } else {
                    await auditRepository.save(audit.markAsCancelled());
                }
                await artifactService.cleanup(audit.id);
            } catch (err) {
                console.error(err);
            } finally {
                await auditRepository.delete(audit.id);
                crawlerMap.delete(audit.id);
            }
        }
    }
}
