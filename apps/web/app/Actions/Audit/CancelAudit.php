<?php

namespace App\Actions\Audit;

use App\AggregateRoots\AuditAggregateRoot;
use App\Contracts\Spider;
use App\Models\Audit;

class CancelAudit
{
    public function __construct(
        protected Spider $spider,
    ) {}

    public function cancel(Audit $audit): void
    {
        if (! $audit->status->cancellable()) {
            return;
        }

        $this->spider->cancel($audit->crawler_id);

        AuditAggregateRoot::retrieve($audit->crawler_id)
            ->cancel(now()->toIso8601String())
            ->persist();
    }
}
