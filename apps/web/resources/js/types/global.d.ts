import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            monetizationEnabled: boolean;
            [key: string]: unknown;
        };
    }
}

// Minimal shape of the `window.Paddle` global. Cashier's `@paddleJS` Blade
// directive (see resources/views/vendor/cashier/js.blade.php) loads Paddle.js
// and calls `Paddle.Initialize(...)` server-side on every page load, so by
// the time any React page mounts `window.Paddle` is already a ready-to-use
// global — this just types the one method we call from the client
// (Checkout.open), not the full Paddle.js SDK.
declare global {
    interface Window {
        Paddle?: {
            Checkout: {
                open: (options: {
                    items: { priceId: string; quantity: number }[];
                    customer?: { id: string };
                }) => void;
            };
        };
    }
}
