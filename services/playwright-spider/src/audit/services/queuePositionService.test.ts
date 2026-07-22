import { describe, expect, it, vi } from "vitest";
import { createQueuePositionService } from "./queuePositionService";

function makeQueue(activeCount: number, waitingJobs: { id?: string }[]) {
    return {
        getActiveCount: vi.fn().mockResolvedValue(activeCount),
        getJobs: vi.fn().mockResolvedValue(waitingJobs),
    };
}

describe("queuePositionService", () => {
    it("publishes nothing when there are no waiting jobs", async () => {
        const queue = makeQueue(2, []);
        const publisher = vi.fn();

        await createQueuePositionService(queue, publisher).publishPositions();

        expect(publisher).not.toHaveBeenCalled();
    });

    it("publishes correct ahead/position/waiting for each waiting job, in dequeue order", async () => {
        const queue = makeQueue(2, [{ id: "job-a" }, { id: "job-b" }, { id: "job-c" }]);
        const publisher = vi.fn();

        await createQueuePositionService(queue, publisher).publishPositions();

        expect(queue.getJobs).toHaveBeenCalledWith(['waiting'], 0, -1, true);
        expect(publisher).toHaveBeenCalledTimes(3);
        expect(publisher).toHaveBeenNthCalledWith(1, expect.objectContaining({
            payload: { auditId: "job-a", ahead: 2, position: 3, waiting: 3 },
        }));
        expect(publisher).toHaveBeenNthCalledWith(2, expect.objectContaining({
            payload: { auditId: "job-b", ahead: 3, position: 4, waiting: 3 },
        }));
        expect(publisher).toHaveBeenNthCalledWith(3, expect.objectContaining({
            payload: { auditId: "job-c", ahead: 4, position: 5, waiting: 3 },
        }));
    });

    it("skips jobs with an undefined id and does not let them consume an index slot", async () => {
        const queue = makeQueue(0, [{ id: "job-a" }, { id: undefined }, { id: "job-b" }]);
        const publisher = vi.fn();

        await createQueuePositionService(queue, publisher).publishPositions();

        expect(publisher).toHaveBeenCalledTimes(2);
        expect(publisher).toHaveBeenNthCalledWith(1, expect.objectContaining({
            payload: { auditId: "job-a", ahead: 0, position: 1, waiting: 2 },
        }));
        expect(publisher).toHaveBeenNthCalledWith(2, expect.objectContaining({
            payload: { auditId: "job-b", ahead: 1, position: 2, waiting: 2 },
        }));
    });
});
