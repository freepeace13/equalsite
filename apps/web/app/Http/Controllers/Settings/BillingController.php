<?php

namespace App\Http\Controllers\Settings;

use App\Actions\Billing\EnsurePaddleCustomer;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\BillingCheckoutRequest;
use App\Support\Billing\ResolvePlanPrices;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Paddle\PricePreview;

class BillingController extends Controller
{
    /**
     * Show the user's billing settings page.
     */
    public function edit(Request $request, ResolvePlanPrices $resolvePlanPrices): Response
    {
        $user = $request->user();
        $subscription = $user->subscription();
        $prices = $resolvePlanPrices->resolve();

        return Inertia::render('settings/billing', [
            'plan' => $user->plan->value,
            'subscription' => $user->subscribed() ? [
                'status' => $subscription->status,
                'onGracePeriod' => $subscription->onGracePeriod(),
                'endsAt' => $subscription->ends_at?->toIso8601String(),
            ] : null,
            'prices' => [
                'monthly' => $this->presentPrice($prices['monthly']),
                'yearly' => $this->presentPrice($prices['yearly']),
            ],
        ]);
    }

    /**
     * Resolve the customer/price pair the "Subscribe" button hands off to
     * Paddle.Checkout.open() client-side. JSON, not Inertia, deliberately —
     * see architecture doc section 2.2 for why: the checkout overlay is a
     * client-side JS widget, not a page Paddle redirects to/from.
     *
     * The client never supplies a Paddle price ID directly — only an
     * `interval` enum — so a tampered request can't check out against an
     * arbitrary price.
     */
    public function checkout(
        BillingCheckoutRequest $request,
        EnsurePaddleCustomer $ensurePaddleCustomer,
        ResolvePlanPrices $resolvePlanPrices
    ): JsonResponse {
        $user = $request->user();

        abort_if($user->subscribed(), 409, 'You already have an active subscription.');

        $customer = $ensurePaddleCustomer->handle($user);

        $prices = $resolvePlanPrices->resolve();
        $preview = $prices[$request->string('interval')->toString() === 'yearly' ? 'yearly' : 'monthly'];

        abort_if($preview === null, 422, 'Unable to resolve a price for the requested interval.');

        return response()->json([
            'customerId' => $customer->paddle_id,
            'priceId' => $preview->price()->id,
        ]);
    }

    /**
     * Cancel the user's Pro subscription, at the end of the current billing
     * period (grace-period cancel — Cashier's cancel() default). users.plan
     * only flips back to free once the subscription.canceled webhook lands,
     * not synchronously here.
     */
    public function cancel(Request $request): RedirectResponse
    {
        $request->user()->subscription()?->cancel();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Your subscription will end at the close of the current billing period.')]);

        return back();
    }

    /**
     * @return array{id: ?string, formatted: ?string, currency: ?string}|null
     */
    protected function presentPrice(?PricePreview $preview): ?array
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
