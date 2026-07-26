<?php

use App\Events\Audit\AuditPageCompleted;
use App\Events\Audit\AuditPageFailed;
use App\Events\Audit\AuditPageSkipped;
use App\Events\Audit\AuditPageStarted;
use App\Listeners\AuditPageSubscriber;
use App\Models\User;
use App\Value\RedisStreamData;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('handlePageFailed stores the classified error code alongside the raw message', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-page-failed', 'acme.com', Status::Started);

    $event = new AuditPageFailed(new RedisStreamData(
        id: '1-0',
        streamName: 'equalsite:crawler:events',
        type: 'audit.page.failed',
        payload: [
            'auditId' => 'crawler-page-failed',
            'pageUrl' => 'https://acme.com/about',
            'attemptsCount' => 3,
            'errorMessage' => 'Navigation timeout of 45000 ms exceeded',
            'errorCode' => 'timeout',
        ],
        version: '1',
        timestamp: now()->getTimestampMs(),
    ));

    (new AuditPageSubscriber)->handlePageFailed($event);

    $page = $audit->fresh()->pages->firstWhere('url', 'https://acme.com/about');

    expect($page->error_code)->toBe('timeout')
        ->and($page->status)->toBe('failed');
});

test('handlePageStarted stores timestamp in ISO 8601 format', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-page-started', 'acme.com', Status::Started);

    $event = new AuditPageStarted(new RedisStreamData(
        id: '1-0',
        streamName: 'equalsite:crawler:events',
        type: 'audit.page.started',
        payload: [
            'auditId' => 'crawler-page-started',
            'pageUrl' => 'https://acme.com/homepage',
            'attemptsCount' => 1,
        ],
        version: '1',
        timestamp: now()->getTimestampMs(),
    ));

    (new AuditPageSubscriber)->handlePageStarted($event);

    $page = $audit->fresh()->pages->firstWhere('url', 'https://acme.com/homepage');

    expect($page->started_at->toIso8601String())->toMatch('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/');
});

test('handlePageSkipped stores timestamp in ISO 8601 format', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-page-skipped', 'acme.com', Status::Started);

    $event = new AuditPageSkipped(new RedisStreamData(
        id: '1-0',
        streamName: 'equalsite:crawler:events',
        type: 'audit.page.skipped',
        payload: [
            'auditId' => 'crawler-page-skipped',
            'pageUrl' => 'https://acme.com/robots',
            'reason' => 'Blocked by robots.txt',
        ],
        version: '1',
        timestamp: now()->getTimestampMs(),
    ));

    (new AuditPageSubscriber)->handlePageSkipped($event);

    $page = $audit->fresh()->pages->firstWhere('url', 'https://acme.com/robots');

    expect($page->skipped_at->toIso8601String())->toMatch('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/');
});

test('handlePageFailed stores timestamp in ISO 8601 format', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-page-failed-timestamp', 'acme.com', Status::Started);

    $event = new AuditPageFailed(new RedisStreamData(
        id: '1-0',
        streamName: 'equalsite:crawler:events',
        type: 'audit.page.failed',
        payload: [
            'auditId' => 'crawler-page-failed-timestamp',
            'pageUrl' => 'https://acme.com/error',
            'attemptsCount' => 3,
            'errorMessage' => 'Navigation timeout of 45000 ms exceeded',
            'errorCode' => 'timeout',
        ],
        version: '1',
        timestamp: now()->getTimestampMs(),
    ));

    (new AuditPageSubscriber)->handlePageFailed($event);

    $page = $audit->fresh()->pages->firstWhere('url', 'https://acme.com/error');

    expect($page->failed_at->toIso8601String())->toMatch('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/');
});

test('handlePageCompleted stores timestamp in ISO 8601 format', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-page-completed', 'acme.com', Status::Started);

    $event = new AuditPageCompleted(new RedisStreamData(
        id: '1-0',
        streamName: 'equalsite:crawler:events',
        type: 'audit.page.completed',
        payload: [
            'auditId' => 'crawler-page-completed',
            'pageUrl' => 'https://acme.com/services',
            'violationsCount' => 5,
            'severityBreakdown' => [
                'critical' => 1,
                'serious' => 2,
                'moderate' => 1,
                'minor' => 1,
            ],
        ],
        version: '1',
        timestamp: now()->getTimestampMs(),
    ));

    (new AuditPageSubscriber)->handlePageCompleted($event);

    $page = $audit->fresh()->pages->firstWhere('url', 'https://acme.com/services');

    expect($page->completed_at->toIso8601String())->toMatch('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/');
});
