import { EventEnum } from "@equalsite/types";
import type { CrawlErrorCode } from "@equalsite/types";
import type { EventPublisherParams } from "../repositories/eventPublisher";

export const failedEvent = (payload: {
    auditId: string;
    error: string;
    errorCode: CrawlErrorCode;
}): EventPublisherParams<typeof EventEnum.Failed> => ({
    type: EventEnum.Failed,
    payload
});
