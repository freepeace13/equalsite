<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditPage extends Model
{
    protected $fillable = [
        'audit_id',
        'url',
        'status',
        'attempts_count',
        'started_at',
        'completed_at',
        'failed_at',
        'skipped_at',
        'last_activity_at',
        'violations_count',
        'critical_count',
        'serious_count',
        'moderate_count',
        'minor_count',
        'error_code',
        'error_message',
        'skipping_reason',
    ];

    protected $casts = [
        'attempts_count' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'failed_at' => 'datetime',
        'skipped_at' => 'datetime',
        'last_activity_at' => 'datetime',
        'violations_count' => 'integer',
        'critical_count' => 'integer',
        'serious_count' => 'integer',
        'moderate_count' => 'integer',
        'minor_count' => 'integer',
    ];

    public function audit(): BelongsTo
    {
        return $this->belongsTo(Audit::class);
    }

    /**
     * @return array{
     *     url: string,
     *     status: string,
     *     attemptsCount: ?int,
     *     startedAt: ?string,
     *     completedAt: ?string,
     *     failedAt: ?string,
     *     skippedAt: ?string,
     *     lastActivityAt: string,
     *     violationsCount: ?int,
     *     criticalCount: ?int,
     *     seriousCount: ?int,
     *     moderateCount: ?int,
     *     minorCount: ?int,
     *     errorCode: ?string,
     *     errorMessage: ?string,
     *     skippingReason: ?string
     * }
     */
    public function toProp(): array
    {
        return [
            'url' => $this->url,
            'status' => $this->status,
            'attemptsCount' => $this->attempts_count,
            'startedAt' => $this->started_at?->toIso8601String(),
            'completedAt' => $this->completed_at?->toIso8601String(),
            'failedAt' => $this->failed_at?->toIso8601String(),
            'skippedAt' => $this->skipped_at?->toIso8601String(),
            'lastActivityAt' => $this->last_activity_at->toIso8601String(),
            'violationsCount' => $this->violations_count,
            'criticalCount' => $this->critical_count,
            'seriousCount' => $this->serious_count,
            'moderateCount' => $this->moderate_count,
            'minorCount' => $this->minor_count,
            'errorCode' => $this->error_code,
            'errorMessage' => $this->error_message,
            'skippingReason' => $this->skipping_reason,
        ];
    }
}
