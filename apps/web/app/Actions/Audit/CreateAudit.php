<?php

namespace App\Actions\Audit;

use App\AggregateRoots\AuditAggregateRoot;
use App\Contracts\Spider;
use App\Exceptions\Audit\AuditInProgressException;
use App\Exceptions\Audit\RescanTooSoonException;
use App\Exceptions\Audit\SiteCapExceededException;
use App\Models\Audit;
use App\Models\User;
use App\Support\Plan\PlanLimits;
use App\Support\Spider\EnqueueStrategy;
use App\Support\Spider\SpiderOptions;
use App\Value\CrawlDepth;

class CreateAudit
{
    public function __construct(
        protected Spider $spider,
    ) {}

    /**
     * @param  array{crawlDepth?: int, include?: ?string, exclude?: ?string, sameDomain?: bool}  $settings
     */
    public function create(User $user, string $url, array $settings = []): Audit
    {
        $limits = PlanLimits::for($user->plan);

        $this->assertSiteCapAllowed($user, $url, $limits);
        $this->assertRescanAllowed($user, $url, $limits);

        $requestedDepth = isset($settings['crawlDepth'])
            ? CrawlDepth::from((int) $settings['crawlDepth'])
            : CrawlDepth::Standard;
        $depth = $limits->clampCrawlDepth($requestedDepth);

        $response = $this->spider->create(
            SpiderOptions::make([$url])->setOptions([
                'maxPages' => $limits->pageCap(),
                'enqueueLinks' => true,
                'enqueueStrategy' => filter_var($settings['sameDomain'] ?? true, FILTER_VALIDATE_BOOLEAN)
                    ? EnqueueStrategy::SameDomain
                    : EnqueueStrategy::All,
                'maxDepth' => $depth->value,
                'includeGlobs' => $this->parsePatterns($settings['include'] ?? null),
                'excludeGlobs' => $this->parsePatterns($settings['exclude'] ?? null),
            ])
        );

        AuditAggregateRoot::retrieve($response['id'])
            ->create($user->id, $url, parse_url($url, PHP_URL_HOST))
            ->persist();

        return Audit::findById($response['id']);
    }

    /**
     * @throws SiteCapExceededException
     */
    protected function assertSiteCapAllowed(User $user, string $url, PlanLimits $limits): void
    {
        $cap = $limits->siteCap();

        if ($cap === null) {
            return; // Pro: no cap
        }

        $domain = parse_url($url, PHP_URL_HOST);
        $existingDomains = $user->audits()->distinct('domain')->pluck('domain');

        // Re-scanning an already-owned site never counts against the site cap.
        if ($existingDomains->contains($domain)) {
            return;
        }

        if ($existingDomains->count() >= $cap) {
            throw new SiteCapExceededException($cap);
        }
    }

    /**
     * @throws AuditInProgressException
     * @throws RescanTooSoonException
     */
    protected function assertRescanAllowed(User $user, string $url, PlanLimits $limits): void
    {
        $domain = parse_url($url, PHP_URL_HOST);

        $lastAudit = $user->audits()
            ->where('domain', $domain)
            ->latest()
            ->first();

        // Applies to both plans — a second concurrent scan of the same
        // domain is blocked regardless of the rescan-frequency cap below.
        if ($lastAudit && $lastAudit->isActive()) {
            throw new AuditInProgressException;
        }

        $minutes = $limits->rescanFrequencyMinutes();

        if ($minutes === null) {
            return; // Pro: no cap
        }

        if ($lastAudit && $lastAudit->created_at->isAfter(now()->subMinutes($minutes))) {
            throw new RescanTooSoonException($lastAudit->created_at->addMinutes($minutes));
        }
    }

    /**
     * @return list<string>
     */
    protected function parsePatterns(?string $patterns): array
    {
        if (! $patterns) {
            return [];
        }

        return collect(explode(',', $patterns))
            ->map(fn (string $pattern) => trim($pattern))
            ->filter()
            ->values()
            ->all();
    }
}
