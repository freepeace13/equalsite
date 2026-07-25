<?php

namespace App\Reactors;

use App\Actions\Audit\UnzipCrawlerArtifacts;
use App\Contracts\Spider;
use App\Jobs\ProcessAuditArtifacts;
use App\StorableEvents\Audit\AuditWasCompleted;
use Illuminate\Support\Facades\File;
use Spatie\EventSourcing\EventHandlers\Reactors\Reactor;
use Throwable;

class AuditReactor extends Reactor
{
    public function __construct(
        protected Spider $spider,
        protected UnzipCrawlerArtifacts $unzip,
    ) {}

    public function onAuditWasCompleted(AuditWasCompleted $event): void
    {
        try {
            $this->processArtifacts($event->aggregateRootUuid());
        } catch (Throwable $e) {
            report($e);
        }
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
}
