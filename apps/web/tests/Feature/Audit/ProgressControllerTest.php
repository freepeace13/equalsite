<?php

use App\Models\AuditPage;
use App\Models\User;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('scanUrls prop is a list of page objects, excluding in-progress pages, newest activity first', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-progress', 'acme.com', Status::Started);

    AuditPage::create([
        'audit_id' => $audit->id,
        'url' => 'https://acme.com/',
        'status' => 'completed',
        'violations_count' => 2,
        'last_activity_at' => '2026-07-26T00:01:00+00:00',
    ]);
    AuditPage::create([
        'audit_id' => $audit->id,
        'url' => 'https://acme.com/about',
        'status' => 'failed',
        'error_code' => 'timeout',
        'last_activity_at' => '2026-07-26T00:02:00+00:00',
    ]);
    AuditPage::create([
        'audit_id' => $audit->id,
        'url' => 'https://acme.com/contact',
        'status' => 'started',
        'last_activity_at' => '2026-07-26T00:03:00+00:00',
    ]);

    $this->actingAs($user)
        ->get(route('audit.progress', $audit->crawler_id))
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit/progress')
            ->has('scanUrls', 2)
            ->where('scanUrls.0.url', 'https://acme.com/about')
            ->where('scanUrls.1.url', 'https://acme.com/'),
        );
});
