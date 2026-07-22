<?php

namespace App\Listeners;

use App\Events\Audit\AuditPageCompleted;
use App\Events\Audit\AuditPageFailed;
use App\Events\Audit\AuditPageSkipped;
use App\Events\Audit\AuditPageStarted;
use App\Events\Audit\BaseEvent;
use App\Models\Audit;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Events\Dispatcher;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AuditPageSubscriber implements ShouldQueue
{
    // public function middleware(BaseEvent $event)
    // {
    //     return [
    //         (new WithoutOverlapping('audit-' . $event->crawlerId()))->shared()
    //     ];
    // }

    public function handlePageStarted(AuditPageStarted $event): void
    {
        $payload = $event->payload();
        $timestamp = $this->carbonTimestamp($event->timestamp());

        Log::channel('audit')->debug('Page Started', $event->payload());

        $this->updatePage($event->crawlerId(), $payload['pageUrl'], [
            'status' => 'started',
            'attemptsCount' => $payload['attemptsCount'] ?? 0,
            'startedAt' => $timestamp->toIso8601String(),
        ]);
    }

    public function handlePageSkipped(AuditPageSkipped $event): void
    {
        $payload = $event->payload();
        $timestamp = $this->carbonTimestamp($event->timestamp());

        Log::channel('audit')->debug('Page skipped', $event->payload());

        $this->updatePage($event->crawlerId(), $payload['pageUrl'], [
            'status' => 'skipped',
            'skippingReason' => $payload['reason'],
            'skippedAt' => $timestamp->toIso8601String(),
        ]);
    }

    public function handlePageFailed(AuditPageFailed $event): void
    {
        $payload = $event->payload();
        $timestamp = $this->carbonTimestamp($event->timestamp());

        Log::channel('audit')->debug('Page failed', $event->payload());

        $this->updatePage($event->crawlerId(), $payload['pageUrl'], [
            'status' => 'failed',
            'attemptsCount' => $payload['attemptsCount'],
            'errorMessage' => $payload['errorMessage'],
            'errorCode' => $payload['errorCode'] ?? null,
            'failedAt' => $timestamp->toIso8601String(),
        ]);
    }

    public function handlePageCompleted(AuditPageCompleted $event): void
    {
        $payload = $event->payload();
        $timestamp = $this->carbonTimestamp($event->timestamp());

        Log::channel('audit')->debug('Page completed', $event->payload());

        $this->updatePage($event->crawlerId(), $payload['pageUrl'], [
            'status' => 'completed',
            'violationsCount' => $payload['violationsCount'],
            'severityBreakdown' => $payload['severityBreakdown'],
            'completedAt' => $timestamp->toIso8601String(),
        ]);
    }

    protected function updatePage(string $crawlerId, string $url, array $attributes = []): void
    {
        DB::transaction(function () use ($crawlerId, $url, $attributes) {
            $audit = Audit::where('crawler_id', $crawlerId)
                ->lockForUpdate()
                ->first();

            if ($audit) {
                $audit->tapCustomData('scanned_urls', function (array $prev) use ($url, $attributes) {
                    $prevAttr = $prev[$url] ?? [];
                    $prev[$url] = [...$prevAttr, ...$attributes];

                    return $prev;
                }, []);
            }
        });
    }

    protected function carbonTimestamp(int $timestamp)
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
