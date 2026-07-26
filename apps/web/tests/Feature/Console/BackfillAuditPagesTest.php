<?php

use App\Models\User;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('backfills audit_pages rows from legacy custom_data.scanned_urls', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-backfill', 'acme.com', Status::Completed, [
        'scanned_urls' => [
            'https://acme.com/' => [
                'status' => 'completed',
                'attemptsCount' => 1,
                'startedAt' => '2026-07-20T00:00:00+00:00',
                'violationsCount' => 3,
                'severityBreakdown' => ['critical' => 1, 'serious' => 1, 'moderate' => 1, 'minor' => 0],
                'completedAt' => '2026-07-20T00:01:00+00:00',
            ],
            'https://acme.com/about' => [
                'status' => 'failed',
                'attemptsCount' => 3,
                'startedAt' => '2026-07-20T00:00:00+00:00',
                'errorMessage' => 'Navigation timeout',
                'errorCode' => 'timeout',
                'failedAt' => '2026-07-20T00:02:00+00:00',
            ],
        ],
    ]);

    $this->artisan('audit-pages:backfill')->assertExitCode(0);

    $pages = $audit->fresh()->pages;

    expect($pages)->toHaveCount(2);

    $home = $pages->firstWhere('url', 'https://acme.com/');
    expect($home->status)->toBe('completed')
        ->and($home->attempts_count)->toBe(1)
        ->and($home->violations_count)->toBe(3)
        ->and($home->critical_count)->toBe(1)
        ->and($home->serious_count)->toBe(1)
        ->and($home->moderate_count)->toBe(1)
        ->and($home->minor_count)->toBe(0)
        ->and($home->last_activity_at->toIso8601String())->toBe('2026-07-20T00:01:00+00:00');

    $about = $pages->firstWhere('url', 'https://acme.com/about');
    expect($about->status)->toBe('failed')
        ->and($about->error_code)->toBe('timeout')
        ->and($about->error_message)->toBe('Navigation timeout')
        ->and($about->last_activity_at->toIso8601String())->toBe('2026-07-20T00:02:00+00:00');
});

test('is idempotent when run twice', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-backfill-twice', 'acme.com', Status::Completed, [
        'scanned_urls' => [
            'https://acme.com/' => ['status' => 'completed', 'startedAt' => '2026-07-20T00:00:00+00:00', 'completedAt' => '2026-07-20T00:01:00+00:00'],
        ],
    ]);

    $this->artisan('audit-pages:backfill')->assertExitCode(0);
    $this->artisan('audit-pages:backfill')->assertExitCode(0);

    expect($audit->fresh()->pages)->toHaveCount(1);
});

test('skips audits with no scanned_urls data', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-backfill-empty', 'acme.com', Status::Queued);

    $this->artisan('audit-pages:backfill')->assertExitCode(0);

    expect($audit->fresh()->pages)->toHaveCount(0);
});
