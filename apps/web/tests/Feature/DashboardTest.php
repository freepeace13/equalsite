<?php

use App\Models\User;
use App\Value\Impact;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected to login', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('the dashboard is empty for a user with no audits', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('sitesTracked', 0)
            ->where('auditsRun', 0)
            ->where('scoreTrend', [])
            ->where('criticalCount', 0)
            ->where('quickWinsCount', 0)
            ->loadDeferredProps(fn (Assert $page) => $page
                ->where('sitesPreview', []),
            ),
        );
});

test('the dashboard aggregates open issues and score trend across all sites', function () {
    $user = User::factory()->create();

    $acmeOld = makeUserAudit($user, 'acme-1', 'acme.com', Status::Completed);
    $acmeOld->forceFill(['created_at' => now()->subDays(10)])->save();
    makeAuditViolation($acmeOld, Impact::Critical, 'color-contrast');

    $acmeLatest = makeUserAudit($user, 'acme-2', 'acme.com', Status::Completed);
    makeAuditViolation($acmeLatest, Impact::Critical, 'color-contrast');
    makeAuditViolation($acmeLatest, Impact::Serious, 'link-name');

    $widgetsAudit = makeUserAudit($user, 'widgets-1', 'widgets.com', Status::Completed);
    makeAuditViolation($widgetsAudit, Impact::Minor, 'region');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('sitesTracked', 2)
            ->where('auditsRun', 3)
            ->has('scoreTrend', 3)
            ->where('criticalCount', 1)
            ->where('oldestOpenCriticalDays', 10)
            ->where('quickWinsCount', 2)
            ->loadDeferredProps(fn (Assert $page) => $page
                ->has('sitesPreview', 2),
            ),
        );
});

test('an in-progress site is included in the preview without a score', function () {
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
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('sitesTracked', 1)
            ->loadDeferredProps(fn (Assert $page) => $page
                ->where('sitesPreview.0.domain', 'wip.com')
                ->where('sitesPreview.0.status', 'started')
                ->where('sitesPreview.0.score', null),
            ),
        );
});

test('a user only sees their own sites on the dashboard', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();

    makeUserAudit($owner, 'owner-audit', 'private.com', Status::Completed);

    $this->actingAs($other)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('sitesTracked', 0)
            ->loadDeferredProps(fn (Assert $page) => $page
                ->where('sitesPreview', []),
            ),
        );
});
