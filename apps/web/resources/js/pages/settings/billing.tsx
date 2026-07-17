import { Badge, Button, Callout, Heading, SurfacePanel } from '@equalsite/ui';
import { Head, router, useHttp } from '@inertiajs/react';
import { toast } from 'sonner';
import { humanReadableDateTime } from '@/lib/utils';
import { cancel, checkout, edit } from '@/routes/billing';

type Plan = 'free' | 'pro';

type NextPayment = {
    amount: string;
    currency: string;
    date: string;
} | null;

type Subscription = {
    status: string;
    onGracePeriod: boolean;
    endsAt: string | null;
    interval: Interval | null;
    nextPayment: NextPayment;
} | null;

type Price = {
    id: string;
    formatted: string;
    currency: string;
} | null;

type BillingProps = {
    plan: Plan;
    subscription: Subscription;
    prices: {
        monthly: Price;
        yearly: Price;
    };
};

type CheckoutResponse = {
    customerId: string;
    priceId: string;
};

type Interval = 'monthly' | 'yearly';

function openPaddleCheckout({ customerId, priceId }: CheckoutResponse) {
    if (!window.Paddle) {
        toast.error(
            'Checkout is unavailable right now. Please refresh and try again.',
        );
        return;
    }

    window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { id: customerId },
    });
}

function CurrentPlanBadge() {
    return <Badge variant="secondary">Current plan</Badge>;
}

function FreePlanCard({ isCurrent }: { isCurrent: boolean }) {
    return (
        <SurfacePanel padding="sm">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Free</p>
                {isCurrent && <CurrentPlanBadge />}
            </div>
            <p className="mt-1 text-2xl font-semibold tabular-nums">$0</p>
        </SurfacePanel>
    );
}

function SubscribeCard({
    interval,
    price,
    label,
    isCurrent,
}: {
    interval: Interval;
    price: Price;
    label: string;
    isCurrent: boolean;
}) {
    const { submit, processing } = useHttp<
        { interval: Interval },
        CheckoutResponse
    >({ interval });

    if (price === null) {
        return (
            <SurfacePanel padding="sm">
                <p className="text-sm font-medium">{label}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    pricing unavailable right now — try again shortly
                </p>
            </SurfacePanel>
        );
    }

    const handleSubscribe = () => {
        submit(checkout(), {
            onSuccess: openPaddleCheckout,
            onError: () =>
                toast.error('Unable to start checkout. Please try again.'),
        });
    };

    return (
        <SurfacePanel padding="sm">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{label}</p>
                {isCurrent && <CurrentPlanBadge />}
            </div>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
                {price.formatted}
            </p>
            {!isCurrent && (
                <Button
                    className="mt-4 w-full"
                    size="sm"
                    onClick={handleSubscribe}
                    disabled={processing}
                >
                    Subscribe
                </Button>
            )}
        </SurfacePanel>
    );
}

function CancelSubscriptionButton() {
    const handleCancel = () => {
        if (
            !window.confirm(
                'Cancel your Pro subscription? You will keep Pro access until the end of the current billing period.',
            )
        ) {
            return;
        }

        router.delete(cancel().url);
    };

    return (
        <Button variant="destructive" size="sm" onClick={handleCancel}>
            Cancel subscription
        </Button>
    );
}

export default function Billing({ plan, subscription, prices }: BillingProps) {
    const currentInterval =
        plan === 'pro' ? (subscription?.interval ?? null) : null;

    return (
        <>
            <Head title="Billing settings" />

            <h1 className="sr-only">Billing settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Plan"
                    description="Manage your Equalsite subscription"
                />

                {plan === 'pro' ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Badge>Pro</Badge>
                            {subscription && (
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    status: {subscription.status}
                                </span>
                            )}
                        </div>

                        {subscription?.onGracePeriod ? (
                            <Callout
                                variant="warning"
                                title="Subscription ending"
                            >
                                Your Pro access remains active until{' '}
                                {humanReadableDateTime(
                                    subscription.endsAt ?? undefined,
                                )}
                                , after which you'll move to the Free plan.
                            </Callout>
                        ) : (
                            <>
                                {subscription?.nextPayment && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Next payment:{' '}
                                        {subscription.nextPayment.amount} due{' '}
                                        {humanReadableDateTime(
                                            subscription.nextPayment.date,
                                        )}
                                    </p>
                                )}
                                <CancelSubscriptionButton />
                            </>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        You're on the Free plan. Upgrade to Pro for higher scan
                        limits, faster queue priority, and longer history
                        retention.
                    </p>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                    <FreePlanCard isCurrent={plan === 'free'} />
                    <SubscribeCard
                        interval="monthly"
                        price={prices.monthly}
                        label="Monthly"
                        isCurrent={currentInterval === 'monthly'}
                    />
                    <SubscribeCard
                        interval="yearly"
                        price={prices.yearly}
                        label="Yearly"
                        isCurrent={currentInterval === 'yearly'}
                    />
                </div>
            </div>
        </>
    );
}

Billing.layout = {
    breadcrumbs: [
        {
            title: 'Billing settings',
            href: edit(),
        },
    ],
};
