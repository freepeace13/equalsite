<?php

namespace App\Listeners;

use App\AggregateRoots\AuditAggregateRoot;
use App\Events\Audit\AuditPageCompleted;
use App\Events\Audit\AuditPageFailed;
use App\Events\Audit\AuditPageSkipped;
use App\Events\Audit\AuditPageStarted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Events\Dispatcher;
use Illuminate\Support\Carbon;

class AuditPageSubscriber implements ShouldQueue
{
    public function handlePageStarted(AuditPageStarted $event): void
    {
        $payload = $event->payload();

        AuditAggregateRoot::retrieve($event->crawlerId())
            ->pageStarted(
                $payload['pageUrl'],
                $payload['attemptsCount'] ?? 0,
                $this->carbonTimestamp($event->timestamp())->toIso8601String(),
            )
            ->persist();
    }

    public function handlePageSkipped(AuditPageSkipped $event): void
    {
        $payload = $event->payload();

        AuditAggregateRoot::retrieve($event->crawlerId())
            ->pageSkipped(
                $payload['pageUrl'],
                $payload['reason'],
                $this->carbonTimestamp($event->timestamp())->toIso8601String(),
            )
            ->persist();
    }

    public function handlePageFailed(AuditPageFailed $event): void
    {
        $payload = $event->payload();

        AuditAggregateRoot::retrieve($event->crawlerId())
            ->pageFailed(
                $payload['pageUrl'],
                $payload['attemptsCount'],
                $payload['errorMessage'],
                $payload['errorCode'] ?? null,
                $this->carbonTimestamp($event->timestamp())->toIso8601String(),
            )
            ->persist();
    }

    public function handlePageCompleted(AuditPageCompleted $event): void
    {
        $payload = $event->payload();

        AuditAggregateRoot::retrieve($event->crawlerId())
            ->pageCompleted(
                $payload['pageUrl'],
                $payload['violationsCount'],
                $payload['severityBreakdown'],
                $this->carbonTimestamp($event->timestamp())->toIso8601String(),
            )
            ->persist();
    }

    protected function carbonTimestamp(int $timestamp): Carbon
    {
        return Carbon::createFromTimestampMs($timestamp);
    }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            AuditPageStarted::class,
            [self::class, 'handlePageStarted']
        );

        $events->listen(
            AuditPageSkipped::class,
            [self::class, 'handlePageSkipped']
        );

        $events->listen(
            AuditPageFailed::class,
            [self::class, 'handlePageFailed']
        );

        $events->listen(
            AuditPageCompleted::class,
            [self::class, 'handlePageCompleted']
        );
    }
}
