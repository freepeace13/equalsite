<?php

namespace App\Actions\Billing;

use App\Models\User;
use Laravel\Paddle\Customer;

/**
 * Ensures the given user has a Paddle customer record before checkout,
 * without ever creating a duplicate one.
 */
class EnsurePaddleCustomer
{
    public function handle(User $user): Customer
    {
        return $user->customer ?: $user->createAsCustomer([
            'email' => $user->email,
            'name' => $user->name,
        ]);
    }
}
