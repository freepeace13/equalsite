<?php

namespace App\Models;

use App\Casts\AsNodeCollection;
use App\Value\Impact;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Violation extends Model
{
    protected $table = 'audit_violations';

    protected $fillable = [
        'audit_id',
        'rule_id',
        'impact_level',
        'plain_english_summary', // AI plain-english summary of raw axe-core description
        'fix_instruction', // AI generated fix instruction for developers
        'description', // raw axe-core result
        'failure_summary', // raw axe-core result
        'help_url',
        'nodes',
    ];

    protected $casts = [
        'nodes' => AsNodeCollection::class,
        'impact_level' => Impact::class,
    ];

    public function audit(): BelongsTo
    {
        return $this->belongsTo(Audit::class);
    }

    public function addNode(array $node): void
    {
        $nodes = $this->nodes ?? [];
        $fingerprint = md5($node['target'].$node['html']);

        $nodes[] = [
            'url' => $node['url'],
            'target' => $node['target'],
            'html' => $node['html'],
            'fingerprint' => $fingerprint,
        ];

        $this->update(['nodes' => $nodes]);
    }
}
