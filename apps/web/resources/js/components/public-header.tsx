import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@equalsite/ui';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { AuthModal } from '@/components/auth-modal';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAppearance } from '@/hooks/use-appearance';

type NavLink = {
    label: string;
    href: string;
    external?: boolean;
};

type PublicHeaderProps = {
    navLinks?: NavLink[];
    /** Pass to show "Log in" / "Sign up" actions that open the auth modal. Omit on pages the user already reached while authenticated. */
    auth?: {
        canRegister: boolean;
        canResetPassword: boolean;
    };
};

function ThemeToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';

    return (
        <button
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            aria-label="Toggle dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        >
            {isDark ? (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
            ) : (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />
                </svg>
            )}
        </button>
    );
}

export function PublicHeader({ navLinks, auth: modalAuth }: PublicHeaderProps) {
    const { auth } = usePage().props;
    const [authModal, setAuthModal] = useState<{
        open: boolean;
        tab: 'login' | 'register';
    }>({ open: false, tab: 'login' });

    return (
        <header className="border-b border-slate-200 dark:border-slate-800">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 font-display text-lg font-medium"
                >
                    <span
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-700 text-white"
                        aria-hidden="true"
                    >
                        <AppLogoIcon width="14" height="14" />
                    </span>
                    equalsite
                </Link>

                <div className="flex items-center gap-4">
                    {navLinks && navLinks.length > 0 && (
                        <nav className="hidden items-center gap-8 text-sm text-slate-600 sm:flex dark:text-slate-400">
                            {navLinks.map((link) =>
                                link.external ? (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                                    >
                                        {link.label}
                                        <svg
                                            width="13"
                                            height="13"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                                        </svg>
                                    </a>
                                ) : (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        className="hover:text-slate-900 dark:hover:text-white"
                                    >
                                        {link.label}
                                    </a>
                                ),
                            )}
                        </nav>
                    )}

                    {auth.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 rounded-full"
                                    data-test="public-header-user-menu"
                                >
                                    <UserInfo user={auth.user} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        modalAuth && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        setAuthModal({
                                            open: true,
                                            tab: 'login',
                                        })
                                    }
                                >
                                    Log in
                                </Button>
                                {modalAuth.canRegister && (
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            setAuthModal({
                                                open: true,
                                                tab: 'register',
                                            })
                                        }
                                    >
                                        Sign up
                                    </Button>
                                )}
                            </div>
                        )
                    )}

                    <ThemeToggle />
                </div>
            </div>

            {!auth.user && modalAuth && (
                <AuthModal
                    open={authModal.open}
                    onOpenChange={(open) =>
                        setAuthModal((state) => ({ ...state, open }))
                    }
                    defaultTab={authModal.tab}
                    canRegister={modalAuth.canRegister}
                    canResetPassword={modalAuth.canResetPassword}
                />
            )}
        </header>
    );
}
