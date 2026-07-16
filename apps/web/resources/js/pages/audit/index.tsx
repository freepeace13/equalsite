import { InputError } from '@equalsite/ui';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PublicHeader } from '@/components/public-header';
import { AuthModal } from '@/components/auth/auth-modal';
import { store } from '@/routes/audit';
import { CrawlDepth } from '@/components/form/crawl-depth';
import {
    ArrowRightIcon,
    Button,
    Collapsible,
    CollapsibleChevron,
    CollapsibleContent,
    CollapsibleTrigger,
    type IconProps,
    SearchIcon,
    SlidersIcon,
    UsersIcon,
    ZapIcon,
} from '@equalsite/ui';
import {
    type ChangeEventHandler,
    type ComponentType,
    type SubmitEventHandler,
    useState,
} from 'react';
import { EnqueueStrategy } from '@/components/form/enqueue-strategy';
import { PagePattern } from '@/components/form/page-pattern';
import { clearPendingAudit, savePendingAudit } from '@/lib/pending-audit';

const NAV_LINKS = [
    { label: 'How it works', href: '#how' },
    { label: 'Pricing', href: '#pricing' },
];

const CRAWL_DEPTHS = [
    { label: 'shallow', value: '1' },
    { label: 'standard', value: '3' },
    { label: 'deep', value: '5' },
];

const FEATURE_CARDS: {
    title: string;
    description: string;
    Icon: ComponentType<IconProps>;
}[] = [
        {
            title: 'real browser scans',
            description:
                'crawls your site like a visitor would, running axe-core on every page.',
            Icon: SearchIcon,
        },
        {
            title: "grouped by who's affected",
            description:
                'not raw rule IDs — keyboard, screen reader, and low-vision users.',
            Icon: UsersIcon,
        },
        {
            title: 'fix priority, not a wall of text',
            description:
                'quick wins vs structural work, ranked first in every list.',
            Icon: ZapIcon,
        },
    ];

function AdvancedSettings({
    form,
}: {
    form: ReturnType<
        typeof useForm<{
            url: string;
            crawlDepth: string;
            include: string;
            exclude: string;
            sameDomain: boolean;
        }>
    >;
}) {
    return (
        <Collapsible className="mx-auto mt-6 max-w-md overflow-hidden rounded-lg border border-slate-200 text-left dark:border-slate-800">
            <CollapsibleTrigger>
                <SlidersIcon className="text-slate-500 dark:text-slate-400" />
                <span className="flex-1 text-sm font-medium">
                    advanced settings
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                    optional
                </span>
                <CollapsibleChevron />
            </CollapsibleTrigger>

            <CollapsibleContent className="border-t border-slate-200 px-4 pt-1 pb-4 dark:border-slate-800">
                <CrawlDepth
                    options={CRAWL_DEPTHS}
                    value={form.data.crawlDepth}
                    onValueChange={(value) => {
                        form.setData('crawlDepth', value);
                    }}
                />
                <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                    standard follows links up to 3 levels from the homepage.
                </p>
                <PagePattern
                    label="include only pages matching"
                    id="include-patterns"
                    placeholder="/blog/*, /products/*"
                    name="include"
                    value={form.data.include}
                    onValueChange={(value) => form.setData('include', value)}
                />

                <PagePattern
                    label="exclude pages matching"
                    id="exclude-patterns"
                    placeholder="/admin/*, /account/*"
                    name="exclude"
                    value={form.data.exclude}
                    onValueChange={(value) => form.setData('exclude', value)}
                />
                <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                    leave blank to crawl your whole site, up to 25 pages.
                </p>
                <EnqueueStrategy
                    value={form.data.sameDomain}
                    onValueChange={(value) => {
                        form.setData('sameDomain', value);
                    }}
                />
            </CollapsibleContent>
        </Collapsible>
    );
}

type Props = {
    canRegister: boolean;
    canResetPassword: boolean;
};

export default function Index({ canRegister, canResetPassword }: Props) {
    const { auth } = usePage().props;
    const form = useForm({
        url: '',
        crawlDepth: '3',
        include: '',
        exclude: '',
        sameDomain: true,
    });
    const [authModalOpen, setAuthModalOpen] = useState(false);

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        form.setData('url', e.target.value);
    };

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        let value = form.data.url.trim();
        if (value && !/^https?:\/\//i.test(value)) {
            value = 'https://' + value;
        }
        form.setData('url', value);
        if (!value) {
            return;
        }

        if (!auth.user) {
            savePendingAudit({
                url: value,
                crawlDepth: form.data.crawlDepth,
                include: form.data.include,
                exclude: form.data.exclude,
                sameDomain: form.data.sameDomain,
            });
            setAuthModalOpen(true);
            return;
        }

        form.submit(store());
    };

    return (
        <>
            <Head title="Free WCAG accessibility audit" />

            <PublicHeader
                navLinks={NAV_LINKS}
                auth={{ canRegister, canResetPassword }}
            />

            <main>
                {/* Hero */}
                <section className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center">
                    <h1 className="mx-auto max-w-xl font-display text-3xl leading-tight font-medium sm:text-4xl">
                        see your site the way everyone does
                    </h1>
                    <p className="mx-auto mt-4 max-w-md text-slate-600 dark:text-slate-400">
                        free WCAG 2.2 AA scan. enter a URL, get a plain-english
                        accessibility report in minutes.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="mx-auto mt-8 flex max-w-md gap-2"
                    >
                        <label htmlFor="url" className="sr-only">
                            Website URL
                        </label>
                        <input
                            id="url"
                            name="url"
                            type="text"
                            inputMode="url"
                            required
                            autoFocus
                            placeholder="https://yoursite.com"
                            value={form.data.url}
                            onChange={handleChange}
                            disabled={form.processing}
                            className="h-11 flex-1 rounded-lg border border-slate-300 bg-white px-4 text-sm placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                        />
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="h-11 px-5"
                        >
                            {form.processing ? 'starting…' : 'run free audit'}
                            {!form.processing && <ArrowRightIcon />}
                        </Button>
                    </form>

                    {form.errors.url && (
                        <div className="mx-auto mt-2 max-w-md text-left">
                            <InputError message={form.errors.url} />
                        </div>
                    )}

                    <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                        scans up to 25 pages · results in ~2 minutes
                    </p>

                    <AdvancedSettings form={form} />
                </section>

                {/* Feature cards */}
                <section
                    id="how"
                    className="border-t border-slate-200 dark:border-slate-800"
                >
                    <div className="mx-auto grid max-w-5xl divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-slate-800">
                        {FEATURE_CARDS.map(({ title, description, Icon }) => (
                            <div key={title} className="p-8">
                                <Icon className="text-indigo-600 dark:text-indigo-400" />
                                <h3 className="mt-3 mb-1 text-sm font-medium">
                                    {title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <AuthModal
                open={authModalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        clearPendingAudit();
                    }
                    setAuthModalOpen(open);
                }}
                defaultTab="register"
                canRegister={canRegister}
                canResetPassword={canResetPassword}
                description="log in or create an account to run this audit — we'll pick up right where you left off."
            />

            <footer className="mx-auto max-w-5xl px-6 py-10 text-xs text-slate-400 dark:text-slate-600">
                equalsite — an open accessibility diagnostic.{' '}
                <a
                    href="https://github.com/freepeace13/equalsite"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-slate-600 dark:hover:text-slate-400"
                >
                    source on GitHub
                </a>
            </footer>
        </>
    );
}
