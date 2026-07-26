<?php

test('the security page renders with the support contact email', function () {
    config(['services.support.email' => 'support@equalsite.app']);

    $this->get(route('legal.security'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('legal/security')
            ->where('contactEmail', 'support@equalsite.app')
        );
});

test('security.txt exists in the public directory with the correct contact', function () {
    $path = public_path('.well-known/security.txt');

    expect(file_exists($path))->toBeTrue()
        ->and(file_get_contents($path))->toContain('Contact: mailto:support@equalsite.app');
});
