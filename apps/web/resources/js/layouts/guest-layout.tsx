import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { PublicHeader } from '@/components/public-header';
import PublicLayout from '@/layouts/public-layout';

export const GUEST_NAV_LINKS = [
    //
];

type FooterLink = {
    label: string;
    href: string;
    external?: boolean;
};

type FooterColumn = {
    title: string;
    links: FooterLink[];
};

const FOOTER_COLUMNS: FooterColumn[] = [
    {
        title: 'Product',
        links: [
            { label: 'Home', href: '/' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Contact', href: '/contact' },
        ],
    },
    {
        title: 'Compliance',
        links: [
            {
                label: 'Accessibility statement',
                href: '/accessibility-statement',
            },
            { label: 'Security', href: '/security' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Terms', href: '/terms' },
            { label: 'Privacy', href: '/privacy-policy' },
            { label: 'Refund policy', href: '/refund-policy' },
        ],
    },
];

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { canRegister, canResetPassword } = usePage().props;

    return (
        <PublicLayout>
            <PublicHeader
                navLinks={GUEST_NAV_LINKS}
                auth={{ canRegister, canResetPassword }}
            />

            {children}

            <footer className="border-t border-slate-200 dark:border-slate-800">
                <div className="mx-auto max-w-5xl px-6 py-12">
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-5">
                        <div className="col-span-2">
                            <a
                                href="/"
                                className="flex items-center gap-2 font-display text-base font-medium text-slate-900 dark:text-slate-100"
                            >
                                <span
                                    className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-700 text-white"
                                    aria-hidden="true"
                                >
                                    <AppLogoIcon width="12" height="12" />
                                </span>
                                equalsite
                            </a>
                            <p className="mt-3 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                                An open WCAG 2.2 AA accessibility diagnostic —
                                real browser scans, plain-english reports.
                            </p>
                            <a
                                href="https://github.com/freepeace13/equalsite"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-block text-sm text-slate-500 underline hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                            >
                                Source on GitHub
                            </a>
                        </div>

                        {FOOTER_COLUMNS.map((column) => (
                            <nav key={column.title} aria-label={column.title}>
                                <h2 className="text-xs font-medium tracking-wide text-slate-400 uppercase dark:text-slate-500">
                                    {column.title}
                                </h2>
                                <ul className="mt-3 space-y-2">
                                    {column.links.map((link) => (
                                        <li key={link.href}>
                                            <a
                                                href={link.href}
                                                className="text-sm text-slate-600 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-slate-100"
                                            >
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ))}
                    </div>

                    <p className="mt-10 text-xs text-slate-400 dark:text-slate-600">
                        © {new Date().getFullYear()} equalsite. Held to the
                        same standard we check your site against.
                    </p>
                </div>
            </footer>
        </PublicLayout>
    );
}
