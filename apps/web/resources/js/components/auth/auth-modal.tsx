import {
    Button,
    Checkbox,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Input,
    InputError,
    Label,
    PasswordInput,
    Spinner,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@equalsite/ui';
import { Form } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import TextLink from '@/components/text-link';
import { store as loginStore } from '@/routes/login';
import { request as forgotPasswordRequest } from '@/routes/password';
import { store as registerStore } from '@/routes/register';

type AuthTab = 'login' | 'register';

type AuthModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultTab?: AuthTab;
    canRegister?: boolean;
    canResetPassword?: boolean;
    status?: string;
};

export function AuthModal({
    open,
    onOpenChange,
    defaultTab = 'login',
    canRegister = true,
    canResetPassword = true,
    status,
}: AuthModalProps) {
    const [tab, setTab] = useState<AuthTab>(defaultTab);

    // Re-sync to the tab the trigger asked for each time the modal opens,
    // so re-opening from "Sign up" after a prior "Log in" visit lands correctly.
    useEffect(() => {
        if (open) {
            setTab(defaultTab);
        }
    }, [open, defaultTab]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader className="items-center gap-3 text-center sm:text-center">
                    <span
                        aria-hidden="true"
                        className="flex size-9 items-center justify-center rounded-md bg-indigo-700 text-white"
                    >
                        <AppLogoIcon width="16" height="16" />
                    </span>
                    <DialogTitle className="font-display">
                        {tab === 'login'
                            ? 'Log in to equalsite'
                            : 'Create your account'}
                    </DialogTitle>
                </DialogHeader>

                {canRegister ? (
                    <Tabs
                        value={tab}
                        onValueChange={(value) => setTab(value as AuthTab)}
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Log in</TabsTrigger>
                            <TabsTrigger value="register">
                                Sign up
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="login" className="mt-5">
                            <LoginForm
                                canResetPassword={canResetPassword}
                                status={status}
                            />
                        </TabsContent>

                        <TabsContent value="register" className="mt-5">
                            <RegisterForm />
                        </TabsContent>
                    </Tabs>
                ) : (
                    <LoginForm
                        canResetPassword={canResetPassword}
                        status={status}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function LoginForm({
    canResetPassword,
    status,
}: {
    canResetPassword: boolean;
    status?: string;
}) {
    return (
        <Form
            {...loginStore.form()}
            resetOnSuccess={['password']}
            className="flex flex-col gap-5"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            required
                            autoFocus
                            autoComplete="email"
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink
                                    href={forgotPasswordRequest()}
                                    className="ml-auto text-sm"
                                >
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <PasswordInput
                            id="password"
                            name="password"
                            required
                            autoComplete="current-password"
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox id="remember" name="remember" />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={processing}
                        data-test="login-button"
                    >
                        {processing && <Spinner />}
                        Log in
                    </Button>

                    {status && (
                        <p className="text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            {status}
                        </p>
                    )}
                </>
            )}
        </Form>
    );
}

function RegisterForm() {
    return (
        <Form
            {...registerStore.form()}
            resetOnSuccess={['password', 'password_confirmation']}
            disableWhileProcessing
            className="flex flex-col gap-5"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="register-name">Name</Label>
                        <Input
                            id="register-name"
                            type="text"
                            required
                            autoComplete="name"
                            name="name"
                            placeholder="Full name"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="register-email">Email address</Label>
                        <Input
                            id="register-email"
                            type="email"
                            required
                            autoComplete="email"
                            name="email"
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="register-password">Password</Label>
                        <PasswordInput
                            id="register-password"
                            required
                            autoComplete="new-password"
                            name="password"
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="register-password-confirmation">
                            Confirm password
                        </Label>
                        <PasswordInput
                            id="register-password-confirmation"
                            required
                            autoComplete="new-password"
                            name="password_confirmation"
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={processing}
                        data-test="register-user-button"
                    >
                        {processing && <Spinner />}
                        Create account
                    </Button>
                </>
            )}
        </Form>
    );
}
