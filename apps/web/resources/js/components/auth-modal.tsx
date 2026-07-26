import {
    Button,
    Checkbox,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    FormField,
    Input,
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
    /** Optional context shown under the title, e.g. why the modal interrupted the user's flow. */
    description?: string;
};

export function AuthModal({
    open,
    onOpenChange,
    defaultTab = 'login',
    canRegister = true,
    canResetPassword = true,
    status,
    description,
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
                    {description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {description}
                        </p>
                    )}
                </DialogHeader>

                {canRegister ? (
                    <Tabs
                        value={tab}
                        onValueChange={(value) => setTab(value as AuthTab)}
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Log in</TabsTrigger>
                            <TabsTrigger value="register">Sign up</TabsTrigger>
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
                    <FormField
                        label="Email address"
                        htmlFor="email"
                        error={errors.email}
                    >
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            required
                            autoFocus
                            autoComplete="email"
                            placeholder="email@example.com"
                        />
                    </FormField>

                    <FormField
                        label="Password"
                        htmlFor="password"
                        error={errors.password}
                        labelAction={
                            canResetPassword && (
                                <TextLink
                                    href={forgotPasswordRequest()}
                                    className="text-sm"
                                >
                                    Forgot password?
                                </TextLink>
                            )
                        }
                    >
                        <PasswordInput
                            id="password"
                            name="password"
                            required
                            autoComplete="current-password"
                            placeholder="Password"
                        />
                    </FormField>

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
            resetOnSuccess={['password']}
            disableWhileProcessing
            className="flex flex-col gap-5"
        >
            {({ processing, errors }) => (
                <>
                    <FormField
                        label="Name"
                        htmlFor="register-name"
                        error={errors.name}
                    >
                        <Input
                            id="register-name"
                            type="text"
                            required
                            autoComplete="name"
                            name="name"
                            placeholder="Full name"
                        />
                    </FormField>

                    <FormField
                        label="Email address"
                        htmlFor="register-email"
                        error={errors.email}
                    >
                        <Input
                            id="register-email"
                            type="email"
                            required
                            autoComplete="email"
                            name="email"
                            placeholder="email@example.com"
                        />
                    </FormField>

                    <FormField
                        label="Password"
                        htmlFor="register-password"
                        error={errors.password}
                    >
                        <PasswordInput
                            id="register-password"
                            required
                            autoComplete="new-password"
                            name="password"
                            placeholder="Password"
                        />
                    </FormField>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={processing}
                        data-test="register-user-button"
                    >
                        {processing && <Spinner />}
                        Create account
                    </Button>

                    <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                        By creating an account you agree to our{' '}
                        <a href="/terms" className="underline">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="underline">
                            Privacy Policy
                        </a>
                        .
                    </p>
                </>
            )}
        </Form>
    );
}
