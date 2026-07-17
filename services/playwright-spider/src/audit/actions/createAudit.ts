import type { AuditOptions } from "@equalsite/types";
import type { AuditRepository } from "../repositories/auditRepository";

export interface ICreatedAuditAction {
    run: (params: {
        urls: string[];
        options: AuditOptions
    }) => Promise<string>;
}

export const createAuditAction = (
    auditRepository: AuditRepository
): ICreatedAuditAction => ({
    run: async ({
        urls,
        options
    }) => {
        const audit = await auditRepository.create({
            urls,
            options
        });
        return audit.id;
    }
})
