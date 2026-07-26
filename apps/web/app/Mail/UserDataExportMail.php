<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserDataExportMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  array<string, mixed>  $export
     */
    public function __construct(
        public string $recipientName,
        public string $recipientEmail,
        public array $export,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            to: [$this->recipientEmail],
            subject: 'Your Equalsite data export',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.user-data-export',
            with: [
                'name' => $this->recipientName,
            ],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromData(
                fn () => json_encode($this->export, JSON_PRETTY_PRINT),
                'equalsite-data-export.json'
            )->withMime('application/json'),
        ];
    }
}
