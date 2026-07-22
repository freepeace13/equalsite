<?php

namespace App\Listeners;

use App\Actions\Audit\UnzipCrawlerArtifacts;
use App\Contracts\Spider;
use App\Events\Audit\AuditCompleted;
use App\Events\Audit\AuditFailed;
use App\Events\Audit\AuditStarted;
use App\Jobs\ProcessAuditArtifacts;
use App\Models\Audit;
use App\Value\Status;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Events\Dispatcher;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Throwable;

class AuditStatusSubscriber implements ShouldQueue
{
    public function __construct(
        protected Spider $spider,
        protected UnzipCrawlerArtifacts $unzip,
    ) {}

    public function handleAuditStarted(AuditStarted $event): void
    {
        $this->updateAudit($event->crawlerId(), [
            'status' => Status::Started,
            'started_at' => $this->carbonTimestamp($event->timestamp()),
        ]);
    }

    public function handleAuditFailed(AuditFailed $event): void
    {
        $crawlerId = $event->crawlerId();

        if ($this->isCancelled($crawlerId)) {
            return;
        }

        $this->updateAudit($crawlerId, [
            'status' => Status::Failed,
            'failure_reason' => $event->payload()['error'] ?? '',
        ]);
    }

    public function handleAuditCompleted(AuditCompleted $event): void
    {
        $crawlerId = $event->crawlerId();

        if ($this->isCancelled($crawlerId)) {
            return;
        }

        try {
            $this->processArtifacts($crawlerId);
        } catch (Throwable $e) {
            report($e);
        }

        $this->updateAudit($crawlerId, [
            'status' => Status::Completed,
            'completed_at' => $this->carbonTimestamp($event->timestamp()),
        ]);
    }

    protected function processArtifacts(string $crawlerId): void
    {
        $zipPath = tempnam(sys_get_temp_dir(), 'audit-artifact-');

        try {
            File::put($zipPath, $this->spider->download($crawlerId));
            $this->unzip->unzip($crawlerId, $zipPath);
        } finally {
            File::delete($zipPath);
        }

        ProcessAuditArtifacts::dispatch($crawlerId);
    }

    protected function carbonTimestamp(int $timestamp)
    {
        return Carbon::createFromTimestampMs($timestamp);
    }

    protected function isCancelled(string $crawlerId): bool
    {
        return Audit::where('crawler_id', $crawlerId)->first()?->status === Status::Cancelled;
    }

    protected function updateAudit(string $crawlerId, array $attributes): void
    {
        DB::transaction(function () use ($crawlerId, $attributes) {
            $audit = Audit::where('crawler_id', $crawlerId)
                ->lockForUpdate()
                ->first();

            if ($audit) {
                $audit->update($attributes);
            }
        });
    }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            AuditStarted::class,
            [AuditStatusSubscriber::class, 'handleAuditStarted']
        );

        $events->listen(
            AuditFailed::class,
            [AuditStatusSubscriber::class, 'handleAuditFailed']
        );

        $events->listen(
            AuditCompleted::class,
            [AuditStatusSubscriber::class, 'handleAuditCompleted']
        );
    }
}
