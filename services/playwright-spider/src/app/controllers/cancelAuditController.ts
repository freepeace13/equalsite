import type { Request, Response } from "express";
import { auditRepository } from "../adapters/redisAuditRepository";
import * as Config from '../../config';
import { crawlerQueue } from "../services/queue";
import { createCancelAuditAction } from "../../audit/actions/cancelAudit";
import { publishEvent } from "../adapters/redisStreamPublisher";
import type { CancelAuditRequestParams, CancelAuditResponseData } from "@equalsite/types";

const cancelAuditAction = createCancelAuditAction(
    auditRepository,
    publishEvent,
    {
        artifactDirectory: Config.crawler.artifactDirectory,
    }
);

export const CancelAuditController = async (
    request: Request<CancelAuditRequestParams>,
    response: Response<CancelAuditResponseData>
) => {
    const auditId = request.params.auditId;

    await cancelAuditAction.run(auditId)

    const job = await crawlerQueue.getJob(auditId);
    const state = await job?.getState();
    if (
        state === 'waiting' ||
        state === 'delayed'
    ) {
        await job?.remove();
    }

    return response.json({
        auditId,
    });
}
