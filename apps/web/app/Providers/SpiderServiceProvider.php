<?php

namespace App\Providers;

use App\Contracts\ArtifactRepository as ArtifactRepositoryContract;
use App\Contracts\ScoreCalculator;
use App\Contracts\Spider;
use App\Services\ArtifactRepository;
use App\Services\HealthScoreCalculator;
use App\Support\Spider\SpiderClient;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\ServiceProvider;

class SpiderServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ArtifactRepositoryContract::class, ArtifactRepository::class);
        $this->app->bind(ScoreCalculator::class, HealthScoreCalculator::class);
        $this->app->singleton(Spider::class, SpiderClient::class);
    }

    public function boot(): void
    {
        $config = $this->app->make('config');

        Http::macro('spider', function () use ($config) {
            $crawler = $config->get('services.crawler');
            $hostname = $crawler['host'].':'.$crawler['port'];

            return Http::withToken($crawler['secret'])
                ->baseUrl("http://{$hostname}/api/v1")
                ->timeout(10)
                ->connectTimeout(3)
                ->throw()
                ->asJson();
        });
    }
}
