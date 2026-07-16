<?php

namespace App\Providers;

use App\Support\Plan\PlanLimits;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRateLimiting();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn (): ?Password => app()->isProduction()
                ? Password::min(12)
                    ->mixedCase()
                    ->letters()
                    ->numbers()
                    ->symbols()
                    ->uncompromised()
                : null,
        );

        $this->assertPaddleWebhookSecretIsConfigured();
    }

    /**
     * An empty PADDLE_WEBHOOK_SECRET makes Cashier's WebhookController skip
     * signature verification entirely; the committed .env.example placeholder
     * value is public, so leaving it in place verifies nothing either — both
     * let anyone forge a `subscription.created` webhook and grant themselves
     * Pro for free. Fail hard in production rather than let either ship
     * silently.
     */
    protected function assertPaddleWebhookSecretIsConfigured(): void
    {
        if (! app()->isProduction()) {
            return;
        }

        $secret = config('cashier.webhook_secret');

        abort_unless(
            filled($secret) && $secret !== 'your-paddle-webhook-secret',
            500,
            'PADDLE_WEBHOOK_SECRET is missing or still set to the .env.example placeholder value.'
        );
    }

    /**
     * Configure rate limiting.
     *
     * This throttles raw submission volume on POST /audit — independent of,
     * and in addition to, the 24h same-site re-scan business rule enforced in
     * CreateAudit::assertRescanAllowed(). It knows nothing about domains, only
     * a rolling per-hour window keyed by user id.
     *
     * ->after() defers the hit until the response is known instead of
     * charging it up front. AuditCreateRequest's validation/authorization
     * runs during controller dispatch, after this middleware would normally
     * already have consumed an attempt — so without ->after(), a mistyped
     * URL or a denied domain (e.g. the "1 in-flight audit" cap) burns quota
     * before CreateAudit ever runs. Laravel's route-level pipeline renders
     * the resulting ValidationException/AuthorizationException into a
     * response (a redirect with flashed `errors`, or a 403) rather than
     * letting it propagate as a thrown exception, so we can't detect those
     * cases by catching an exception here — only by inspecting the
     * response: anything other than a clean, error-free redirect is treated
     * as never having reached CreateAudit and doesn't count.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('audit-submission', function (Request $request) {
            $user = $request->user();
            $limits = PlanLimits::for($user->plan);

            return ($limits->siteCap() === null // Pro
                ? Limit::perHour(20)
                : Limit::perHour(5))
                ->by($user->id)
                ->after(fn ($response) => $response->getStatusCode() < 400 && blank(session('errors')));
        });
    }
}
