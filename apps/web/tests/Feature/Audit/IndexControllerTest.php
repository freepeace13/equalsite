<?php

use App\Models\User;
use App\Value\Impact;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected to login', function () {
    $this->get(route('audit.index'))->assertRedirect(route('login'));
});

test('the audit history is empty for a user with no audits', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('audit.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit/index')
            ->where('history', []),
        );
});

test('audit history is a flat list across all of the user\'s sites, most recent first', function () {
    $user = User::factory()->create();

    $older = makeUserAudit($user, 'acme-1', 'acme.com', Status::Completed);
    $older->forceFill(['created_at' => now()->subDay()])->save();
    makeAuditViolation($older, Impact::Minor);

    $newer = makeUserAudit($user, 'wip-1', 'wip.com', Status::Completed);
    makeAuditViolation($newer, Impact::Critical);

    $this->actingAs($user)
        ->get(route('audit.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit/index')
            ->has('history', 2)
            ->where('history.0.auditId', 'wip-1')
            ->where('history.0.domain', 'wip.com')
            ->where('history.0.status', 'completed')
            ->where('history.1.auditId', 'acme-1')
            ->where('history.1.domain', 'acme.com'),
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
        ->get(route('audit.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit/index')
            ->where('history.0.status', 'started')
            ->where('history.0.score', null)
            ->where('history.0.scanProgress.totalRequests', 5),
        );
});

test('a user cannot see another user\'s audit history', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();

    makeUserAudit($owner, 'owner-audit', 'private.com', Status::Completed);

    $this->actingAs($other)
        ->get(route('audit.index'))
        ->assertInertia(fn (Assert $page) => $page->where('history', []));
});
