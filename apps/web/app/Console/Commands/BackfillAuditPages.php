<?php

namespace App\Console\Commands;

use App\Models\Audit;
use App\Models\AuditPage;
use Illuminate\Console\Command;

class BackfillAuditPages extends Command
{
    protected $signature = 'audit-pages:backfill';

    protected $description = 'Backfill audit_pages rows from the legacy custom_data.scanned_urls JSON blob';

    public function handle(): int
    {
        $audits = Audit::query()
            ->whereNotNull('custom_data->scanned_urls')
            ->get();

        $this->info("Backfilling {$audits->count()} audits...");

        foreach ($audits as $audit) {
            $scannedUrls = $audit->getCustomData('scanned_urls', []);

            foreach ($scannedUrls as $url => $data) {
                if (! is_array($data) || ! isset($data['status'])) {
                    continue;
                }

                AuditPage::updateOrCreate(
                    ['audit_id' => $audit->id, 'url' => $url],
                    $this->mapAttributes($data),
                );
            }
        }

        $this->info('Done.');

        return self::SUCCESS;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mapAttributes(array $data): array
    {
        $severity = $data['severityBreakdown'] ?? null;

        $lastActivityAt = $data['failedAt']
            ?? $data['completedAt']
            ?? $data['skippedAt']
            ?? $data['startedAt']
            ?? now()->toIso8601String();

        return [
            'status' => $data['status'],
            'attempts_count' => $data['attemptsCount'] ?? null,
            'started_at' => $data['startedAt'] ?? null,
            'completed_at' => $data['completedAt'] ?? null,
            'failed_at' => $data['failedAt'] ?? null,
            'skipped_at' => $data['skippedAt'] ?? null,
            'last_activity_at' => $lastActivityAt,
            'violations_count' => $data['violationsCount'] ?? null,
            'critical_count' => $severity['critical'] ?? null,
            'serious_count' => $severity['serious'] ?? null,
            'moderate_count' => $severity['moderate'] ?? null,
            'minor_count' => $severity['minor'] ?? null,
            'error_code' => $data['errorCode'] ?? null,
            'error_message' => $data['errorMessage'] ?? null,
            'skipping_reason' => $data['skippingReason'] ?? null,
        ];
    }
}
