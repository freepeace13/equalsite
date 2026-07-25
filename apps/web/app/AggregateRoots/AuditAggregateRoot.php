<?php

namespace App\AggregateRoots;

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
use Spatie\EventSourcing\AggregateRoots\AggregateRoot;

class AuditAggregateRoot extends AggregateRoot
{
    protected Status $status = Status::Queued;

    public function create(int $userId, string $url, string $domain): self
    {
        $this->recordThat(new AuditWasCreated($userId, $url, $domain));

        return $this;
    }

    public function updateQueueState(int $position, int $ahead, int $waiting): self
    {
        $this->recordThat(new AuditQueueStateWasUpdated($position, $ahead, $waiting));

        return $this;
    }

    public function start(string $startedAt): self
    {
        $this->recordThat(new AuditWasStarted($startedAt));

        return $this;
    }

    public function updateProgress(int $completed, int $pending, int $total, float $percentage): self
    {
        $this->recordThat(new AuditProgressWasUpdated($completed, $pending, $total, $percentage));

        return $this;
    }

    public function pageStarted(string $url, int $attemptsCount, string $startedAt): self
    {
        $this->recordThat(new AuditPageWasStarted($url, $attemptsCount, $startedAt));

        return $this;
    }

    public function pageSkipped(string $url, string $reason, string $skippedAt): self
    {
        $this->recordThat(new AuditPageWasSkipped($url, $reason, $skippedAt));

        return $this;
    }

    public function pageFailed(
        string $url,
        int $attemptsCount,
        string $errorMessage,
        ?string $errorCode,
        string $failedAt,
    ): self {
        $this->recordThat(new AuditPageWasFailed($url, $attemptsCount, $errorMessage, $errorCode, $failedAt));

        return $this;
    }

    /**
     * @param  array{critical: int, serious: int, moderate: int, minor: int}  $severityBreakdown
     */
    public function pageCompleted(
        string $url,
        int $violationsCount,
        array $severityBreakdown,
        string $completedAt,
    ): self {
        $this->recordThat(new AuditPageWasCompleted($url, $violationsCount, $severityBreakdown, $completedAt));

        return $this;
    }

    public function fail(string $reason, ?string $code): self
    {
        if ($this->status === Status::Cancelled) {
            return $this; // stream message raced a user cancellation; ignore
        }

        $this->recordThat(new AuditWasFailed($reason, $code));

        return $this;
    }

    public function complete(string $completedAt): self
    {
        if ($this->status === Status::Cancelled) {
            return $this; // stream message raced a user cancellation; ignore
        }

        $this->recordThat(new AuditWasCompleted($completedAt));

        return $this;
    }

    public function cancel(string $cancelledAt): self
    {
        $this->recordThat(new AuditWasCancelled($cancelledAt));

        return $this;
    }

    protected function applyAuditWasCreated(AuditWasCreated $event): void
    {
        $this->status = Status::Queued;
    }

    protected function applyAuditWasStarted(AuditWasStarted $event): void
    {
        $this->status = Status::Started;
    }

    protected function applyAuditWasFailed(AuditWasFailed $event): void
    {
        $this->status = Status::Failed;
    }

    protected function applyAuditWasCompleted(AuditWasCompleted $event): void
    {
        $this->status = Status::Completed;
    }

    protected function applyAuditWasCancelled(AuditWasCancelled $event): void
    {
        $this->status = Status::Cancelled;
    }
}
