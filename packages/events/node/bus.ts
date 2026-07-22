import type { AnyEvent, PublishableEvent } from './any-event';
import type { Publisher } from './publisher';

const EVENT_VERSION = '1';

let publisherAdapter: Publisher | null = null;

function publisher(adapter: Publisher): void {
    publisherAdapter = adapter;
}

async function publish(event: PublishableEvent): Promise<void> {
    if (!publisherAdapter) {
        throw new Error('Bus.publisher() must be called with a publisher adapter before Bus.publish() can be used.');
    }

    const envelope = {
        type: event.type,
        payload: event.payload,
        version: EVENT_VERSION,
        timestamp: Date.now(),
    } as AnyEvent;

    await publisherAdapter(envelope);
}

export const Bus = { publisher, publish };
