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

    expect($audit->getCustomData('queue_state'))->toEqual([
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

    expect($audit->getCustomData('progress_state'))->toEqual([
        'completedRequests' => 1,
        'pendingRequests' => 2,
        'totalRequests' => 3,
        'progressPercentage' => 33.3,
    ]);
});

test('page events upsert into a single audit_pages row per url', function () {
    $user = User::factory()->create();

    AuditAggregateRoot::retrieve('crawler-5')
        ->create($user->id, 'https://acme.com', 'acme.com')
        ->pageStarted('https://acme.com/about', 1, '2026-07-26T00:00:00+00:00')
        ->pageCompleted('https://acme.com/about', 2, ['critical' => 1, 'serious' => 0, 'moderate' => 0, 'minor' => 1], '2026-07-26T00:01:00+00:00')
        ->persist();

    $audit = Audit::findById('crawler-5');

    expect($audit->pages)->toHaveCount(1);

    $page = $audit->pages->first();

    expect($page->url)->toBe('https://acme.com/about')
        ->and($page->status)->toBe('completed')
        ->and($page->attempts_count)->toBe(1)
        ->and($page->started_at->toIso8601String())->toBe('2026-07-26T00:00:00+00:00')
        ->and($page->violations_count)->toBe(2)
        ->and($page->critical_count)->toBe(1)
        ->and($page->serious_count)->toBe(0)
        ->and($page->moderate_count)->toBe(0)
        ->and($page->minor_count)->toBe(1)
        ->and($page->completed_at->toIso8601String())->toBe('2026-07-26T00:01:00+00:00')
        ->and($page->last_activity_at->toIso8601String())->toBe('2026-07-26T00:01:00+00:00');
});

test('page skipped and page failed project into separate audit_pages rows', function () {
    $user = User::factory()->create();

    AuditAggregateRoot::retrieve('crawler-6')
        ->create($user->id, 'https://acme.com', 'acme.com')
        ->pageSkipped('https://acme.com/robots', 'Blocked by robots.txt', '2026-07-26T00:00:00+00:00')
        ->pageFailed('https://acme.com/about', 3, 'Navigation timeout', 'timeout', '2026-07-26T00:01:00+00:00')
        ->persist();

    $audit = Audit::findById('crawler-6');

    $skipped = $audit->pages->firstWhere('url', 'https://acme.com/robots');
    $failed = $audit->pages->firstWhere('url', 'https://acme.com/about');

    expect($skipped->status)->toBe('skipped')
        ->and($skipped->skipping_reason)->toBe('Blocked by robots.txt')
        ->and($skipped->skipped_at->toIso8601String())->toBe('2026-07-26T00:00:00+00:00')
        ->and($skipped->last_activity_at->toIso8601String())->toBe('2026-07-26T00:00:00+00:00');

    expect($failed->status)->toBe('failed')
        ->and($failed->attempts_count)->toBe(3)
        ->and($failed->error_message)->toBe('Navigation timeout')
        ->and($failed->error_code)->toBe('timeout')
        ->and($failed->failed_at->toIso8601String())->toBe('2026-07-26T00:01:00+00:00')
        ->and($failed->last_activity_at->toIso8601String())->toBe('2026-07-26T00:01:00+00:00');
});

test('a page transitioning from started to failed updates a single row, preserving attemptsCount history', function () {
    $user = User::factory()->create();

    AuditAggregateRoot::retrieve('crawler-10')
        ->create($user->id, 'https://acme.com', 'acme.com')
        ->pageStarted('https://acme.com/about', 1, '2026-07-26T00:00:00+00:00')
        ->pageFailed('https://acme.com/about', 2, 'Navigation timeout', 'timeout', '2026-07-26T00:01:00+00:00')
        ->persist();

    $audit = Audit::findById('crawler-10');

    expect($audit->pages)->toHaveCount(1);

    $page = $audit->pages->first();

    expect($page->status)->toBe('failed')
        ->and($page->attempts_count)->toBe(2)
        ->and($page->started_at->toIso8601String())->toBe('2026-07-26T00:00:00+00:00')
        ->and($page->failed_at->toIso8601String())->toBe('2026-07-26T00:01:00+00:00');
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
