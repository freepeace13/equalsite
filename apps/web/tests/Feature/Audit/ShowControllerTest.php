<?php

use App\Models\AuditPage;
use App\Models\User;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected to login', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-1', 'acme.com', Status::Completed);

    $this->get(route('audit.show', $audit->crawler_id))->assertRedirect(route('login'));
});

test('breadcrumb context defaults to the audits index when there is no from param', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-1', 'acme.com', Status::Completed);

    $this->actingAs($user)
        ->get(route('audit.show', $audit->crawler_id))
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit/show')
            ->where('from', null),
        );
});

test('breadcrumb context is set to site when navigated from the site history', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-1', 'acme.com', Status::Completed);

    $this->actingAs($user)
        ->get(route('audit.show', $audit->crawler_id).'?from=site')
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit/show')
            ->where('from', 'site'),
        );
});

test('unrecognized from values are ignored', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-1', 'acme.com', Status::Completed);

    $this->actingAs($user)
        ->get(route('audit.show', $audit->crawler_id).'?from=somewhere-else')
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit/show')
            ->where('from', null),
        );
});

test('scannedUrls prop is a list of page objects', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-show-pages', 'acme.com', Status::Completed);

    AuditPage::create([
        'audit_id' => $audit->id,
        'url' => 'https://acme.com/',
        'status' => 'completed',
        'last_activity_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('audit.show', $audit->crawler_id))
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit/show')
            ->has('report.scannedUrls', 1)
            ->where('report.scannedUrls.0.url', 'https://acme.com/'),
        );
});
