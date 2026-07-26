import { Head } from '@inertiajs/react';
import { PublicHeader } from '@/components/public-header';
import PublicLayout from '@/layouts/public-layout';
import { Heading } from '@equalsite/ui';

type RefundPolicyProps = {
    lastUpdated: string;
};

export default function RefundPolicy({ lastUpdated }: RefundPolicyProps) {
    return (
        <PublicLayout>
            <Head title="Refund & Cancellation Policy" />
            <PublicHeader />

            <main className="mx-auto max-w-2xl px-6 py-16">
                <Heading
                    title="Refund & Cancellation Policy"
                    description={`Last updated ${lastUpdated}`}
                />

                <div className="mt-8 space-y-8 text-sm text-slate-600 dark:text-slate-400">
                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            1. Billing cycle
                        </h2>
                        <p className="mt-2">
                            Pro plan subscriptions renew automatically on a
                            monthly or yearly cycle, depending on the interval
                            you chose at checkout. Pricing for each interval is
                            shown before you confirm the subscription.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            2. Cancellation
                        </h2>
                        <p className="mt-2">
                            You can cancel at any time from Settings → Billing.
                            When you cancel, you keep Pro access through the end
                            of the billing period you already paid for — we
                            don't refund the unused portion of the current
                            period.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            3. Refund eligibility
                        </h2>
                        <p className="mt-2">
                            Refunds are handled through Paddle, our Merchant of
                            Record, and are subject to Paddle's own buyer terms
                            in addition to this policy. If you believe you were
                            charged in error, contact us within 14 days of the
                            charge and we'll review your request.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            4. How to request a refund
                        </h2>
                        <p className="mt-2">
                            Email{' '}
                            <a
                                href="mailto:support@equalsite.app"
                                className="underline"
                            >
                                support@equalsite.app
                            </a>{' '}
                            or use our{' '}
                            <a href="/contact" className="underline">
                                contact page
                            </a>{' '}
                            with your account email and the charge in question.
                            We aim to respond within 2 business days.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            5. Exceptions
                        </h2>
                        <p className="mt-2">
                            We don't issue refunds for charges tied to an
                            account terminated for violating our{' '}
                            <a href="/terms" className="underline">
                                Terms of Service
                            </a>
                            , including unauthorized scanning.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            6. Failed payments
                        </h2>
                        <p className="mt-2">
                            If a renewal charge fails, we'll retry it
                            automatically and notify you by email. If payment
                            can't be collected after retries are exhausted, your
                            account moves to the Free plan until you update your
                            payment details and resubscribe.
                        </p>
                    </section>
                </div>
            </main>
        </PublicLayout>
    );
}
