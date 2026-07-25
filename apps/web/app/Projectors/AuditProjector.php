<?php

namespace App\Projectors;

use App\Models\Audit;
use App\StorableEvents\Audit\AuditPageWasCompleted;
use App\StorableEvents\Audit\AuditPageWasFailed;
use App\StorableEvents\Audit\AuditPageWasSkipped;
use App\StorableEvents\Audit\AuditPageWasStarted;
use App\StorableEvents\Audit\AuditProgressWasUpdated;
use App\StorableEvents\Audit\AuditQueueStateWasUpdated;
use App\StorableEvents\Audit\AuditWasCancelled;
use App\StorableEvents\Audit\AuditWasCompleted;
use App\StorableEvents\Audit\AuditWasCreated;
use App\StorableEvents\Audit\AuditWasFailed;
use App\StorableEvents\Audit\AuditWasStarted;
use App\Value\Status;
use Spatie\EventSourcing\EventHandlers\Projectors\Projector;
use Spatie\EventSourcing\StoredEvents\ShouldBeStored;

class AuditProjector extends Projector
{
    public function onAuditWasCreated(AuditWasCreated $event): void
    {
        Audit::create([
            'user_id' => $event->userId,
            'url' => $event->url,
            'domain' => $event->domain,
            'status' => Status::Queued,
            'crawler_id' => $event->aggregateRootUuid(),
        ]);
    }

    public function onAuditQueueStateWasUpdated(AuditQueueStateWasUpdated $event): void
    {
        $this->audit($event)?->setCustomData('queue_state', [
            'position' => $event->position,
            'ahead' => $event->ahead,
            'waiting' => $event->waiting,
        ]);
    }

    public function onAuditWasStarted(AuditWasStarted $event): void
    {
        $this->audit($event)?->update([
            'status' => Status::Started,
            'started_at' => $event->startedAt,
        ]);
    }

    public function onAuditProgressWasUpdated(AuditProgressWasUpdated $event): void
    {
        $this->audit($event)?->setCustomData('progress_state', [
            'completedRequests' => $event->completedRequests,
            'pendingRequests' => $event->pendingRequests,
            'totalRequests' => $event->totalRequests,
            'progressPercentage' => $event->progressPercentage,
        ]);
    }

    public function onAuditPageWasStarted(AuditPageWasStarted $event): void
    {
        $this->mergeScannedUrl($event, $event->url, [
            'status' => 'started',
            'attemptsCount' => $event->attemptsCount,
            'startedAt' => $event->startedAt,
        ]);
    }

    public function onAuditPageWasSkipped(AuditPageWasSkipped $event): void
    {
        $this->mergeScannedUrl($event, $event->url, [
            'status' => 'skipped',
            'skippingReason' => $event->reason,
            'skippedAt' => $event->skippedAt,
        ]);
    }

    public function onAuditPageWasFailed(AuditPageWasFailed $event): void
    {
        $this->mergeScannedUrl($event, $event->url, [
            'status' => 'failed',
            'attemptsCount' => $event->attemptsCount,
            'errorMessage' => $event->errorMessage,
            'errorCode' => $event->errorCode,
            'failedAt' => $event->failedAt,
        ]);
    }

    public function onAuditPageWasCompleted(AuditPageWasCompleted $event): void
    {
        $this->mergeScannedUrl($event, $event->url, [
            'status' => 'completed',
            'violationsCount' => $event->violationsCount,
            'severityBreakdown' => $event->severityBreakdown,
            'completedAt' => $event->completedAt,
        ]);
    }

    public function onAuditWasFailed(AuditWasFailed $event): void
    {
        $this->audit($event)?->update([
            'status' => Status::Failed,
            'failure_reason' => $event->reason,
            'failure_code' => $event->code,
        ]);
    }

    public function onAuditWasCompleted(AuditWasCompleted $event): void
    {
        $this->audit($event)?->update([
            'status' => Status::Completed,
            'completed_at' => $event->completedAt,
        ]);
    }

    public function onAuditWasCancelled(AuditWasCancelled $event): void
    {
        $this->audit($event)?->update([
            'status' => Status::Cancelled,
            'cancelled_at' => $event->cancelledAt,
        ]);
    }

    protected function mergeScannedUrl(ShouldBeStored $event, string $url, array $attributes): void
    {
        $this->audit($event)?->tapCustomData('scanned_urls', function (array $prev) use ($url, $attributes) {
            $prevAttr = $prev[$url] ?? [];
            $prev[$url] = [...$prevAttr, ...$attributes];

            return $prev;
        }, []);
    }

    protected function audit(ShouldBeStored $event): ?Audit
    {
        return Audit::where('crawler_id', $event->aggregateRootUuid())->first();
    }
}
