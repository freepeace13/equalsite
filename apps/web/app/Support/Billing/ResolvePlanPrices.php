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
     * @return array{monthly: ?array{id: string, formatted: string, currency: string}, yearly: ?array{id: string, formatted: string, currency: string}}
     */
    public function resolve(): array
    {
        try {
            return Cache::remember('billing.prices.preview', now()->addHour(), function (): array {
                $previews = Cashier::previewPrices(config('cashier.prices'));

                $monthly = $previews->first(fn (PricePreview $preview): bool => $preview->price()->interval() === 'month');
                $yearly = $previews->first(fn (PricePreview $preview): bool => $preview->price()->interval() === 'year');

                return [
                    'monthly' => $this->present($monthly),
                    'yearly' => $this->present($yearly),
                ];
            });
        } catch (Throwable $e) {
            Log::warning('Unable to resolve Paddle price previews.', ['exception' => $e]);

            return ['monthly' => null, 'yearly' => null];
        }
    }

    /**
     * Reduce a PricePreview to plain, safely-serializable data before it's
     * handed to Cache::remember(). Caching the live Paddle SDK object graph
     * directly is what caused stale cache entries to unserialize as
     * __PHP_Incomplete_Class after the object's shape changed underneath it.
     *
     * @return array{id: string, formatted: string, currency: string}|null
     */
    protected function present(?PricePreview $preview): ?array
    {
        if ($preview === null) {
            return null;
        }

        return [
            'id' => $preview->price()->id,
            'formatted' => $preview->total(),
            'currency' => $preview->currency()->getCode(),
        ];
    }
}
