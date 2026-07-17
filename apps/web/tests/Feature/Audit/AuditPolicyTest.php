<?php

use App\Models\User;
use App\Policies\AuditPolicy;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a user can view their own audit', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'owned', 'acme.com', Status::Completed);

    expect((new AuditPolicy)->view($user, $audit))->toBeTrue();
});

test('a user cannot view another user\'s audit', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $audit = makeUserAudit($owner, 'owned', 'acme.com', Status::Completed);

    expect((new AuditPolicy)->view($other, $audit))->toBeFalse();
});

test('create is denied while a queued audit is already in flight (free)', function () {
    $user = User::factory()->create();
    makeUserAudit($user, 'in-flight', 'acme.com', Status::Queued);

    expect((new AuditPolicy)->create($user))->toBeFalse();
});

test('create is denied while a started audit is already in flight (pro)', function () {
    $user = User::factory()->pro()->create();
    makeUserAudit($user, 'in-flight', 'acme.com', Status::Started);

    expect((new AuditPolicy)->create($user))->toBeFalse();
});

test('the in-flight check does not block on an audit that already finished', function () {
    $user = User::factory()->create();
    makeUserAudit($user, 'finished', 'acme.com', Status::Completed);

    expect((new AuditPolicy)->create($user))->toBeTrue();
});

test('a free user is allowed to create their very first audit', function () {
    $user = User::factory()->create();

    expect((new AuditPolicy)->create($user))->toBeTrue();
});

/**
 * The free-tier site cap is no longer enforced here — it moved to
 * CreateAudit::assertSiteCapAllowed() (see tests/Unit/Actions/Audit/CreateAuditTest.php)
 * so a denial can carry an upgrade-prompt message instead of a bare 403.
 */
test('a free user already at the 1-site cap is still allowed by the policy, since the cap is enforced elsewhere', function () {
    $user = User::factory()->create();
    makeUserAudit($user, 'first-site', 'acme.com', Status::Completed);

    expect((new AuditPolicy)->create($user))->toBeTrue();
});
