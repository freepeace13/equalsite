<?php

namespace App\Actions\Audit;

use App\Contracts\Spider;
use App\Exceptions\Audit\RescanTooSoonException;
use App\Exceptions\Audit\SiteCapExceededException;
use App\Models\Audit;
use App\Models\User;
use App\Support\Plan\PlanLimits;
use App\Support\Spider\EnqueueStrategy;
use App\Support\Spider\SpiderOptions;
use App\Value\CrawlDepth;
use App\Value\Status;

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

        $callbackUrl = config('services.crawler.callback_base_url').route('api.crawler.callback', absolute: false);

        $response = $this->spider->create(
            SpiderOptions::make(
                urls: [$url],
                callbackUrl: $callbackUrl
            )->setOptions([
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

        return Audit::create([
            'user_id' => $user->id,
            'domain' => parse_url($url, PHP_URL_HOST),
            'url' => $url,
            'status' => Status::Queued,
            'crawler_id' => $response['id'],
        ]);
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
     * @throws RescanTooSoonException
     */
    protected function assertRescanAllowed(User $user, string $url, PlanLimits $limits): void
    {
        $minutes = $limits->rescanFrequencyMinutes();

        if ($minutes === null) {
            return; // Pro: no cap
        }

        $domain = parse_url($url, PHP_URL_HOST);

        $lastAudit = $user->audits()
            ->where('domain', $domain)
            ->latest()
            ->first();

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
