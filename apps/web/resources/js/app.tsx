import { createInertiaApp } from '@inertiajs/react';
import { TooltipProvider } from '@equalsite/ui';
import { Toaster } from '@/components/toaster';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import GuestLayout from '@/layouts/guest-layout';
import PublicLayout from '@/layouts/public-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { configureEcho } from '@laravel/echo-react';

configureEcho({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    wsHost: import.meta.env.VITE_PUSHER_HOST,
    wsPort: Number(import.meta.env.VITE_PUSHER_PORT || 6001),
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case [
                'welcome',
                'privacy-policy',
                'faq',
                'terms',
                'contact',
                'security',
                'refund-policy',
            ].includes(name):
                return GuestLayout;
            case ['auth/login', 'auth/register'].includes(name):
                return PublicLayout;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
