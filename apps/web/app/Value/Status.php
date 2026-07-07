<?php

namespace App\Value;

enum Status: string
{
    case Queued = 'queued';
    case Started = 'started';
    case Cancelled = 'cancelled';
    case Failed = 'failed';
    case Completed = 'completed';

    public function queued(): bool
    {
        return $this === self::Queued;
    }

    public function started(): bool
    {
        return $this === self::Started;
    }

    public function failed(): bool
    {
        return $this === self::Failed;
    }

    public function completed(): bool
    {
        return $this === self::Completed;
    }

    public function cancelled(): bool
    {
        return $this === self::Cancelled;
    }

    public function cancellable(): bool
    {
        return $this === self::Queued || $this === self::Started;
    }
}
