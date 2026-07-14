<?php

use App\Models\User;
use App\Value\Impact;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected to login', function () {
    $this->get(route('sites.index'))->assertRedirect(route('login'));
});

test('the sites list is empty for a user with no audits', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('sites.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('sites/index')
            ->where('sites', []),
        );
});

test('sites are grouped by domain with the latest audit summarized', function () {
    $user = User::factory()->create();

    $older = makeUserAudit($user, 'acme-1', 'acme.com', Status::Completed);
    $older->forceFill(['created_at' => now()->subDay()])->save();
    makeAuditViolation($older, Impact::Critical);

    $latest = makeUserAudit($user, 'acme-2', 'acme.com', Status::Completed);
    makeAuditViolation($latest, Impact::Minor);

    $this->actingAs($user)
        ->get(route('sites.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('sites/index')
            ->has('sites', 1)
            ->where('sites.0.domain', 'acme.com')
            ->where('sites.0.auditCount', 2)
            ->where('sites.0.auditId', 'acme-2')
            ->where('sites.0.status', 'completed')
            ->where('sites.0.score', 99),
        );
});

test('an in-progress audit surfaces live scan state instead of a score', function () {
    $user = User::factory()->create();

    makeUserAudit($user, 'in-progress', 'wip.com', Status::Started, [
        'progress_state' => [
            'completedRequests' => 3,
            'pendingRequests' => 2,
            'totalRequests' => 5,
            'progressPercentage' => 60,
        ],
    ]);

    $this->actingAs($user)
        ->get(route('sites.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('sites/index')
            ->where('sites.0.status', 'started')
            ->where('sites.0.score', null)
            ->where('sites.0.scanProgress.totalRequests', 5),
        );
});

test('a user cannot see another user\'s sites', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();

    makeUserAudit($owner, 'owner-audit', 'private.com', Status::Completed);

    $this->actingAs($other)
        ->get(route('sites.index'))
        ->assertInertia(fn (Assert $page) => $page->where('sites', []));
});
