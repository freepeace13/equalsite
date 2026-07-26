<?php

use App\Models\AuditPage;
use App\Models\User;
use App\Value\Status;
use App\Value\TeaserReport;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('fromAudit counts audit_pages rows as scannedUrlsCount', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-teaser', 'acme.com', Status::Completed);

    AuditPage::create(['audit_id' => $audit->id, 'url' => 'https://acme.com/', 'status' => 'completed', 'last_activity_at' => now()]);
    AuditPage::create(['audit_id' => $audit->id, 'url' => 'https://acme.com/about', 'status' => 'completed', 'last_activity_at' => now()]);
    AuditPage::create(['audit_id' => $audit->id, 'url' => 'https://acme.com/contact', 'status' => 'failed', 'last_activity_at' => now()]);

    $teaser = TeaserReport::fromAudit($audit->fresh());

    expect($teaser->scannedUrlsCount)->toBe(3);
});
