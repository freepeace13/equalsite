<?php

use App\Actions\Audit\UnzipCrawlerArtifacts;
use App\Contracts\Spider;
use App\Events\Audit\AuditCompleted;
use App\Events\Audit\AuditFailed;
use App\Events\Audit\AuditStatusCorrectedToFailed;
use App\Jobs\ProcessAuditArtifacts;
use App\Listeners\AuditStatusSubscriber;
use App\Models\User;
use App\Value\RedisStreamData;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function completedEvent(string $crawlerId): AuditCompleted
{
    return new AuditCompleted(new RedisStreamData(
        id: '1-0',
        streamName: 'equalsite:crawler:events',
        type: 'audit.completed',
        payload: ['auditId' => $crawlerId],
        version: '1',
        timestamp: now()->getTimestampMs(),
    ));
}

function failedEvent(string $crawlerId, string $error = 'boom'): AuditFailed
{
    return new AuditFailed(new RedisStreamData(
        id: '1-0',
        streamName: 'equalsite:crawler:events',
        type: 'audit.failed',
        payload: ['auditId' => $crawlerId, 'error' => $error],
        version: '1',
        timestamp: now()->getTimestampMs(),
    ));
}

test('handleAuditCompleted downloads, extracts, and queues processing of the artifacts', function () {
    Bus::fake();

    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-123', 'acme.com', Status::Started);

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('download')->once()->with('crawler-123')->andReturn('zip-bytes');

    $unzip = Mockery::mock(UnzipCrawlerArtifacts::class);
    $unzip->shouldReceive('unzip')->once()->with('crawler-123', Mockery::type('string'));

    (new AuditStatusSubscriber($spider, $unzip))->handleAuditCompleted(completedEvent('crawler-123'));

    Bus::assertDispatched(ProcessAuditArtifacts::class, fn ($job) => $job->crawlerId === 'crawler-123');

    expect($audit->fresh()->status)->toBe(Status::Completed);
});

test('handleAuditCompleted still marks the audit completed when artifact download fails', function () {
    Bus::fake();

    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-456', 'acme.com', Status::Started);

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('download')->once()->andThrow(new Exception('boom'));

    $unzip = Mockery::mock(UnzipCrawlerArtifacts::class);
    $unzip->shouldNotReceive('unzip');

    (new AuditStatusSubscriber($spider, $unzip))->handleAuditCompleted(completedEvent('crawler-456'));

    Bus::assertNotDispatched(ProcessAuditArtifacts::class);
    expect($audit->fresh()->status)->toBe(Status::Completed);
});

test('handleAuditFailed does not overwrite an already-cancelled audit', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-cancelled', 'acme.com', Status::Cancelled);

    $spider = Mockery::mock(Spider::class);
    $unzip = Mockery::mock(UnzipCrawlerArtifacts::class);

    (new AuditStatusSubscriber($spider, $unzip))->handleAuditFailed(
        failedEvent('crawler-cancelled', 'ENOENT: no such file or directory')
    );

    expect($audit->fresh()->status)->toBe(Status::Cancelled);
    expect($audit->fresh()->failure_reason)->toBeNull();
});

test('handleAuditCompleted does not overwrite an already-cancelled audit', function () {
    Bus::fake();

    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-cancelled-2', 'acme.com', Status::Cancelled);

    $spider = Mockery::mock(Spider::class);
    $unzip = Mockery::mock(UnzipCrawlerArtifacts::class);

    (new AuditStatusSubscriber($spider, $unzip))->handleAuditCompleted(completedEvent('crawler-cancelled-2'));

    Bus::assertNotDispatched(ProcessAuditArtifacts::class);
    expect($audit->fresh()->status)->toBe(Status::Cancelled);
});

