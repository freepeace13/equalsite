<?php

use App\Mail\ContactMessageMail;
use Illuminate\Support\Facades\Mail;

test('the contact page renders for guests', function () {
    $this->get(route('contact.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('contact'));
});

test('submitting the contact form sends mail and redirects with a success flash', function () {
    Mail::fake();

    $response = $this->post(route('contact.store'), [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'message' => 'How do I get a refund?',
    ]);

    $response->assertRedirect(route('contact.edit'));

    Mail::assertSent(ContactMessageMail::class, function (ContactMessageMail $mail) {
        return $mail->name === 'Jane Doe'
            && $mail->email === 'jane@example.com'
            && $mail->message === 'How do I get a refund?';
    });
});

test('the contact form requires name, email, and message', function () {
    $response = $this->post(route('contact.store'), []);

    $response->assertSessionHasErrors(['name', 'email', 'message']);
});

test('the contact form rejects an invalid email address', function () {
    $response = $this->post(route('contact.store'), [
        'name' => 'Jane Doe',
        'email' => 'not-an-email',
        'message' => 'How do I get a refund?',
    ]);

    $response->assertSessionHasErrors(['email']);
});
