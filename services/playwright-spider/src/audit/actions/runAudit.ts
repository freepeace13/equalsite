import type { AuditRepository } from "../repositories/auditRepository";
import createPlaywrightCrawler from "./crawlerFactory";
import type { EventPublisher } from "../repositories/eventPublisher";
import { crawlerMap } from "../services/crawlerMap";
import { createAuditService } from "../services/auditService";
import { createPerformCleanUpAction } from "./performCleanUp";
import { createArtifactStorage } from "../services/artifactStorage";
import { wasCancelledExternally } from "./cancellationGuard";
import path from "node:path";
import type { StorageConfig } from "../../config";

export interface IRunAuditAction {
    run: (auditId: string) => Promise<void>;
}

export const createRunAuditAction = (
    auditRepository: AuditRepository,
    eventPublisher: EventPublisher,
    config: {
        artifactDirectory: string;
        storage: StorageConfig;
    }
): IRunAuditAction => {
    const {
        artifactDirectory,
        storage,
    } = config;
    const auditService = createAuditService(auditRepository, eventPublisher);
    const artifactStorage = createArtifactStorage(storage);
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

                if (wasCancelledExternally(await auditRepository.find(auditId))) {
                    return;
                }

                await artifactStorage.publish(audit.id, path.join(artifactDirectory, String(audit.id)));
                await auditService.completeAudit(audit, crawler);
            } catch (err) {
                if (wasCancelledExternally(await auditRepository.find(auditId))) {
                    return;
                }

                console.error(err);
                await auditService.failAudit(audit, err);
                throw err;
            } finally {
                await performCleanUpAction.run(audit);
            }
        }
    }
}
