<?php

namespace App\Http\Controllers\Settings;

use App\Actions\Billing\EnsurePaddleCustomer;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\BillingCheckoutRequest;
use App\Support\Billing\ResolvePlanPrices;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Paddle\Subscription;
use Throwable;

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
                'interval' => $this->resolveInterval($subscription, $prices),
                'nextPayment' => $this->resolveNextPayment($subscription),
            ] : null,
            'prices' => [
                'monthly' => $prices['monthly'],
                'yearly' => $prices['yearly'],
            ],
        ]);
    }

    /**
     * Which of the two configured prices the subscription is currently on,
     * so the frontend can mark the matching plan card as the current one.
     *
     * @param  array{monthly: ?array{id: string, formatted: string, currency: string}, yearly: ?array{id: string, formatted: string, currency: string}}  $prices
     */
    protected function resolveInterval(Subscription $subscription, array $prices): ?string
    {
        if ($prices['monthly'] && $subscription->hasPrice($prices['monthly']['id'])) {
            return 'monthly';
        }

        if ($prices['yearly'] && $subscription->hasPrice($prices['yearly']['id'])) {
            return 'yearly';
        }

        return null;
    }

    /**
     * The subscription's next billing date/amount, for display alongside its
     * status. A live Paddle API call (Cashier's Subscription::nextPayment()),
     * so failures are swallowed the same defensive way as ResolvePlanPrices —
     * a slow/down Paddle API should degrade the details shown, not break the
     * billing page. A cancelled subscription (on its grace period) has no
     * future payment to show.
     *
     * @return array{amount: string, currency: string, date: string}|null
     */
    protected function resolveNextPayment(Subscription $subscription): ?array
    {
        if ($subscription->onGracePeriod()) {
            return null;
        }

        try {
            $payment = $subscription->nextPayment();
        } catch (Throwable $e) {
            Log::warning('Unable to resolve the next Paddle payment.', ['exception' => $e]);

            return null;
        }

        if ($payment === null) {
            return null;
        }

        return [
            'amount' => $payment->amount(),
            'currency' => $payment->currency()->getCode(),
            'date' => $payment->date()->toIso8601String(),
        ];
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
            'priceId' => $preview['id'],
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
}
