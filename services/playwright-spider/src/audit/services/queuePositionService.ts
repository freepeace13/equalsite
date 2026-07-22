import type { EventPublisher } from "../repositories/eventPublisher";
import { queuedEvent } from "../events/queuedEvent";

export interface QueuePositionQueue {
    getActiveCount(): Promise<number>;
    getJobs(types: ['waiting'], start: number, end: number, asc: boolean): Promise<{ id?: string }[]>;
}

export const createQueuePositionService = (
    queue: QueuePositionQueue,
    eventPublisher: EventPublisher
) => ({
    publishPositions: async () => {
        const [activeCount, waitingJobs] = await Promise.all([
            queue.getActiveCount(),
            queue.getJobs(['waiting'], 0, -1, true),
        ]);

        const jobsWithId = waitingJobs.filter(
            (job): job is { id: string } => typeof job.id === 'string'
        );

        await Promise.all(
            jobsWithId.map((job, i) =>
                eventPublisher(queuedEvent({
                    auditId: job.id,
                    ahead: activeCount + i,
                    position: activeCount + i + 1,
                    waiting: jobsWithId.length,
                }))
            )
        );
    }
});
