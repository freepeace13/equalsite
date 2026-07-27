import { Head } from '@inertiajs/react';
import { Heading } from '@equalsite/ui';

type TermsProps = {
    lastUpdated: string;
};

export default function Terms({ lastUpdated }: TermsProps) {
    return (
        <>
            <Head title="Terms of Service" />

            <div className="bg-primary text-primary-foreground">
                <div className="mx-auto max-w-5xl px-6 pt-8 pb-2 text-center">
                    <Heading
                        title="Terms of Service"
                        description={`Last updated ${lastUpdated}`}
                    />
                </div>
            </div>

            <main className="mx-auto max-w-2xl px-6 pb-16">
                <div className="mt-8 space-y-8 text-sm text-slate-600 dark:text-slate-400">
                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            1. Acceptance of terms
                        </h2>
                        <p className="mt-2">
                            By creating an account or otherwise using Equalsite
                            (the "Service"), you agree to be bound by these
                            Terms of Service. If you don't agree, don't use the
                            Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            2. Description of service
                        </h2>
                        <p className="mt-2">
                            Equalsite is an automated web accessibility auditing
                            tool. You submit a URL, we crawl the pages we can
                            reach with a headless browser, run the axe-core WCAG
                            checker against each page, and return a scored,
                            remediation-oriented report. Automated scanning
                            surfaces a meaningful subset of accessibility issues
                            — it is not a substitute for manual testing or a
                            legal compliance guarantee.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            3. Account registration &amp; responsibilities
                        </h2>
                        <p className="mt-2">
                            You must provide accurate registration information
                            and keep your credentials confidential. You're
                            responsible for all activity that happens under your
                            account.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            4. Acceptable use — scanning authorization
                        </h2>
                        <p className="mt-2">
                            You may only submit URLs for sites you own or are
                            authorized to scan. Equalsite reserves the right to
                            refuse, pause, or block a scan of any URL, and to
                            suspend or terminate accounts, where we reasonably
                            believe a submitted target is unauthorized or the
                            scanning activity is abusive.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            5. Plans, billing, and payment
                        </h2>
                        <p className="mt-2">
                            Paid plans are billed on a recurring basis through
                            our payment processor, Paddle. See our{' '}
                            <a href="/refund-policy" className="underline">
                                Refund/Cancellation Policy
                            </a>{' '}
                            for how billing periods, cancellation, and refunds
                            work.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            6. Plan limits
                        </h2>
                        <p className="mt-2">
                            Free and Pro plans carry different scan, site, and
                            history limits. Current limits are published
                            in-product and may change from time to time; changes
                            won't retroactively reduce access you've already
                            paid for during a billing period.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            7. Data ownership
                        </h2>
                        <p className="mt-2">
                            You own the content of the sites you scan and the
                            audit results generated from them. See our{' '}
                            <a href="/privacy" className="underline">
                                Privacy Policy
                            </a>{' '}
                            for how we handle that data.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            8. Intellectual property
                        </h2>
                        <p className="mt-2">
                            The Equalsite name, product, and underlying software
                            are our intellectual property. These Terms don't
                            grant you any rights to our trademarks or branding
                            beyond what's needed to use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            9. Service availability
                        </h2>
                        <p className="mt-2">
                            We aim for high availability but don't guarantee the
                            Service will be uninterrupted or error-free.
                            Scheduled maintenance or upstream outages may affect
                            crawl and reporting availability.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            10. Limitation of liability
                        </h2>
                        <p className="mt-2">
                            To the maximum extent permitted by law, Equalsite is
                            not liable for indirect, incidental, or
                            consequential damages arising from your use of the
                            Service, including reliance on audit results for
                            legal compliance decisions.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            11. Termination
                        </h2>
                        <p className="mt-2">
                            You may stop using the Service and delete your
                            account at any time. We may suspend or terminate
                            your account for violation of these Terms, including
                            unauthorized scanning under Section 4.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            12. Governing law
                        </h2>
                        <p className="mt-2">
                            These Terms are governed by the laws of the
                            jurisdiction in which Equalsite is incorporated,
                            without regard to conflict of law principles.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            13. Changes to these terms
                        </h2>
                        <p className="mt-2">
                            We may update these Terms from time to time. We'll
                            update the "Last updated" date above when we do;
                            continued use of the Service after a change
                            constitutes acceptance of the revised Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            14. Contact
                        </h2>
                        <p className="mt-2">
                            Questions about these Terms? Reach us at{' '}
                            <a
                                href="mailto:support@equalsite.app"
                                className="underline"
                            >
                                support@equalsite.app
                            </a>{' '}
                            or via our{' '}
                            <a href="/contact" className="underline">
                                contact page
                            </a>
                            .
                        </p>
                    </section>
                </div>
            </main>
        </>
    );
}
