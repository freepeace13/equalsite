import type { AnyEvent } from './any-event';

/**
 * Transport-agnostic publisher port. The concrete adapter (e.g. a Redis XADD
 * writer) just serializes and ships the already-fully-formed envelope Bus
 * hands it.
 */
export type Publisher = (envelope: AnyEvent) => Promise<void>;
