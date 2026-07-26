<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DomainBlock extends Model
{
    protected $fillable = [
        'domain',
        'reason',
    ];

    public static function isBlocked(string $domain): bool
    {
        return static::where('domain', $domain)->exists();
    }
}
