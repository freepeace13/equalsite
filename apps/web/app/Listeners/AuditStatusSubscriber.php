<?php

namespace App\Listeners;

use App\Events\Audit\AuditCompleted;
use App\Events\Audit\AuditFailed;
use App\Events\Audit\AuditStarted;
use App\Models\Audit;
use App\Value\Status;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Events\Dispatcher;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AuditStatusSubscriber implements ShouldQueue
{
    public function handleAuditStarted(AuditStarted $event): void
    {
        $this->updateAudit($event->crawlerId(), [
            'status' => Status::Started,
            'started_at' => $this->carbonTimestamp($event->timestamp()),
        ]);
    }

    public function handleAuditFailed(AuditFailed $event): void
    {
        $this->updateAudit($event->crawlerId(), [
            'status' => Status::Failed,
            'failure_reason' => $event->payload()['error'] ?? '',
        ]);
    }

    public function handleAuditCompleted(AuditCompleted $event): void
    {
        // Download artifacts using Spider::download
        // Once you have the zipped file extract UnzipCrawlerArtifacts::unzip it
        // Finally, dispatch the ProcessAuditArtifacts job
        $this->updateAudit($event->crawlerId(), [
            'status' => Status::Completed,
            'completed_at' => $this->carbonTimestamp($event->timestamp()),
        ]);
    }

    protected function carbonTimestamp(int $timestamp)
    {
        return Carbon::createFromTimestampMs($timestamp);
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
