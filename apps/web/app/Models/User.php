<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Value\Plan;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Paddle\Billable;

// 'plan' is deliberately excluded from Fillable — the only legitimate writers
// are SyncUserPlanFromSubscription (webhook-driven) and test factories/seeders,
// never mass-assignment from a request.
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use Billable,
        HasFactory,
        Notifiable,
        TwoFactorAuthenticatable;

    /**
     * Eloquent doesn't refresh DB-level column defaults onto the in-memory
     * instance after an insert, so a freshly created User's $plan would read
     * as null (not 'free') until re-fetched. Set it here too so every new
     * instance — factories, registration, tests' actingAs() — has it from
     * the moment it's constructed, not just once reloaded from the database.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'plan' => 'free',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'plan' => Plan::class,
        ];
    }

    public function audits(): HasMany
    {
        return $this->hasMany(Audit::class);
    }
}
