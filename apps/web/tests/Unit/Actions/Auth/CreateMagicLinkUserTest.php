<?php

use App\Actions\Auth\CreateMagicLinkUser;
use App\Models\User;
use App\Notifications\MagicLinkNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('creates a passwordless user from a bare email', function () {
    Notification::fake();

    $user = (new CreateMagicLinkUser)->handle('newcomer@example.com');

    expect($user)->toBeInstanceOf(User::class)
        ->and($user->email)->toBe('newcomer@example.com')
        ->and($user->password)->toBeNull()
        ->and($user->name)->toBeNull();

    $this->assertDatabaseHas('users', [
        'email' => 'newcomer@example.com',
        'password' => null,
    ]);
});

test('reuses the existing user when the email already has an account', function () {
    Notification::fake();

    $first = (new CreateMagicLinkUser)->handle('returning@example.com');
    $second = (new CreateMagicLinkUser)->handle('returning@example.com');

    expect($second->id)->toBe($first->id);
    $this->assertDatabaseCount('users', 1);
});

test('sends the magic link notification to the user', function () {
    Notification::fake();

    $user = (new CreateMagicLinkUser)->handle('linked@example.com');

    Notification::assertSentTo($user, MagicLinkNotification::class);
});
