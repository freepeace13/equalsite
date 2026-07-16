<?php

use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

/**
 * The register form deliberately drops the confirm-password field to keep
 * signup to name/email/password — CreateNewUser::create() must not require
 * a password_confirmation field that the frontend never sends.
 */
test('new users can register with just a name, email, and password', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});
