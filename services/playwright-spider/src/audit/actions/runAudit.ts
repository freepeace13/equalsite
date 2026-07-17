import type { AuditRepository } from "../repositories/auditRepository";
import createPlaywrightCrawler from "./crawlerFactory";
import type { EventPublisher } from "../repositories/eventPublisher";
import { crawlerMap } from "../services/crawlerMap";
import { createAuditService } from "../services/auditService";
import { createPerformCleanUpAction } from "./performCleanUp";
import { createArtifactService } from "../services/artifactService";

export interface IRunAuditAction {
    run: (auditId: string) => Promise<void>;
}

export const createRunAuditAction = (
    auditRepository: AuditRepository,
    eventPublisher: EventPublisher,
    config: {
        secretKey: string;
        artifactDirectory: string;
        archiveDirectory: string;
    }
): IRunAuditAction => {
    const {
        artifactDirectory,
        archiveDirectory,
        secretKey
    } = config;
    const auditService = createAuditService(auditRepository, eventPublisher);
    const artifactService = createArtifactService(artifactDirectory, archiveDirectory);
    const performCleanUpAction = createPerformCleanUpAction(auditRepository);
    return {
        run: async (auditId) => {
            const audit = await auditRepository.findOrFail(auditId);

            if (!audit.status.is('waiting')) {
                return;
            }

            const crawler = createPlaywrightCrawler({
                auditId,
                eventPublisher,
                artifactDirectory,
                options: audit.options
            });

            crawlerMap.set(audit.id, crawler);

            try {
                await auditService.startAudit(audit)
                await crawler.run(audit.urls);
                await artifactService.compress(audit.id);
                await auditService.completeAudit(audit, crawler);
            } catch (err) {
                console.error(err);
                await auditService.failAudit(audit, err);
                throw err;
            } finally {
                await performCleanUpAction.run(audit);
            }
        }
    }
}
