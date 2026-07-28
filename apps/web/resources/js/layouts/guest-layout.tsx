import { usePage } from '@inertiajs/react';
import { PublicHeader } from '@/components/public-header';
import PublicLayout from '@/layouts/public-layout';

export const GUEST_NAV_LINKS = [
    //
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
                    href="/privacy-policy"
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
                {' · '}
                <a
                    href="/security"
                    className="underline hover:text-slate-600 dark:hover:text-slate-400"
                >
                    Security
                </a>
            </footer>
        </PublicLayout>
    );
}
