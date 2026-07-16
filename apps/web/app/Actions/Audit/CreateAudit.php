<?php

namespace App\Actions\Audit;

use App\Contracts\Spider;
use App\Exceptions\Audit\RescanTooSoonException;
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

        $this->assertRescanAllowed($user, $url, $limits);

        $requestedDepth = isset($settings['crawlDepth'])
            ? CrawlDepth::from((int) $settings['crawlDepth'])
            : CrawlDepth::Standard;
        $depth = $limits->clampCrawlDepth($requestedDepth);

        $response = $this->spider->create(
            SpiderOptions::make(
                urls: [$url],
                callbackUrl: 'http://web'.route('api.crawler.callback', absolute: false)
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
     * @throws RescanTooSoonException
     */
    protected function assertRescanAllowed(User $user, string $url, PlanLimits $limits): void
    {
        $hours = $limits->rescanFrequencyHours();

        if ($hours === null) {
            return; // Pro: no cap
        }

        $domain = parse_url($url, PHP_URL_HOST);

        $lastAudit = $user->audits()
            ->where('domain', $domain)
            ->latest()
            ->first();

        if ($lastAudit && $lastAudit->created_at->isAfter(now()->subHours($hours))) {
            throw new RescanTooSoonException($lastAudit->created_at->addHours($hours));
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
