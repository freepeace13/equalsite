<?php

use App\Models\User;
use App\Value\Plan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

// Regression test: Eloquent doesn't refresh DB-level column defaults onto the
// in-memory model instance after an insert, so a freshly created User's
// $plan used to read as null (only a re-fetch from the DB would see the
// 'free' column default) until User::$attributes carried an explicit
// in-memory default too.
test('a freshly created user has the free plan immediately, with no re-fetch needed', function () {
    $user = User::factory()->create();

    expect($user->plan)->toBe(Plan::Free);
});

test('a brand new, unsaved user instance already defaults to the free plan', function () {
    $user = new User;

    expect($user->plan)->toBe(Plan::Free);
});

test('plan cannot be set via mass assignment', function () {
    $user = User::create([
        'name' => 'Jamie',
        'email' => 'jamie@example.com',
        'password' => 'secret-password',
        'plan' => 'pro',
    ]);

    expect($user->plan)->toBe(Plan::Free);
    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'plan' => 'free',
    ]);
});
