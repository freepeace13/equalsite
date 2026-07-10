<?php

namespace App\Support;

use App\Contracts\StreamBus;
use App\Value\RedisStreamData;
use Illuminate\Redis\Connections\Connection;
use Illuminate\Support\Facades\Redis;
use Throwable;

class RedisStream implements StreamBus
{
    protected Connection $connection;

    public function __construct($connection = null)
    {
        $this->setConnection(
            Redis::connection($connection)
        );
    }

    /**
     * Publish event message into a Redis stream.
     *
     * @param  string  $stream  Stream name.
     * @param  string  $event  Event name.
     * @param  array  $payload  Event payload data.
     * @param  int  $maxLen  Approximate max stream length.
     * @return string Redis message ID.
     */
    public function publish(
        string $stream,
        string $event,
        array $payload,
        int $maxLen = 10000
    ): string {
        $payload = json_encode([
            'timestamp' => now()->toISOString(),
            'data' => $payload,
        ], JSON_UNESCAPED_SLASHES);

        return $this->command([
            'XADD',
            $stream,
            'MAXLEN',
            '~',
            $maxLen,
            '*',
            'event',
            $event,
            'version',
            '1',
            'payload',
            $payload,
        ]);
    }

    /**
     * Create consumer group for a stream.
     *
     * @param  string  $stream  Stream name.
     * @param  string  $group  Consumer group name.
     * @param  string  $start  Starting stream position.
     */
    public function createConsumerGroup(
        string $stream,
        string $group,
        string $start = '0'
    ): void {
        try {
            $this->command([
                'XGROUP',
                'CREATE',
                $stream,
                $group,
                $start,
                'MKSTREAM',
            ]);
        } catch (Throwable $e) {

            // BUSYGROUP means already exists
            if (! str_contains($e->getMessage(), 'BUSYGROUP')) {
                throw $e;
            }
        }
    }

    /**
     * Consume messages from a stream consumer group.
     *
     * @param  string  $stream  Stream name.
     * @param  string  $group  Consumer group name.
     * @param  string  $consumer  Unique consumer name.
     * @param  callable(RedisStreamData): void  $handler  Message handler callback.
     * @param  int  $blockMs  Blocking timeout in milliseconds.
     * @param  int  $count  Number of messages per read.
     */
    public function consume(
        string $stream,
        string $group,
        string $consumer,
        callable $handler,
        int $blockMs = 5000,
        int $count = 10
    ): void {
        while (true) {
            $response = $this->command([
                'XREADGROUP',
                'GROUP',
                $group,
                $consumer,
                'BLOCK',
                $blockMs,
                'COUNT',
                $count,
                'STREAMS',
                $stream,
                '>',
            ]);

            if (! $response) {
                continue;
            }

            foreach ($response as $streamData) {
                [$streamName, $messages] = $streamData;
                foreach ($messages as $message) {
                    [$id, $fields] = $message;
                    $parsed = $this->parseFields($fields);
                    $data = json_decode($parsed['data'] ?? '{}', true);
                    try {
                        $handler(
                            new RedisStreamData(
                                id: $id,
                                streamName: $streamName,
                                type: $data['type'] ?? 'unknown',
                                payload: $data['payload'] ?? [],
                                version: $data['version'] ?? 1,
                                timestamp: (int) $data['timestamp'] ?? now()->getTimestampMs()
                            )
                        );
                        $this->ack($stream, $group, $id);
                        usleep(1000);
                    } catch (Throwable $e) {
                        report($e);

                        sleep(2);
                    }
                }
            }
        }
    }

    /**
     * Acknowledge processed message.
     *
     * @param  string  $stream  Stream name.
     * @param  string  $group  Consumer group name.
     * @param  string  $messageId  Redis message ID.
     */
    public function ack(
        string $stream,
        string $group,
        string $messageId
    ): void {
        $this->command([
            'XACK',
            $stream,
            $group,
            $messageId,
        ]);
    }

    /**
     * Get pending messages for a consumer group.
     *
     * @param  string  $stream  Stream name.
     * @param  string  $group  Consumer group name.
     * @return array Pending message info.
     */
    public function pending(
        string $stream,
        string $group
    ): array {
        return $this->command([
            'XPENDING',
            $stream,
            $group,
        ]);
    }

    /**
     * Claim idle/stuck messages for another consumer.
     *
     * @param  string  $stream  Stream name.
     * @param  string  $group  Consumer group name.
     * @param  string  $consumer  Consumer name.
     * @param  int  $idleMs  Minimum idle time in milliseconds.
     * @param  array  $messageIds  Message IDs to claim.
     * @return array Claimed messages.
     */
    public function claim(
        string $stream,
        string $group,
        string $consumer,
        int $idleMs,
        array $messageIds
    ): array {
        return $this->command([
            'XCLAIM',
            $stream,
            $group,
            $consumer,
            $idleMs,
            ...$messageIds,
        ]);
    }

    /**
     * Convert flat Redis field array into associative array.
     *
     * @param  array  $fields  Raw Redis fields.
     * @return array Parsed fields.
     */
    protected function parseFields($fields): array
    {
        if (is_string($fields)) {
            $fields = json_decode($fields, true);
        }

        $parsed = [];

        for ($i = 0; $i < count($fields); $i += 2) {
            $parsed[$fields[$i]] = $fields[$i + 1];
        }

        return $parsed;
    }

    public function command(array $commands)
    {
        return $this->getConnection()->executeRaw($commands);
    }

    public function getConnection(): Connection
    {
        return $this->connection;
    }

    public function setConnection(Connection $connection)
    {
        $this->connection = $connection;

        return $this;
    }
}
