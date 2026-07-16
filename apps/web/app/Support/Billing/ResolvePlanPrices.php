<?php

namespace App\Support\Billing;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Laravel\Paddle\Cashier;
use Laravel\Paddle\PricePreview;
use Throwable;

/**
 * Resolves which of config('cashier.prices')'s two Paddle price IDs is the
 * monthly one and which is the yearly one, via Cashier::previewPrices() and
 * the Paddle API's own billing_cycle.interval metadata — never by assuming
 * array position order (the config array carries no monthly/yearly label).
 *
 * Cached for an hour: this is a live HTTP call to Paddle's API, and it was
 * previously made fresh on every settings/billing page view (twice per
 * checkout click, once for the page load and once for checkout() re-resolving
 * it) with no timeout override and no failure fallback — a slow or down
 * Paddle API meant a slow or broken billing page. Two fixed price IDs change
 * rarely enough that an hour-old preview is never meaningfully wrong.
 */
class ResolvePlanPrices
{
    /**
     * @return array{monthly: ?PricePreview, yearly: ?PricePreview}
     */
    public function resolve(): array
    {
        try {
            return Cache::remember('billing.prices.preview', now()->addHour(), function (): array {
                $previews = Cashier::previewPrices(config('cashier.prices'));

                return [
                    'monthly' => $previews->first(fn (PricePreview $preview): bool => $preview->price()->interval() === 'month'),
                    'yearly' => $previews->first(fn (PricePreview $preview): bool => $preview->price()->interval() === 'year'),
                ];
            });
        } catch (Throwable $e) {
            Log::warning('Unable to resolve Paddle price previews.', ['exception' => $e]);

            return ['monthly' => null, 'yearly' => null];
        }
    }
}
