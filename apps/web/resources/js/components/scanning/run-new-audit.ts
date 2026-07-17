import { router } from '@inertiajs/react';
import { store } from '@/routes/audit';

export function runNewAudit(url: string) {
    router.post(
        store().url,
        { url, stayOnPage: true },
        { preserveState: true, preserveScroll: true },
    );
}
