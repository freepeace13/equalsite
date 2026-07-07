<?php

use App\Contracts\Spider;
use App\Models\Audit;
use App\Models\User;
use App\Notifications\MagicLinkNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

function fakeSpider(string $crawlerId = 'crawler-123'): void
{
    test()->mock(Spider::class)
        ->shouldReceive('create')
        ->once()
        ->andReturn(['id' => $crawlerId]);
}

test('submitting an audit with an email creates and authenticates a magic-link user, and associates the audit', function () {
    Notification::fake();
    fakeSpider('crawler-with-email');

    $response = $this->post(route('audit.store'), [
        'url' => 'https://example.com',
        'email' => 'jamie@example.com',
    ]);

    $user = User::where('email', 'jamie@example.com')->first();

    expect($user)->not->toBeNull();
    $this->assertAuthenticatedAs($user);

    $audit = Audit::findById('crawler-with-email');
    expect($audit->user_id)->toBe($user->id);

    Notification::assertSentTo($user, MagicLinkNotification::class);

    $response->assertRedirect(route('audit.progress', ['id' => 'crawler-with-email']));
});

test('submitting an audit without an email stays a guest and creates no user association', function () {
    fakeSpider('crawler-guest');

    $response = $this->post(route('audit.store'), [
        'url' => 'https://example.com',
    ]);

    $this->assertGuest();

    $audit = Audit::findById('crawler-guest');
    expect($audit->user_id)->toBeNull();

    $response->assertRedirect(route('audit.progress', ['id' => 'crawler-guest']));
});

test('submitting an audit with an existing email logs into the existing user rather than duplicating it', function () {
    Notification::fake();
    fakeSpider('crawler-existing-user');

    $existing = User::factory()->create(['email' => 'jamie@example.com']);

    $this->post(route('audit.store'), [
        'url' => 'https://example.com',
        'email' => 'jamie@example.com',
    ]);

    expect(User::where('email', 'jamie@example.com')->count())->toBe(1);
    $this->assertAuthenticatedAs($existing);
});
