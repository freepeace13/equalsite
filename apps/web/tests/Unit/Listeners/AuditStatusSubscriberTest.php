<?php

use App\AggregateRoots\AuditAggregateRoot;
use App\Events\Audit\AuditCompleted;
use App\Events\Audit\AuditFailed;
use App\Events\Audit\AuditStarted;
use App\Listeners\AuditStatusSubscriber;
use App\Models\Audit;
use App\Models\User;
use App\Value\RedisStreamData;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function startedEvent(string $crawlerId): AuditStarted
{
    return new AuditStarted(new RedisStreamData(
        id: '1-0',
        streamName: 'equalsite:crawler:events',
        type: 'audit.started',
        payload: ['auditId' => $crawlerId],
        version: '1',
        timestamp: now()->getTimestampMs(),
    ));
}

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

function failedEvent(string $crawlerId, string $error = 'boom', ?string $errorCode = null): AuditFailed
{
    return new AuditFailed(new RedisStreamData(
        id: '1-0',
        streamName: 'equalsite:crawler:events',
        type: 'audit.failed',
        payload: ['auditId' => $crawlerId, 'error' => $error, 'errorCode' => $errorCode],
        version: '1',
        timestamp: now()->getTimestampMs(),
    ));
}

test('handleAuditStarted marks the audit started', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-started', 'acme.com', Status::Queued);

    (new AuditStatusSubscriber)->handleAuditStarted(startedEvent('crawler-started'));

    expect($audit->fresh()->status)->toBe(Status::Started);
});

test('handleAuditCompleted marks the audit completed', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-completed', 'acme.com', Status::Started);

    (new AuditStatusSubscriber)->handleAuditCompleted(completedEvent('crawler-completed'));

    expect($audit->fresh()->status)->toBe(Status::Completed);
});

test('handleAuditCompleted marks completed even when every scanned URL failed (correction dropped)', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-all-failed', 'acme.com', Status::Started, [
        'scanned_urls' => [
            'https://acme.com/' => ['status' => 'failed'],
            'https://acme.com/about' => ['status' => 'failed'],
        ],
    ]);

    (new AuditStatusSubscriber)->handleAuditCompleted(completedEvent('crawler-all-failed'));

    expect($audit->fresh()->status)->toBe(Status::Completed);
});

test('handleAuditFailed marks the audit failed with reason and error code', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-with-code', 'acme.com', Status::Started);

    (new AuditStatusSubscriber)->handleAuditFailed(
        failedEvent('crawler-with-code', 'net::ERR_NAME_NOT_RESOLVED', 'dns_error')
    );

    $fresh = $audit->fresh();
    expect($fresh->status)->toBe(Status::Failed)
        ->and($fresh->failure_reason)->toBe('net::ERR_NAME_NOT_RESOLVED')
        ->and($fresh->failure_code)->toBe('dns_error');
});

test('handleAuditFailed does not overwrite an already-cancelled audit', function () {
    $user = User::factory()->create();

    AuditAggregateRoot::retrieve('crawler-cancelled')
        ->create($user->id, 'https://acme.com', 'acme.com')
        ->cancel(now()->toIso8601String())
        ->persist();

    (new AuditStatusSubscriber)->handleAuditFailed(
        failedEvent('crawler-cancelled', 'ENOENT: no such file or directory')
    );

    $audit = Audit::findById('crawler-cancelled');
    expect($audit->status)->toBe(Status::Cancelled);
    expect($audit->failure_reason)->toBeNull();
});

test('handleAuditCompleted does not overwrite an already-cancelled audit', function () {
    $user = User::factory()->create();

    AuditAggregateRoot::retrieve('crawler-cancelled-2')
        ->create($user->id, 'https://acme.com', 'acme.com')
        ->cancel(now()->toIso8601String())
        ->persist();

    (new AuditStatusSubscriber)->handleAuditCompleted(completedEvent('crawler-cancelled-2'));

    expect(Audit::findById('crawler-cancelled-2')->status)->toBe(Status::Cancelled);
});
