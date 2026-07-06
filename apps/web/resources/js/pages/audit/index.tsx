import { Head, useForm } from '@inertiajs/react';
import { PublicHeader } from '@/components/public-header';
import { store } from '@/routes/audit';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    type ChangeEventHandler,
    type FormEventHandler,
    useState,
} from 'react';

const NAV_LINKS = [
    { label: 'How it works', href: '#how' },
    { label: 'Docs', href: '#' },
    {
        label: 'GitHub',
        href: 'https://github.com/freepeace13/equalsite',
        external: true,
    },
];

const CRAWL_DEPTHS = [
    { label: 'shallow', value: '1' },
    { label: 'standard', value: '3' },
    { label: 'deep', value: '5' },
] as const;

export default function Index() {
    const form = useForm({
        url: '',
        crawlDepth: '3',
        include: '',
        exclude: '',
        sameDomain: true,
    });
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [modalEmail, setModalEmail] = useState('');

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        form.setData('url', e.target.value);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        let value = form.data.url.trim();
        if (value && !/^https?:\/\//i.test(value)) {
            value = 'https://' + value;
        }
        form.setData('url', value);
        if (!value) {
            return;
        }
        setShowEmailModal(true);
    };

    const submitAudit = () => {
        setShowEmailModal(false);
        form.submit(store());
    };

    return (
        <>
            <Head title="Free WCAG accessibility audit" />

            <PublicHeader navLinks={NAV_LINKS} />

            <main>
                {/* Hero */}
                <section className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center">
                    <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <rect x="5" y="11" width="14" height="9" rx="2" />
                            <path d="M8 11V7a4 4 0 018 0v4" />
                        </svg>
                        no sign up needed
                    </span>

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
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="flex h-11 items-center gap-1.5 rounded-lg bg-indigo-700 px-5 text-sm font-medium whitespace-nowrap text-white hover:bg-indigo-800 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-none disabled:opacity-60 dark:focus:ring-offset-slate-950"
                        >
                            {form.processing ? 'starting…' : 'run free audit'}
                            {!form.processing && (
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                >
                                    <path d="M5 12h14M13 6l6 6-6 6" />
                                </svg>
                            )}
                        </button>
                    </form>

                    {form.errors.url && (
                        <div className="mx-auto mt-2 max-w-md text-left">
                            <InputError message={form.errors.url} />
                        </div>
                    )}

                    <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                        scans up to 25 pages · results in ~2 minutes
                    </p>

                    {/* Advanced settings */}
                    <div className="mx-auto mt-6 max-w-md overflow-hidden rounded-lg border border-slate-200 text-left dark:border-slate-800">
                        <button
                            type="button"
                            aria-expanded={advancedOpen}
                            aria-controls="advanced-panel"
                            onClick={() => setAdvancedOpen((open) => !open)}
                            className="flex w-full items-center gap-2.5 px-4 py-3 text-left hover:bg-slate-50 focus:ring-2 focus:ring-indigo-600 focus:outline-none focus:ring-inset dark:hover:bg-slate-800/40"
                        >
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="shrink-0 text-slate-500 dark:text-slate-400"
                            >
                                <line x1="4" y1="21" x2="4" y2="14" />
                                <line x1="4" y1="10" x2="4" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12" y2="3" />
                                <line x1="20" y1="21" x2="20" y2="16" />
                                <line x1="20" y1="12" x2="20" y2="3" />
                                <line x1="1" y1="14" x2="7" y2="14" />
                                <line x1="9" y1="8" x2="15" y2="8" />
                                <line x1="17" y1="16" x2="23" y2="16" />
                            </svg>
                            <span className="flex-1 text-sm font-medium">
                                advanced settings
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                optional
                            </span>
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={`shrink-0 text-slate-400 transition-transform duration-200 ${advancedOpen ? 'rotate-180' : ''}`}
                            >
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>

                        <div
                            id="advanced-panel"
                            className={`grid transition-[grid-template-rows] duration-200 ease-out ${advancedOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                        >
                            <div className="overflow-hidden">
                                <div className="border-t border-slate-200 px-4 pt-1 pb-4 dark:border-slate-800">
                                    <label className="mt-4 mb-2 block text-xs font-medium">
                                        crawl depth
                                    </label>
                                    <div
                                        role="radiogroup"
                                        aria-label="Crawl depth"
                                        className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800/60"
                                    >
                                        {CRAWL_DEPTHS.map((depth) => (
                                            <label
                                                key={depth.value}
                                                className="flex-1"
                                            >
                                                <input
                                                    type="radio"
                                                    name="depth"
                                                    value={depth.value}
                                                    checked={
                                                        form.data
                                                            .crawlDepth ===
                                                        depth.value
                                                    }
                                                    onChange={() =>
                                                        form.setData(
                                                            'crawlDepth',
                                                            depth.value,
                                                        )
                                                    }
                                                    className="peer sr-only"
                                                />
                                                <span className="block cursor-pointer rounded-lg py-2 text-center text-xs text-slate-500 peer-checked:bg-white peer-checked:font-medium peer-checked:text-slate-900 peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-600 dark:text-slate-400 dark:peer-checked:bg-slate-700 dark:peer-checked:text-white">
                                                    {depth.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                                        standard follows links up to 3 levels
                                        from the homepage.
                                    </p>

                                    <label
                                        htmlFor="include-patterns"
                                        className="mt-4 mb-1.5 block text-xs font-medium"
                                    >
                                        include only pages matching
                                    </label>
                                    <input
                                        id="include-patterns"
                                        name="include"
                                        type="text"
                                        placeholder="/blog/*, /products/*"
                                        value={form.data.include}
                                        onChange={(e) =>
                                            form.setData(
                                                'include',
                                                e.target.value,
                                            )
                                        }
                                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                                    />

                                    <label
                                        htmlFor="exclude-patterns"
                                        className="mt-3 mb-1.5 block text-xs font-medium"
                                    >
                                        exclude pages matching
                                    </label>
                                    <input
                                        id="exclude-patterns"
                                        name="exclude"
                                        type="text"
                                        placeholder="/admin/*, /account/*"
                                        value={form.data.exclude}
                                        onChange={(e) =>
                                            form.setData(
                                                'exclude',
                                                e.target.value,
                                            )
                                        }
                                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                                    />
                                    <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                                        leave blank to crawl your whole site, up
                                        to 25 pages.
                                    </p>

                                    <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-800">
                                        <div>
                                            <label
                                                htmlFor="same-domain"
                                                className="block text-xs font-medium"
                                            >
                                                stay on this domain
                                            </label>
                                            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                                                won't follow links to other
                                                sites
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            id="same-domain"
                                            role="switch"
                                            aria-checked={
                                                form.data.sameDomain
                                            }
                                            onClick={() =>
                                                form.setData(
                                                    'sameDomain',
                                                    !form.data.sameDomain,
                                                )
                                            }
                                            className={`relative h-5 w-9 shrink-0 rounded-full focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-slate-950 ${form.data.sameDomain ? 'bg-indigo-700' : 'bg-slate-300 dark:bg-slate-700'}`}
                                        >
                                            <span
                                                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-[right,left] duration-150 ease-out ${form.data.sameDomain ? 'right-0.5' : 'left-0.5'}`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature cards */}
                <section
                    id="how"
                    className="border-t border-slate-200 dark:border-slate-800"
                >
                    <div className="mx-auto grid max-w-5xl divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-slate-800">
                        <div className="p-8">
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-indigo-600 dark:text-indigo-400"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path d="M21 21l-4.3-4.3" />
                            </svg>
                            <h3 className="mt-3 mb-1 text-sm font-medium">
                                real browser scans
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                crawls your site like a visitor would, running
                                axe-core on every page.
                            </p>
                        </div>
                        <div className="p-8">
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-indigo-600 dark:text-indigo-400"
                            >
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                            </svg>
                            <h3 className="mt-3 mb-1 text-sm font-medium">
                                grouped by who's affected
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                not raw rule IDs — keyboard, screen reader, and
                                low-vision users.
                            </p>
                        </div>
                        <div className="p-8">
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-indigo-600 dark:text-indigo-400"
                            >
                                <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
                            </svg>
                            <h3 className="mt-3 mb-1 text-sm font-medium">
                                fix priority, not a wall of text
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                quick wins vs structural work, ranked first in
                                every list.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Email capture modal */}
            <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
                <DialogContent className="rounded-xl border-slate-200 bg-white p-6 sm:max-w-sm dark:border-slate-800 dark:bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="font-display text-lg font-medium">
                            save this audit?
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        optional — add your email to check back later and see
                        your audit history. we'll send a link, no password
                        needed.
                    </p>
                    <label htmlFor="modal-email" className="sr-only">
                        Email address
                    </label>
                    <input
                        id="modal-email"
                        type="email"
                        placeholder="you@example.com"
                        value={modalEmail}
                        onChange={(e) => setModalEmail(e.target.value)}
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                    />
                    <button
                        type="button"
                        onClick={submitAudit}
                        disabled={form.processing}
                        className="h-11 w-full rounded-lg bg-indigo-700 text-sm font-medium text-white hover:bg-indigo-800 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-none disabled:opacity-60 dark:focus:ring-offset-slate-950"
                    >
                        save &amp; continue
                    </button>
                    <button
                        type="button"
                        onClick={submitAudit}
                        disabled={form.processing}
                        className="h-9 w-full rounded-lg text-sm text-slate-500 hover:text-slate-700 focus:ring-2 focus:ring-indigo-600 focus:outline-none dark:text-slate-400 dark:hover:text-slate-200"
                    >
                        skip, continue as guest
                    </button>
                    <div className="flex items-start gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="mt-0.5 shrink-0 text-slate-400"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" />
                        </svg>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            heads up — as a guest, this page is your only way
                            back in. if you lose it, you'll need to wait out the
                            rate limit before you can run another audit for this
                            site.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

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
