import { EventEnum } from "@equalsite/types";
import type { CrawlErrorCode } from "@equalsite/types";
import type { EventPublisherParams } from "../repositories/eventPublisher";

export const pageFailedEvent = (payload: {
    auditId: string;
    pageUrl: string;
    attemptsCount: number;
    errorMessage: string;
    errorCode: CrawlErrorCode;
}): EventPublisherParams<typeof EventEnum.PageFailed> => ({
    type: EventEnum.PageFailed,
    payload
});
