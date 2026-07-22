import type { Request, Response } from "express";
import { auditRepository } from "../adapters/redisAuditRepository";
import { crawlerQueue } from "../services/queue";
import { publishEvent } from "../adapters/redisStreamPublisher";
import { createAuditAction as createAuditFactory } from "../../audit/actions/createAudit";
import { createQueuePositionService } from "../../audit/services/queuePositionService";
import type { CreateAuditRequestBody, CreateAuditResponseData } from "@equalsite/types";

const createAuditAction = createAuditFactory(auditRepository);
const queuePositionService = createQueuePositionService(crawlerQueue, publishEvent);

export const CreateAuditController = async (
    request: Request<unknown, unknown, CreateAuditRequestBody>,
    response: Response<CreateAuditResponseData>
) => {
    const urls = request.body.urls;
    const options = request.body.options;

    const auditId = await createAuditAction.run({
        urls,
        options
    });

    await crawlerQueue.add('audit', { auditId }, { jobId: auditId });
    queuePositionService.publishPositions().catch(console.error);

    return response.status(202).json({
        id: auditId,
        options,
    });
}
