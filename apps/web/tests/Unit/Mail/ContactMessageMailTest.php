<?php

use App\Mail\ContactMessageMail;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

uses(TestCase::class);

test('the envelope is addressed to the configured support email with a reply-to of the sender', function () {
    Config::set('services.support.email', 'support@example.test');

    $mail = new ContactMessageMail('Jane Doe', 'jane@example.com', 'Refunds question');

    $envelope = $mail->envelope();

    expect($envelope->to)->toHaveCount(1)
        ->and($envelope->to[0]->address)->toBe('support@example.test')
        ->and($envelope->replyTo)->toHaveCount(1)
        ->and($envelope->replyTo[0]->address)->toBe('jane@example.com')
        ->and($envelope->subject)->toBe('New contact form message from Jane Doe');
});

test('the rendered mail contains the sender name and message body', function () {
    $mail = new ContactMessageMail('Jane Doe', 'jane@example.com', 'Refunds question');

    $rendered = $mail->render();

    expect($rendered)
        ->toContain('Jane Doe')
        ->toContain('jane@example.com')
        ->toContain('Refunds question');
});
