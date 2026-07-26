<?php

use App\Models\AuditPage;
use App\Models\User;
use App\Value\Status;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('AuditPage belongs to an Audit and Audit has many AuditPage rows', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-page-model', 'acme.com', Status::Started);

    $page = AuditPage::create([
        'audit_id' => $audit->id,
        'url' => 'https://acme.com/about',
        'status' => 'completed',
        'attempts_count' => 1,
        'started_at' => '2026-07-26T00:00:00+00:00',
        'completed_at' => '2026-07-26T00:01:00+00:00',
        'last_activity_at' => '2026-07-26T00:01:00+00:00',
        'violations_count' => 2,
        'critical_count' => 1,
        'serious_count' => 0,
        'moderate_count' => 0,
        'minor_count' => 1,
    ]);

    expect($page->audit->id)->toBe($audit->id)
        ->and($audit->pages)->toHaveCount(1)
        ->and($audit->pages->first()->url)->toBe('https://acme.com/about');
});

test('AuditPage::toProp maps snake_case columns to the camelCase prop shape', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-page-prop', 'acme.com', Status::Started);

    $page = AuditPage::create([
        'audit_id' => $audit->id,
        'url' => 'https://acme.com/about',
        'status' => 'failed',
        'attempts_count' => 3,
        'started_at' => '2026-07-26T00:00:00+00:00',
        'failed_at' => '2026-07-26T00:02:00+00:00',
        'last_activity_at' => '2026-07-26T00:02:00+00:00',
        'error_code' => 'timeout',
        'error_message' => 'Navigation timeout of 45000 ms exceeded',
    ]);

    expect($page->toProp())->toBe([
        'url' => 'https://acme.com/about',
        'status' => 'failed',
        'attemptsCount' => 3,
        'startedAt' => '2026-07-26T00:00:00+00:00',
        'completedAt' => null,
        'failedAt' => '2026-07-26T00:02:00+00:00',
        'skippedAt' => null,
        'lastActivityAt' => '2026-07-26T00:02:00+00:00',
        'violationsCount' => null,
        'criticalCount' => null,
        'seriousCount' => null,
        'moderateCount' => null,
        'minorCount' => null,
        'errorCode' => 'timeout',
        'errorMessage' => 'Navigation timeout of 45000 ms exceeded',
        'skippingReason' => null,
    ]);
});

test('audit_pages enforces one row per audit_id + url', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-page-unique', 'acme.com', Status::Started);

    AuditPage::create([
        'audit_id' => $audit->id,
        'url' => 'https://acme.com/about',
        'status' => 'started',
        'last_activity_at' => '2026-07-26T00:00:00+00:00',
    ]);

    expect(fn () => AuditPage::create([
        'audit_id' => $audit->id,
        'url' => 'https://acme.com/about',
        'status' => 'started',
        'last_activity_at' => '2026-07-26T00:00:00+00:00',
    ]))->toThrow(QueryException::class);
});
