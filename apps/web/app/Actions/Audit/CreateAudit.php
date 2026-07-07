<?php

namespace App\Actions\Audit;

use App\Contracts\Spider;
use App\Models\Audit;
use App\Support\Spider\EnqueueStrategy;
use App\Support\Spider\SpiderOptions;
use App\Value\Status;

class CreateAudit
{
    public function __construct(
        protected Spider $spider,
    ) {}

    /**
     * @param  array{crawlDepth?: int, include?: ?string, exclude?: ?string, sameDomain?: bool, userId?: ?int}  $settings
     */
    public function create(string $url, array $settings = []): Audit
    {
        $response = $this->spider->create(
            SpiderOptions::make(
                urls: [$url],
                callbackUrl: 'http://web'.route('api.crawler.callback', absolute: false)
            )->setOptions([
                'maxPages' => 50,
                'enqueueLinks' => true,
                'enqueueStrategy' => filter_var($settings['sameDomain'] ?? true, FILTER_VALIDATE_BOOLEAN)
                    ? EnqueueStrategy::SameDomain
                    : EnqueueStrategy::All,
                'maxDepth' => isset($settings['crawlDepth']) ? (int) $settings['crawlDepth'] : 3,
                'includeGlobs' => $this->parsePatterns($settings['include'] ?? null),
                'excludeGlobs' => $this->parsePatterns($settings['exclude'] ?? null),
            ])
        );

        return Audit::create([
            'user_id' => $settings['userId'] ?? null,
            'domain' => parse_url($url, PHP_URL_HOST),
            'url' => $url,
            'status' => Status::Queued,
            'crawler_id' => $response['id'],
        ]);
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
