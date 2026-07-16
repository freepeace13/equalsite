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
    // Pro, so the site-cap branch can't also be the reason for a false result
    // here — this isolates the in-flight check specifically.
    $user = User::factory()->pro()->create();
    makeUserAudit($user, 'finished', 'acme.com', Status::Completed);

    expect((new AuditPolicy)->create($user))->toBeTrue();
});

test('a free user is allowed to create their very first audit', function () {
    $user = User::factory()->create();

    expect((new AuditPolicy)->create($user))->toBeTrue();
});

test('a free user is denied once they are already at the 1-site cap', function () {
    $user = User::factory()->create();
    makeUserAudit($user, 'first-site', 'acme.com', Status::Completed);

    expect((new AuditPolicy)->create($user))->toBeFalse();
});

test('a pro user is allowed regardless of how many sites they already own', function () {
    $user = User::factory()->pro()->create();
    makeUserAudit($user, 'site-1', 'acme.com', Status::Completed);
    makeUserAudit($user, 'site-2', 'beta.com', Status::Completed);
    makeUserAudit($user, 'site-3', 'gamma.com', Status::Completed);

    expect((new AuditPolicy)->create($user))->toBeTrue();
});
