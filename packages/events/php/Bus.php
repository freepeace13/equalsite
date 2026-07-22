<?php

namespace EqualSite\Events;

use InvalidArgumentException;
use RuntimeException;
use stdClass;

/**
 * Static façade over the crawler event bus — consume side only.
 *
 * Bus::subscriber($adapter)   — cheap; call from a service provider's boot().
 * Bus::listen(SomeEvent::class, fn (SomeEvent $e) => ...)
 * Bus::listen('*', fn ($e) => ...)
 * Bus::consume()              — blocking; call once, after all listen() calls
 *                                 (e.g. from an artisan command).
 */
final class Bus
{
    private const WILDCARD = '*';

    private static ?Subscriber $subscriber = null;

    /** @var array<string, list<callable>> keyed by event type string (e.g. "audit.cancelled"), plus a '*' bucket */
    private static array $listeners = [];

    private function __construct()
    {
        // static-only façade
    }

    public static function subscriber(Subscriber $subscriber): void
    {
        self::$subscriber = $subscriber;
    }

    /**
     * @param class-string|'*' $type Either a generated event DTO's ::class, or '*' for every event.
     */
    public static function listen(string $type, callable $listener): void
    {
        self::$listeners[self::resolveListenerKey($type)][] = $listener;
    }

    /**
     * Starts the blocking read loop. Must be called only after subscriber()
     * and all listen() registrations have happened.
     */
    public static function consume(): void
    {
        if (self::$subscriber === null) {
            throw new RuntimeException('Bus::subscriber() must be called before Bus::consume().');
        }

        self::$subscriber->subscribe(static function (string $rawJson): void {
            self::dispatch($rawJson);
        });
    }

    private static function dispatch(string $rawJson): void
    {
        // json_decode WITHOUT `true` — generated DTOs' ::from() expects stdClass.
        $decoded = json_decode($rawJson);

        if (!($decoded instanceof stdClass) || !isset($decoded->type) || !is_string($decoded->type)) {
            throw new RuntimeException('Bus received a malformed event envelope: missing or invalid "type".');
        }

        $class = EventTypeMap::classFor($decoded->type);

        if ($class === null) {
            // No generated DTO for this type (e.g. producer is ahead of this consumer's
            // package version). Nothing safe to construct — skip rather than crash the loop.
            return;
        }

        $event = $class::from($decoded);

        foreach (self::$listeners[$decoded->type] ?? [] as $listener) {
            $listener($event);
        }

        foreach (self::$listeners[self::WILDCARD] ?? [] as $listener) {
            $listener($event);
        }
    }

    /**
     * @param class-string|'*' $type
     */
    private static function resolveListenerKey(string $type): string
    {
        if ($type === self::WILDCARD) {
            return self::WILDCARD;
        }

        $eventType = EventTypeMap::typeFor($type);

        if ($eventType === null) {
            throw new InvalidArgumentException("Bus::listen() was given an unrecognized event class: {$type}");
        }

        return $eventType;
    }
}
