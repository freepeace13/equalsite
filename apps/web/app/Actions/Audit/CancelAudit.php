<?php

namespace App\Actions\Audit;

use App\Contracts\Spider;
use App\Models\Audit;
use App\Value\Status;

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

        $audit->update([
            'status' => Status::Cancelled,
            'cancelled_at' => now(),
        ]);
    }
}
