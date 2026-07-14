import { Head } from '@inertiajs/react';
import { PublicHeader } from '@/components/public-header';

export default function Dashboard() {
    return (
        <>
            <Head title="dashboard" />
            <PublicHeader />
            <main className="mx-auto max-w-3xl px-6 py-10">
                dashboard
            </main>
        </>
    );
}
