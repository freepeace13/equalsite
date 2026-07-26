import { Head } from '@inertiajs/react';
import { PublicHeader } from '@/components/public-header';
import PublicLayout from '@/layouts/public-layout';
import { Heading } from '@equalsite/ui';

type FaqItem = {
    question: string;
    answer: React.ReactNode;
};

type FaqGroup = {
    title: string;
    items: FaqItem[];
};

const FAQ_GROUPS: FaqGroup[] = [
    {
        title: 'About the product',
        items: [
            {
                question: 'What does an audit check?',
                answer: 'Equalsite crawls your site with a real browser and runs axe-core, the industry-standard automated WCAG 2.2 checker, on every page it finds.',
            },
            {
                question: 'How long does a scan take?',
                answer: 'Most scans finish within a few minutes, depending on how many pages your site has and your plan’s crawl depth.',
            },
        ],
    },
    {
        title: 'Billing',
        items: [
            {
                question: 'What’s the difference between Free and Pro?',
                answer: 'Free covers a single site with a shallow crawl and a standard queue. Pro unlocks multiple sites, deeper crawls, and unlimited re-scans.',
            },
            {
                question: 'How do I cancel my subscription?',
                answer: 'From Settings → Billing, at any time — your plan stays active until the end of the current billing period.',
            },
        ],
    },
    {
        title: 'Trust & support',
        items: [
            {
                question: 'Can I scan any website?',
                answer: 'Only websites you own or are authorized to audit.',
            },
            {
                question: 'How do I contact support?',
                answer: (
                    <>
                        Reach us any time from our{' '}
                        <a href="/contact" className="underline">
                            contact page
                        </a>
                        .
                    </>
                ),
            },
        ],
    },
];

export default function Faq() {
    return (
        <PublicLayout>
            <Head title="Frequently asked questions" />
            <PublicHeader />

            <main className="mx-auto max-w-2xl px-6 py-16">
                <Heading
                    title="Frequently asked questions"
                    description="Can't find what you're looking for? Reach out on our contact page."
                />

                <div className="mt-8 space-y-10">
                    {FAQ_GROUPS.map((group) => (
                        <section key={group.title}>
                            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {group.title}
                            </h2>
                            <div className="mt-4 space-y-6">
                                {group.items.map((item) => (
                                    <div key={item.question}>
                                        <h3 className="font-medium">
                                            {item.question}
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            {item.answer}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </PublicLayout>
    );
}
