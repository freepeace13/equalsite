<?php

use App\AggregateRoots\AuditAggregateRoot;
use App\Models\Audit;
use App\Models\User;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('AuditWasCreated projects a queued audit row', function () {
    $user = User::factory()->create();

    AuditAggregateRoot::retrieve('crawler-1')
        ->create($user->id, 'https://acme.com', 'acme.com')
        ->persist();

    $audit = Audit::findById('crawler-1');

    expect($audit)->not->toBeNull()
        ->and($audit->user_id)->toBe($user->id)
        ->and($audit->url)->toBe('https://acme.com')
        ->and($audit->domain)->toBe('acme.com')
        ->and($audit->status)->toBe(Status::Queued);
});

test('AuditQueueStateWasUpdated projects into custom_data.queue_state', function () {
    $user = User::factory()->create();

    AuditAggregateRoot::retrieve('crawler-2')
        ->create($user->id, 'https://acme.com', 'acme.com')
        ->updateQueueState(2, 1, 3)
        ->persist();

    $audit = Audit::findById('crawler-2');

    expect($audit->getCustomData('queue_state'))->toBe([
        'position' => 2,
        'ahead' => 1,
        'waiting' => 3,
    ]);
});

test('AuditWasStarted projects status and started_at', function () {
    $user = User::factory()->create();

    AuditAggregateRoot::retrieve('crawler-3')
        ->create($user->id, 'https://acme.com', 'acme.com')
        ->start('2026-07-26T00:00:00+00:00')
        ->persist();

    $audit = Audit::findById('crawler-3');

    expect($audit->status)->toBe(Status::Started)
        ->and($audit->started_at->toIso8601String())->toBe('2026-07-26T00:00:00+00:00');
});

test('AuditProgressWasUpdated projects into custom_data.progress_state', function () {
    $user = User::factory()->create();

    AuditAggregateRoot::retrieve('crawler-4')
        ->create($user->id, 'https://acme.com', 'acme.com')
        ->updateProgress(1, 2, 3, 33.3)
        ->persist();

    $audit = Audit::findById('crawler-4');

    expect($audit->getCustomData('progress_state'))->toBe([
        'completedRequests' => 1,
        'pendingRequests' => 2,
        'totalRequests' => 3,
        'progressPercentage' => 33.3,
    ]);
});

test('page events merge into custom_data.scanned_urls keyed by url', function () {
    $user = User::factory()->create();

    AuditAggregateRoot::retrieve('crawler-5')
        ->create($user->id, 'https://acme.com', 'acme.com')
        ->pageStarted('https://acme.com/about', 1, '2026-07-26T00:00:00+00:00')
        ->pageCompleted('https://acme.com/about', 2, ['critical' => 1, 'serious' => 0, 'moderate' => 0, 'minor' => 1], '2026-07-26T00:01:00+00:00')
        ->persist();

    $scannedUrls = Audit::findById('crawler-5')->getCustomData('scanned_urls');

    expect($scannedUrls['https://acme.com/about'])->toBe([
        'status' => 'completed',
        'attemptsCount' => 1,
        'startedAt' => '2026-07-26T00:00:00+00:00',
        'violationsCount' => 2,
        'severityBreakdown' => ['critical' => 1, 'serious' => 0, 'moderate' => 0, 'minor' => 1],
        'completedAt' => '2026-07-26T00:01:00+00:00',
    ]);
});

test('page skipped and page failed project the same scanned_urls shape as today', function () {
    $user = User::factory()->create();

    AuditAggregateRoot::retrieve('crawler-6')
        ->create($user->id, 'https://acme.com', 'acme.com')
        ->pageSkipped('https://acme.com/robots', 'Blocked by robots.txt', '2026-07-26T00:00:00+00:00')
        ->pageFailed('https://acme.com/about', 3, 'Navigation timeout', 'timeout', '2026-07-26T00:01:00+00:00')
        ->persist();

    $scannedUrls = Audit::findById('crawler-6')->getCustomData('scanned_urls');

    expect($scannedUrls['https://acme.com/robots'])->toBe([
        'status' => 'skipped',
        'skippingReason' => 'Blocked by robots.txt',
        'skippedAt' => '2026-07-26T00:00:00+00:00',
    ]);
    expect($scannedUrls['https://acme.com/about'])->toBe([
        'status' => 'failed',
        'attemptsCount' => 3,
        'errorMessage' => 'Navigation timeout',
        'errorCode' => 'timeout',
        'failedAt' => '2026-07-26T00:01:00+00:00',
    ]);
});

test('AuditWasFailed projects status, failure_reason, and failure_code', function () {
    $user = User::factory()->create();

    AuditAggregateRoot::retrieve('crawler-7')
        ->create($user->id, 'https://acme.com', 'acme.com')
        ->fail('boom', 'dns_error')
        ->persist();

    $audit = Audit::findById('crawler-7');

    expect($audit->status)->toBe(Status::Failed)
        ->and($audit->failure_reason)->toBe('boom')
        ->and($audit->failure_code)->toBe('dns_error');
});

test('AuditWasCompleted projects status and completed_at', function () {
    $user = User::factory()->create();

    AuditAggregateRoot::retrieve('crawler-8')
        ->create($user->id, 'https://acme.com', 'acme.com')
        ->complete('2026-07-26T00:05:00+00:00')
        ->persist();

    $audit = Audit::findById('crawler-8');

    expect($audit->status)->toBe(Status::Completed)
        ->and($audit->completed_at->toIso8601String())->toBe('2026-07-26T00:05:00+00:00');
});

test('AuditWasCancelled projects status and cancelled_at', function () {
    $user = User::factory()->create();

    AuditAggregateRoot::retrieve('crawler-9')
        ->create($user->id, 'https://acme.com', 'acme.com')
        ->cancel('2026-07-26T00:02:00+00:00')
        ->persist();

    $audit = Audit::findById('crawler-9');

    expect($audit->status)->toBe(Status::Cancelled)
        ->and($audit->cancelled_at->toIso8601String())->toBe('2026-07-26T00:02:00+00:00');
});
