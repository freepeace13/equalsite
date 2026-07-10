<?php

namespace App\Events\Audit;

use App\Value\RedisStreamData;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Support\Carbon;

abstract class BaseEvent implements ShouldBroadcast
{
    public RedisStreamData $streamData;

    public function __construct(RedisStreamData $streamData)
    {
        $this->streamData = $streamData;
    }

    abstract public function broadcastData(RedisStreamData $stream): array;

    public function payload(): array
    {
        return $this->streamData->payload;
    }

    public function timestamp(): int
    {
        return $this->streamData->timestamp;
    }

    public function crawlerId(): string
    {
        return $this->payload()['auditId'];
    }

    public function broadcastOn()
    {
        return [
            new Channel('audit-'.$this->crawlerId().'-scanning'),
        ];
    }

    public function broadcastAs(): string
    {
        return $this->streamData->type;
    }

    public function broadcastWhen(): bool
    {
        return true;
    }

    public function broadcastWith(): array
    {
        $carbonTimestamp = Carbon::createFromTimestampMs($this->streamData->timestamp);

        return [
            'type' => $this->streamData->type,
            'version' => $this->streamData->version,
            'data' => $this->broadcastData($this->streamData),
            'timestamp' => $carbonTimestamp->toIso8601String(),
        ];
    }
}
