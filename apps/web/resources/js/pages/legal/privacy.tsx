import { Head } from '@inertiajs/react';
import { PublicHeader } from '@/components/public-header';
import PublicLayout from '@/layouts/public-layout';
import { Heading } from '@equalsite/ui';

type PrivacyProps = {
    lastUpdated: string;
};

export default function Privacy({ lastUpdated }: PrivacyProps) {
    return (
        <PublicLayout>
            <Head title="Privacy Policy" />
            <PublicHeader />

            <main className="mx-auto max-w-2xl px-6 py-16">
                <Heading
                    title="Privacy Policy"
                    description={`Last updated ${lastUpdated}`}
                />

                <div className="mt-8 space-y-8 text-sm text-slate-600 dark:text-slate-400">
                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            1. What we collect
                        </h2>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                            <li>
                                Account data — your name, email address, and
                                password hash, collected when you register.
                            </li>
                            <li>
                                Payment data — handled by our Merchant of
                                Record, Paddle. Equalsite never sees or stores
                                your card details.
                            </li>
                            <li>
                                Audited site content — pages we crawl on your
                                behalf, their DOM structure, and the axe-core
                                violation data we extract from them.
                            </li>
                            <li>
                                Usage data — if we add product analytics in the
                                future, this section will be updated before that
                                data is collected.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            2. How we use it
                        </h2>
                        <p className="mt-2">
                            We use your data to deliver the Service — running
                            scans, generating reports, billing your plan, and
                            responding to support requests. We don't sell your
                            data to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            3. Sub-processors
                        </h2>
                        <p className="mt-2">
                            We share data with a small number of vendors who
                            help us run the Service: Paddle (payment processing,
                            as our Merchant of Record) and our
                            infrastructure/hosting provider. If we add analytics
                            or other processors in the future, we'll list them
                            here.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            4. Data retention
                        </h2>
                        <p className="mt-2">
                            We retain your account data for as long as your
                            account is active. Audit history visible in-product
                            follows your plan's retention window; older audits
                            may still exist in storage beyond that window today.
                            If you'd like your audit history fully deleted
                            rather than just hidden, contact us at{' '}
                            <a
                                href="mailto:support@equalsite.app"
                                className="underline"
                            >
                                support@equalsite.app
                            </a>
                            .
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            5. Your rights
                        </h2>
                        <p className="mt-2">
                            Depending on where you live, you may have the right
                            to access, export, correct, or delete your personal
                            data. Contact us at{' '}
                            <a
                                href="mailto:support@equalsite.app"
                                className="underline"
                            >
                                support@equalsite.app
                            </a>{' '}
                            to exercise these rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            6. Third-party content in scanned pages
                        </h2>
                        <p className="mt-2">
                            The pages you ask us to scan may incidentally
                            contain personal data about people who aren't
                            Equalsite users — for example, a company's own
                            customer data appearing on a crawled page. For that
                            incidental content, we act only as a processor on
                            your behalf, not as a controller.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            7. Cookies
                        </h2>
                        <p className="mt-2">
                            We use the minimum cookies necessary to keep you
                            signed in and to protect the Service against abuse.
                            We'll publish a dedicated cookie notice with more
                            detail as the Service grows.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            8. Security
                        </h2>
                        <p className="mt-2">
                            We use industry-standard measures — encryption in
                            transit, access controls, and secure credential
                            storage — to protect your data. No system is
                            perfectly secure, and we can't guarantee absolute
                            security.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            9. Children's privacy
                        </h2>
                        <p className="mt-2">
                            The Service isn't directed at children, and we don't
                            knowingly collect personal data from anyone under
                            16.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            10. International data transfers
                        </h2>
                        <p className="mt-2">
                            Your data may be processed in a country other than
                            the one you live in. Where required, we rely on
                            appropriate safeguards for those transfers.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            11. Changes to this policy
                        </h2>
                        <p className="mt-2">
                            We may update this Privacy Policy from time to time.
                            We'll update the "Last updated" date above whenever
                            we do.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            12. Contact
                        </h2>
                        <p className="mt-2">
                            Questions about this policy, or want to exercise a
                            data right? Email{' '}
                            <a
                                href="mailto:support@equalsite.app"
                                className="underline"
                            >
                                support@equalsite.app
                            </a>{' '}
                            or use our{' '}
                            <a href="/contact" className="underline">
                                contact page
                            </a>
                            .
                        </p>
                    </section>
                </div>
            </main>
        </PublicLayout>
    );
}
