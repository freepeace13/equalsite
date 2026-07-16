import * as Config from '../../config';
import type { Request, Response } from "express";
import { auditRepository } from "../adapters/redisAuditRepository";
import { crawlerQueue } from "../services/queue";
import { createAuditAction as createAuditFactory } from "../../audit/actions/createAudit";
import type { CreateAuditRequestBody, CreateAuditResponseData } from "@equalsite/types";

const createAuditAction = createAuditFactory(auditRepository, Config.secretKey);

export const CreateAuditController = async (
    request: Request<unknown, unknown, CreateAuditRequestBody>,
    response: Response<CreateAuditResponseData>
) => {
    const urls = request.body.urls;
    const options = request.body.options;
    const urlCallback = request.body.callbackUrl;

    const auditId = await createAuditAction.run({
        urls,
        urlCallback,
        options
    });

    await crawlerQueue.add('audit', { auditId }, { jobId: auditId });

    return response.status(202).json({
        id: auditId,
        options,
    });
}
