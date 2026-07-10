<?php

namespace App\Value;

use Illuminate\Contracts\Support\Arrayable;

class RedisStreamData implements Arrayable
{
    public function __construct(
        public readonly string $id,
        public readonly string $streamName,
        public readonly string $type,
        public readonly array $payload,
        public readonly string $version,
        public readonly int $timestamp
    ) {}

    public static function fromArray(array $value): static
    {
        return new static(
            id: $value['id'],
            streamName: $value['streamName'],
            type: $value['type'],
            payload: $value['payload'],
            version: $value['version'],
            timestamp: $value['timestamp']
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'streamName' => $this->streamName,
            'type' => $this->type,
            'payload' => $this->payload,
            'version' => $this->version,
            'timestamp' => $this->timestamp,
        ];
    }
}
