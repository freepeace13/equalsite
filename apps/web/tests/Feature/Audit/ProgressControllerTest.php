<?php

use App\Models\AuditPage;
use App\Models\User;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('scanUrls prop is a list of page objects, including in-progress pages, most recently discovered first', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-progress', 'acme.com', Status::Started);

    Carbon::setTestNow('2026-07-26T00:01:00+00:00');
    AuditPage::create([
        'audit_id' => $audit->id,
        'url' => 'https://acme.com/',
        'status' => 'completed',
        'violations_count' => 2,
        'last_activity_at' => '2026-07-26T00:05:00+00:00',
    ]);
    Carbon::setTestNow('2026-07-26T00:02:00+00:00');
    AuditPage::create([
        'audit_id' => $audit->id,
        'url' => 'https://acme.com/about',
        'status' => 'failed',
        'error_code' => 'timeout',
        'last_activity_at' => '2026-07-26T00:02:00+00:00',
    ]);
    Carbon::setTestNow('2026-07-26T00:03:00+00:00');
    AuditPage::create([
        'audit_id' => $audit->id,
        'url' => 'https://acme.com/contact',
        'status' => 'started',
        'last_activity_at' => '2026-07-26T00:03:00+00:00',
    ]);
    Carbon::setTestNow();

    $this->actingAs($user)
        ->get(route('audit.progress', $audit->crawler_id))
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit/progress')
            ->has('scanUrls', 3)
            ->where('scanUrls.0.url', 'https://acme.com/contact')
            ->where('scanUrls.1.url', 'https://acme.com/about')
            ->where('scanUrls.2.url', 'https://acme.com/'),
        );
});
