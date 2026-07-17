import type { StatisticState } from "crawlee";
import type { EventPublisherParams } from "../repositories/eventPublisher";
import { EventEnum } from "@equalsite/types";

export const completedEvent = (payload: {
    auditId: string;
    statistics: StatisticState,
}): EventPublisherParams<typeof EventEnum.Completed> => ({
    type: EventEnum.Completed,
    payload: {
        auditId: payload.auditId,
        ...payload.statistics
    }
});
