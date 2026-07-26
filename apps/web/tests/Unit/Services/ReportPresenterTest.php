<?php

use App\Models\AuditPage;
use App\Models\User;
use App\Services\ReportPresenter;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('scannedUrls returns the list of audit_pages urls', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-presenter', 'acme.com', Status::Completed);

    AuditPage::create([
        'audit_id' => $audit->id,
        'url' => 'https://acme.com/',
        'status' => 'completed',
        'last_activity_at' => now(),
    ]);
    AuditPage::create([
        'audit_id' => $audit->id,
        'url' => 'https://acme.com/about',
        'status' => 'failed',
        'last_activity_at' => now(),
    ]);

    $presenter = new ReportPresenter($audit->fresh());

    expect($presenter->scannedUrls())->toEqualCanonicalizing([
        'https://acme.com/',
        'https://acme.com/about',
    ]);
});

test('scannedUrls only queries audit_pages once across repeated calls', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-presenter-cache', 'acme.com', Status::Completed);

    AuditPage::create([
        'audit_id' => $audit->id,
        'url' => 'https://acme.com/',
        'status' => 'completed',
        'last_activity_at' => now(),
    ]);

    $presenter = new ReportPresenter($audit->fresh());

    $queryCount = 0;
    DB::listen(function () use (&$queryCount) {
        $queryCount++;
    });

    $presenter->scannedUrls();
    $presenter->scannedUrls();
    $presenter->scannedUrls();

    expect($queryCount)->toBe(1);
});
