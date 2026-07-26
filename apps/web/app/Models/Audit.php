<?php

namespace App\Models;

use App\Value\Status;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Arr;

class Audit extends Model
{
    protected $fillable = [
        'user_id',
        'url',
        'domain',
        'status', // queued, started, cancelled, failed, completed
        'failure_reason',
        'failure_code',
        'crawler_id',
        'cancelled_at',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'status' => Status::class,
        'custom_data' => 'array',
        'cancelled_at' => 'datetime',
        'completed_at' => 'datetime',
        'started_at' => 'datetime',
    ];

    public static function findById(string $crawlerId): ?Audit
    {
        return static::where('crawler_id', $crawlerId)->first();
    }

    public function isActive(): bool
    {
        return $this->status->queued() || $this->status->started();
    }

    public function getCustomData(string $key, $default = null)
    {
        return Arr::get($this->custom_data ?? [], $key, $default);
    }

    public function setCustomData(string $key, mixed $value): self
    {
        $customData = $this->custom_data ?? [];

        Arr::set($customData, $key, $value);

        $this->forceFill([
            'custom_data' => $customData,
        ])->save();

        return $this;
    }

    /**
     * @param  string[] | string  $key
     *
     * @deprecated use tapCustomData instead
     */
    public function patchCustomData($key, Closure $callback, $default = null): self
    {
        return $this->tapCustomData($key, $callback, $default);
    }

    public function tapCustomData(string $key, Closure $callback, $default = null): self
    {
        $value = $this->getCustomData($key, $default);

        $this->setCustomData($key, $callback($value));

        return $this;
    }

    public function forgetCustomData(string $key): self
    {
        $customData = $this->custom_data ?? [];

        if (isset($customData[$key])) {
            unset($customData[$key]);
        }

        $this->forceFill([
            'custom_data' => $customData,
        ])->save();

        return $this;
    }

    public function violations(): HasMany
    {
        return $this->hasMany(Violation::class);
    }

    public function pages(): HasMany
    {
        return $this->hasMany(AuditPage::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
