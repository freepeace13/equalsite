import { Head } from '@inertiajs/react';
import { Heading } from '@equalsite/ui';

type Props = {
    lastUpdated: string;
    contactEmail: string;
};

export default function Security({ lastUpdated, contactEmail }: Props) {
    return (
        <>
            <Head title="Security" />

            <div className="bg-primary text-primary-foreground">
                <div className="mx-auto max-w-5xl px-6 pt-8 pb-2 text-center">
                    <Heading
                        title="Security"
                        description="Responsible disclosure is welcome — here's how to reach us."
                    />
                </div>
            </div>

            <main className="mx-auto max-w-2xl px-6 pb-16">
                <div className="mt-8 space-y-6 text-sm text-slate-600 dark:text-slate-400">
                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            Reporting a vulnerability
                        </h2>
                        <p className="mt-2">
                            If you believe you've found a security vulnerability
                            in Equalsite, please email{' '}
                            <a
                                href={`mailto:${contactEmail}`}
                                className="underline"
                            >
                                {contactEmail}
                            </a>{' '}
                            with details and steps to reproduce. We aim to
                            acknowledge reports within 3 business days.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            Scope
                        </h2>
                        <p className="mt-2">
                            This covers the Equalsite web application and the
                            crawler service that powers it. We don't currently
                            run a paid bug-bounty program, but we do read and
                            respond to every report.
                        </p>
                    </section>

                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        Last updated {lastUpdated}. Machine-readable contact
                        info is also published at{' '}
                        <a
                            href="/.well-known/security.txt"
                            className="underline"
                        >
                            /.well-known/security.txt
                        </a>
                        .
                    </p>
                </div>
            </main>
        </>
    );
}
