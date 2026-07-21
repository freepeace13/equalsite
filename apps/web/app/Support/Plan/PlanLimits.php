<?php

namespace App\Support\Plan;

use App\Value\CrawlDepth;
use App\Value\Plan;

/**
 * The single seam between config/plans.php and the rest of the app — nothing
 * else should read config('plans.*') directly. AuditPolicy, AuditCreateRequest,
 * CreateAudit, and the audit-submission rate limiter all consult limits through
 * this class so they can never drift from one another.
 */
final class PlanLimits
{
    public function __construct(protected Plan $plan) {}

    public static function for(Plan $plan): self
    {
        return new self(config('plans.enabled') ? $plan : Plan::Pro);
    }

    public function siteCap(): ?int
    {
        return $this->get('site_cap');
    }

    public function pageCap(): int
    {
        return $this->get('page_cap');
    }

    /**
     * @return list<CrawlDepth>
     */
    public function allowedCrawlDepths(): array
    {
        return array_map(
            fn (int $value): CrawlDepth => CrawlDepth::from($value),
            $this->get('crawl_depths'),
        );
    }

    public function clampCrawlDepth(CrawlDepth $requested): CrawlDepth
    {
        $allowed = $this->allowedCrawlDepths();

        if (in_array($requested, $allowed, strict: true)) {
            return $requested;
        }

        // Fall back to the loosest (deepest) depth this plan allows.
        return collect($allowed)->sortByDesc(fn (CrawlDepth $depth): int => $depth->value)->first();
    }

    public function rescanFrequencyMinutes(): ?int
    {
        return $this->get('rescan_frequency_minutes');
    }

    public function historyRetention(): ?int
    {
        return $this->get('history_retention');
    }

    public function queuePriority(): int
    {
        return $this->get('queue_priority');
    }

    protected function get(string $key): mixed
    {
        return config("plans.{$this->plan->value}.{$key}");
    }
}
