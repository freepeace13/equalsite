import { Head, router } from '@inertiajs/react';
import { AuthModal } from '@/components/auth/auth-modal';
import { PublicHeader } from '@/components/public-header';
import { home } from '@/routes';

type Props = {
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Register({ canResetPassword, canRegister }: Props) {
    return (
        <>
            <Head title="Register" />

            <PublicHeader />

            <AuthModal
                open
                onOpenChange={(open) => {
                    if (!open) {
                        router.visit(home());
                    }
                }}
                defaultTab="register"
                canRegister={canRegister}
                canResetPassword={canResetPassword}
            />
        </>
    );
}
