<?php

namespace App\Actions\Auth;

use App\Models\User;
use App\Notifications\MagicLinkNotification;

class CreateMagicLinkUser
{
    public function handle(string $email): User
    {
        $user = User::firstOrCreate(['email' => $email]);

        $user->notify(new MagicLinkNotification);

        return $user;
    }
}
