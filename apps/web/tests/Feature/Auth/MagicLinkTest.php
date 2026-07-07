<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;

uses(RefreshDatabase::class);

test('visiting a validly signed magic link authenticates the user', function () {
    $user = User::factory()->create();

    $url = URL::temporarySignedRoute(
        'magic-link.login',
        now()->addDays(7),
        ['user' => $user->id],
    );

    $response = $this->get($url);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect('/');
});

test('a tampered magic link is rejected', function () {
    $user = User::factory()->create();

    $url = URL::temporarySignedRoute(
        'magic-link.login',
        now()->addDays(7),
        ['user' => $user->id],
    );

    $tampered = $url.'&tampered=1';

    $response = $this->get($tampered);

    $response->assertForbidden();
    $this->assertGuest();
});

test('an expired magic link is rejected', function () {
    $user = User::factory()->create();

    $url = URL::temporarySignedRoute(
        'magic-link.login',
        now()->subDay(),
        ['user' => $user->id],
    );

    $response = $this->get($url);

    $response->assertForbidden();
    $this->assertGuest();
});
