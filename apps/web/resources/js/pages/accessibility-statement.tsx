import { Head } from '@inertiajs/react';
import { CheckCircleIcon, Heading } from '@equalsite/ui';

type Props = {
    lastUpdated: string;
    contactEmail: string;
};

export default function AccessibilityStatement({
    lastUpdated,
    contactEmail,
}: Props) {
    return (
        <>
            <Head title="Accessibility statement" />

            <div className="bg-primary text-primary-foreground">
                <div className="mx-auto max-w-5xl px-6 pt-8 pb-2 text-center">
                    <Heading
                        title="Accessibility statement"
                        description="We hold this site to the same bar we check yours against."
                    />
                </div>
            </div>

            <main className="mx-auto max-w-2xl px-6 pb-16">
                <div className="mt-8 space-y-6 text-sm text-slate-600 dark:text-slate-400">
                    <section className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                        <CheckCircleIcon
                            className="mt-0.5 size-4 shrink-0 text-emerald-600"
                            aria-hidden="true"
                        />
                        <p>
                            equalsite.app targets{' '}
                            <strong className="font-medium text-slate-900 dark:text-slate-100">
                                WCAG 2.2 Level AA
                            </strong>{' '}
                            conformance — the same standard every audit we run
                            checks your site against.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            How we test this site
                        </h2>
                        <p className="mt-2">
                            We run axe-core against every page we ship, the
                            same automated engine your audits use, and pair it
                            with manual keyboard and screen-reader checks
                            (NVDA and VoiceOver) before release. Automated
                            tools catch roughly a third to half of real
                            issues, which is exactly why manual review isn't
                            optional here.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            Known limitations
                        </h2>
                        <p className="mt-2">
                            Some report visualizations (the score trend chart
                            and screenshot annotations) rely on color to
                            highlight severity in addition to labels and
                            icons — we're working through the remaining
                            contrast edge cases in dark mode. If you hit a
                            limitation that isn't listed here, tell us; that's
                            how this list gets accurate.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-slate-900 dark:text-slate-100">
                            Report a barrier
                        </h2>
                        <p className="mt-2">
                            If something on this site is hard to use with a
                            keyboard, screen reader, or any other assistive
                            technology, email{' '}
                            <a
                                href={`mailto:${contactEmail}`}
                                className="underline"
                            >
                                {contactEmail}
                            </a>{' '}
                            with the page URL and what happened. We treat
                            these the same way we treat a security report —
                            triaged and answered, not filed away.
                        </p>
                    </section>

                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        Last updated {lastUpdated}.
                    </p>
                </div>
            </main>
        </>
    );
}
