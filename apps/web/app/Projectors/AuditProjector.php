<?php

namespace App\Projectors;

use App\Models\Audit;
use App\Models\AuditPage;
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
        $audit = Audit::create([
            'user_id' => $event->userId,
            'url' => $event->url,
            'domain' => $event->domain,
            'status' => Status::Queued,
            'crawler_id' => $event->aggregateRootUuid(),
        ]);

        $audit->setCustomData('request_params', $event->requestParams);
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
        $this->upsertPage($event, $event->url, [
            'status' => 'started',
            'attempts_count' => $event->attemptsCount,
            'started_at' => $event->startedAt,
            'last_activity_at' => $event->startedAt,
        ]);
    }

    public function onAuditPageWasSkipped(AuditPageWasSkipped $event): void
    {
        $this->upsertPage($event, $event->url, [
            'status' => 'skipped',
            'skipping_reason' => $event->reason,
            'skipped_at' => $event->skippedAt,
            'last_activity_at' => $event->skippedAt,
        ]);
    }

    public function onAuditPageWasFailed(AuditPageWasFailed $event): void
    {
        $this->upsertPage($event, $event->url, [
            'status' => 'failed',
            'attempts_count' => $event->attemptsCount,
            'error_message' => $event->errorMessage,
            'error_code' => $event->errorCode,
            'failed_at' => $event->failedAt,
            'last_activity_at' => $event->failedAt,
        ]);
    }

    public function onAuditPageWasCompleted(AuditPageWasCompleted $event): void
    {
        $this->upsertPage($event, $event->url, [
            'status' => 'completed',
            'violations_count' => $event->violationsCount,
            'critical_count' => $event->severityBreakdown['critical'],
            'serious_count' => $event->severityBreakdown['serious'],
            'moderate_count' => $event->severityBreakdown['moderate'],
            'minor_count' => $event->severityBreakdown['minor'],
            'completed_at' => $event->completedAt,
            'last_activity_at' => $event->completedAt,
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
        $audit = $this->audit($event);

        if (! $audit) {
            return;
        }

        $audit->update([
            'status' => Status::Completed,
            'completed_at' => $event->completedAt,
        ]);

        // Crawlee's own maxRequestsPerCrawl/retry bounding can abandon an in-flight page without
        // ever emitting a page.completed/page.failed event for it. Sweep any pages still stuck at
        // 'started' so the UI never shows a permanently unresolved page for a completed audit.
        $audit->pages()->where('status', 'started')->update([
            'status' => 'failed',
            'error_code' => 'abandoned_incomplete',
            'error_message' => 'Audit completed before this page finished processing.',
            'failed_at' => $event->completedAt,
            'last_activity_at' => $event->completedAt,
        ]);
    }

    public function onAuditWasCancelled(AuditWasCancelled $event): void
    {
        $this->audit($event)?->update([
            'status' => Status::Cancelled,
            'cancelled_at' => $event->cancelledAt,
        ]);
    }

    protected function upsertPage(ShouldBeStored $event, string $url, array $attributes): void
    {
        $audit = $this->audit($event);

        if (! $audit) {
            return;
        }

        AuditPage::updateOrCreate(
            ['audit_id' => $audit->id, 'url' => $url],
            $attributes,
        );
    }

    protected function audit(ShouldBeStored $event): ?Audit
    {
        return Audit::where('crawler_id', $event->aggregateRootUuid())->first();
    }
}
