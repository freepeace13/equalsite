<?php

use App\Models\User;
use App\Value\Impact;
use App\Value\Status;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected to login', function () {
    $this->get(route('sites.show', ['domain' => 'acme.com']))->assertRedirect(route('login'));
});

test('a domain the user has never audited 404s', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('sites.show', ['domain' => 'never-audited.com']))
        ->assertNotFound();
});

test('a domain owned by another user 404s', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();

    makeUserAudit($owner, 'owner-audit', 'private.com', Status::Completed);

    $this->actingAs($other)
        ->get(route('sites.show', ['domain' => 'private.com']))
        ->assertNotFound();
});

test('the site page presents the current audit, issue snapshot, score trend and history', function () {
    $user = User::factory()->create();

    $first = makeUserAudit($user, 'acme-1', 'acme.com', Status::Completed);
    $first->forceFill(['created_at' => now()->subDays(2)])->save();
    makeAuditViolation($first, Impact::Critical);

    $latest = makeUserAudit($user, 'acme-2', 'acme.com', Status::Completed);
    makeAuditViolation($latest, Impact::Critical);
    makeAuditViolation($latest, Impact::Serious, 'link-name');
    makeAuditViolation($latest, Impact::Minor, 'region');

    $this->actingAs($user)
        ->get(route('sites.show', ['domain' => 'acme.com']))
        ->assertInertia(fn (Assert $page) => $page
            ->component('sites/show')
            ->where('domain', 'acme.com')
            ->where('currentAudit.auditId', 'acme-2')
            ->where('currentAudit.status', 'completed')
            ->where('currentAudit.issuesFound', 3)
            ->where('issuesSnapshot.critical', 1)
            ->where('issuesSnapshot.quickWins', 2)
            ->has('scoreTrend', 2)
            ->has('history', 2)
            ->where('lastAuditUrl', $latest->url),
        );
});

test('an in-progress current audit has no score yet but still reports scan state', function () {
    $user = User::factory()->create();

    makeUserAudit($user, 'in-progress', 'wip.com', Status::Queued, [
        'queue_state' => ['position' => 3, 'ahead' => 2, 'waiting' => 5],
    ]);

    $this->actingAs($user)
        ->get(route('sites.show', ['domain' => 'wip.com']))
        ->assertInertia(fn (Assert $page) => $page
            ->component('sites/show')
            ->where('currentAudit.status', 'queued')
            ->where('currentAudit.score', null)
            ->where('currentAudit.scanQueue.position', 3)
            ->where('issuesSnapshot', null)
            ->has('scoreTrend', 0),
        );
});

test('history is capped to 5 audits for free accounts with more than 5 audits on a domain', function () {
    $user = User::factory()->create();

    foreach (range(1, 7) as $i) {
        $audit = makeUserAudit($user, "acme-{$i}", 'acme.com', Status::Completed);
        $audit->forceFill(['created_at' => now()->subDays(7 - $i)])->save();
    }

    $this->actingAs($user)
        ->get(route('sites.show', ['domain' => 'acme.com']))
        ->assertInertia(fn (Assert $page) => $page
            ->component('sites/show')
            ->has('history', 5),
        );
});

test('history is not capped for pro accounts', function () {
    $user = User::factory()->pro()->create();

    foreach (range(1, 7) as $i) {
        $audit = makeUserAudit($user, "acme-{$i}", 'acme.com', Status::Completed);
        $audit->forceFill(['created_at' => now()->subDays(7 - $i)])->save();
    }

    $this->actingAs($user)
        ->get(route('sites.show', ['domain' => 'acme.com']))
        ->assertInertia(fn (Assert $page) => $page
            ->component('sites/show')
            ->has('history', 7),
        );
});

test('rescan.availableAt is a future timestamp for a free account within the re-scan window', function () {
    $user = User::factory()->create();
    makeUserAudit($user, 'recent', 'acme.com', Status::Completed);

    $this->actingAs($user)
        ->get(route('sites.show', ['domain' => 'acme.com']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('rescan.availableAt', fn ($value) => $value !== null && Carbon::parse($value)->isFuture()),
        );
});

test('rescan.availableAt is null for a free account once the rescan window has passed', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'old', 'acme.com', Status::Completed);
    $audit->forceFill(['created_at' => now()->subHours(25)])->save();

    $this->actingAs($user)
        ->get(route('sites.show', ['domain' => 'acme.com']))
        ->assertInertia(fn (Assert $page) => $page->where('rescan.availableAt', null));
});

test('rescan.availableAt is a future timestamp for a pro account within the re-scan window, since the rescan cap is not plan-scoped', function () {
    $user = User::factory()->pro()->create();
    makeUserAudit($user, 'just-scanned', 'acme.com', Status::Completed);

    $this->actingAs($user)
        ->get(route('sites.show', ['domain' => 'acme.com']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('rescan.availableAt', fn ($value) => $value !== null && Carbon::parse($value)->isFuture()),
        );
});
