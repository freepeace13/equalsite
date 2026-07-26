import { Head, useForm, usePage } from '@inertiajs/react';
import { AdvancedSettings } from '@/components/form/advance-settings';
import { resolveIsPro } from '@/lib/plan';
import { PublicHeader } from '@/components/public-header';
import { AuthModal } from '@/components/auth-modal';
import { store } from '@/routes/audit';
import {
    ArrowRightIcon,
    Button,
    Checkbox,
    type IconProps,
    InputError,
    Label,
    SearchIcon,
    UsersIcon,
    ZapIcon,
} from '@equalsite/ui';
import {
    type ChangeEventHandler,
    type ComponentType,
    type SubmitEventHandler,
    useState,
} from 'react';
import { clearPendingAudit, savePendingAudit } from '@/lib/pending-audit';

const NAV_LINKS = [
    { label: 'How it works', href: '#how' },
    { label: 'Pricing', href: '#pricing' },
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

type Props = {
    canRegister: boolean;
    canResetPassword: boolean;
};

export default function Welcome({ canRegister, canResetPassword }: Props) {
    const { auth, monetizationEnabled } = usePage().props;
    const isPro = resolveIsPro(auth.user, monetizationEnabled);
    const form = useForm({
        url: '',
        crawlDepth: isPro ? '3' : '1',
        include: '',
        exclude: '',
        sameDomain: true,
        confirmedAuthorized: false,
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
                confirmedAuthorized: form.data.confirmedAuthorized,
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

                    <div className="mx-auto mt-3 flex max-w-md items-start gap-2 text-left">
                        <Checkbox
                            id="confirmedAuthorized"
                            checked={form.data.confirmedAuthorized}
                            onCheckedChange={(checked) =>
                                form.setData(
                                    'confirmedAuthorized',
                                    checked === true,
                                )
                            }
                            className="mt-0.5"
                        />
                        <Label
                            htmlFor="confirmedAuthorized"
                            className="text-xs font-normal text-slate-500 dark:text-slate-400"
                        >
                            I confirm I own this site or am authorized to audit
                            it.
                        </Label>
                    </div>
                    {form.errors.confirmedAuthorized && (
                        <div className="mx-auto mt-1 max-w-md text-left">
                            <InputError
                                message={form.errors.confirmedAuthorized}
                            />
                        </div>
                    )}

                    <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                        scans up to 25 pages · results in ~2 minutes
                    </p>

                    <AdvancedSettings form={form} isPro={isPro} />
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
                {' · '}
                <a
                    href="/faq"
                    className="underline hover:text-slate-600 dark:hover:text-slate-400"
                >
                    FAQ
                </a>
                {' · '}
                <a
                    href="/contact"
                    className="underline hover:text-slate-600 dark:hover:text-slate-400"
                >
                    Contact
                </a>
                {' · '}
                <a
                    href="/terms"
                    className="underline hover:text-slate-600 dark:hover:text-slate-400"
                >
                    Terms
                </a>
                {' · '}
                <a
                    href="/privacy"
                    className="underline hover:text-slate-600 dark:hover:text-slate-400"
                >
                    Privacy
                </a>
                {' · '}
                <a
                    href="/refund-policy"
                    className="underline hover:text-slate-600 dark:hover:text-slate-400"
                >
                    Refund Policy
                </a>
            </footer>
        </>
    );
}
