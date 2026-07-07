<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class MagicLinkNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(User $notifiable): MailMessage
    {
        $url = URL::temporarySignedRoute(
            'magic-link.login',
            now()->addDays(7),
            ['user' => $notifiable->getKey()],
        );

        return (new MailMessage)
            ->subject('Your Equalsite sign-in link')
            ->line("Here's your link to sign in — no password needed.")
            ->action('Sign in', $url)
            ->line('This link expires in 7 days. If you did not request this, you can ignore this email.');
    }
}
