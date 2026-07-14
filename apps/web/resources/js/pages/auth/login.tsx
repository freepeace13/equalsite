import { Head, router } from '@inertiajs/react';
import { AuthModal } from '@/components/auth/auth-modal';
import { PublicHeader } from '@/components/public-header';
import { home } from '@/routes';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Log in" />

            <PublicHeader />

            <AuthModal
                open
                onOpenChange={(open) => {
                    if (!open) {
                        router.visit(home());
                    }
                }}
                defaultTab="login"
                canRegister={canRegister}
                canResetPassword={canResetPassword}
                status={status}
            />
        </>
    );
}
