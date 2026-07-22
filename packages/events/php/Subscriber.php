<?php

namespace EqualSite\Events;

/**
 * Transport-agnostic subscriber port. The concrete adapter (e.g. a Redis
 * Streams consumer-group reader) implements this and owns all transport I/O;
 * Bus owns all JSON-decoding and event-type dispatch.
 */
interface Subscriber
{
    /**
     * Blocking. Reads messages off the underlying transport and invokes
     * $onMessage(string $rawJson) once per message received.
     *
     * @param callable(string): void $onMessage
     */
    public function subscribe(callable $onMessage): void;
}