test('handleAuditCompleted marks the audit failed when every scanned URL failed', function () {
    Bus::fake();

    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-all-failed', 'acme.com', Status::Started, [
        'scanned_urls' => [
            'https://acme.com/' => ['status' => 'failed'],
            'https://acme.com/about' => ['status' => 'failed'],
        ],
    ]);

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('download')->once()->andReturn('zip-bytes');

    $unzip = Mockery::mock(UnzipCrawlerArtifacts::class);
    $unzip->shouldReceive('unzip')->once();

    (new AuditStatusSubscriber($spider, $unzip))->handleAuditCompleted(completedEvent('crawler-all-failed'));

    expect($audit->fresh()->status)->toBe(Status::Failed);
    expect($audit->fresh()->failure_reason)->toBe('All 2 pages failed to scan.');
});

test('handleAuditCompleted stays completed when at least one scanned URL succeeded', function () {
    Bus::fake();

    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-mixed', 'acme.com', Status::Started, [
        'scanned_urls' => [
            'https://acme.com/' => ['status' => 'completed'],
            'https://acme.com/about' => ['status' => 'failed'],
        ],
    ]);

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('download')->once()->andReturn('zip-bytes');

    $unzip = Mockery::mock(UnzipCrawlerArtifacts::class);
    $unzip->shouldReceive('unzip')->once();

    (new AuditStatusSubscriber($spider, $unzip))->handleAuditCompleted(completedEvent('crawler-mixed'));

    expect($audit->fresh()->status)->toBe(Status::Completed);
});

test('handleAuditCompleted broadcasts a live status correction when every scanned URL failed', function () {
    Event::fake([AuditStatusCorrectedToFailed::class]);
    Bus::fake();

    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-broadcast-correction', 'acme.com', Status::Started, [
        'scanned_urls' => [
            'https://acme.com/' => ['status' => 'failed'],
        ],
    ]);

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('download')->once()->andReturn('zip-bytes');

    $unzip = Mockery::mock(UnzipCrawlerArtifacts::class);
    $unzip->shouldReceive('unzip')->once();

    (new AuditStatusSubscriber($spider, $unzip))->handleAuditCompleted(completedEvent('crawler-broadcast-correction'));

    Event::assertDispatched(AuditStatusCorrectedToFailed::class, function ($event) {
        return $event->payload()['auditId'] === 'crawler-broadcast-correction'
            && $event->payload()['error'] === 'All 1 pages failed to scan.';
    });
});

test('handleAuditCompleted does not broadcast a status correction when at least one URL succeeded', function () {
    Event::fake([AuditStatusCorrectedToFailed::class]);
    Bus::fake();

    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-no-correction', 'acme.com', Status::Started, [
        'scanned_urls' => [
            'https://acme.com/' => ['status' => 'completed'],
            'https://acme.com/about' => ['status' => 'failed'],
        ],
    ]);

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('download')->once()->andReturn('zip-bytes');

    $unzip = Mockery::mock(UnzipCrawlerArtifacts::class);
    $unzip->shouldReceive('unzip')->once();

    (new AuditStatusSubscriber($spider, $unzip))->handleAuditCompleted(completedEvent('crawler-no-correction'));

    Event::assertNotDispatched(AuditStatusCorrectedToFailed::class);
});

test('handleAuditFailed stores the classified error code alongside the raw reason', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-with-code', 'acme.com', Status::Started);

    $spider = Mockery::mock(Spider::class);
    $unzip = Mockery::mock(UnzipCrawlerArtifacts::class);

    $event = new AuditFailed(new RedisStreamData(
        id: '1-0',
        streamName: 'equalsite:crawler:events',
        type: 'audit.failed',
        payload: [
            'auditId' => 'crawler-with-code',
            'error' => 'net::ERR_NAME_NOT_RESOLVED',
            'errorCode' => 'dns_error',
        ],
        version: '1',
        timestamp: now()->getTimestampMs(),
    ));

    (new AuditStatusSubscriber($spider, $unzip))->handleAuditFailed($event);

    expect($audit->fresh()->failure_code)->toBe('dns_error');
});
