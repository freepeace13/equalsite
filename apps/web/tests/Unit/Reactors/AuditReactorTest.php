<?php

use App\Actions\Audit\UnzipCrawlerArtifacts;
use App\Contracts\Spider;
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

test('onAuditWasCompleted downloads, extracts, and queues processing of the artifacts', function () {
    Bus::fake();

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('download')->once()->with('crawler-1')->andReturn('zip-bytes');

    $unzip = Mockery::mock(UnzipCrawlerArtifacts::class);
    $unzip->shouldReceive('unzip')->once()->with('crawler-1', Mockery::type('string'));

    (new AuditReactor($spider, $unzip))->onAuditWasCompleted(completedStorableEvent('crawler-1'));

    Bus::assertDispatched(ProcessAuditArtifacts::class, fn ($job) => $job->crawlerId === 'crawler-1');
});

test('onAuditWasCompleted swallows and reports a download failure without dispatching the job', function () {
    Bus::fake();

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('download')->once()->andThrow(new Exception('boom'));

    $unzip = Mockery::mock(UnzipCrawlerArtifacts::class);
    $unzip->shouldNotReceive('unzip');

    (new AuditReactor($spider, $unzip))->onAuditWasCompleted(completedStorableEvent('crawler-2'));

    Bus::assertNotDispatched(ProcessAuditArtifacts::class);
});
