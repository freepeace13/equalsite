<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactMessageMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $name,
        public string $email,
        public string $message,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            to: [config('services.support.email')],
            replyTo: [$this->email],
            subject: 'New contact form message from '.$this->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.contact-message',
            with: [
                'name' => $this->name,
                'email' => $this->email,
                'body' => $this->message,
            ],
        );
    }
}
