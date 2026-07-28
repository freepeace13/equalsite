<?php

use App\Jobs\ProcessAuditArtifacts;
use App\Reactors\AuditReactor;
use App\StorableEvents\Audit\AuditWasCompleted;
use Illuminate\Support\Facades\Bus;
use Tests\TestCase;

uses(TestCase::class);

function completedStorableEvent(string $crawlerId): AuditWasCompleted
{
    return (new AuditWasCompleted('2026-07-26T00:00:00+00:00'))
        ->setAggregateRootUuid($crawlerId);
}

test('onAuditWasCompleted dispatches ProcessAuditArtifacts for the crawler id', function () {
    Bus::fake();

    (new AuditReactor)->onAuditWasCompleted(completedStorableEvent('crawler-1'));

    Bus::assertDispatched(ProcessAuditArtifacts::class, fn ($job) => $job->crawlerId === 'crawler-1');
});
