import { Head, useForm } from '@inertiajs/react';
import ContactController from '@/actions/App/Http/Controllers/Legal/ContactController';
import { PublicHeader } from '@/components/public-header';
import PublicLayout from '@/layouts/public-layout';
import {
    Button,
    Heading,
    Input,
    InputError,
    Label,
    Textarea,
} from '@equalsite/ui';

export default function Contact() {
    const form = useForm({
        name: '',
        email: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        form.post(ContactController.store().url, {
            preserveScroll: true,
        });
    };

    return (
        <PublicLayout>
            <Head title="Contact us" />
            <PublicHeader />

            <main className="mx-auto max-w-lg px-6 py-16">
                <Heading
                    title="Contact us"
                    description="Questions about billing, refunds, or your data — we read every message."
                />

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            disabled={form.processing}
                            required
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                            disabled={form.processing}
                            required
                        />
                        <InputError message={form.errors.email} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            rows={6}
                            value={form.data.message}
                            onChange={(e) =>
                                form.setData('message', e.target.value)
                            }
                            disabled={form.processing}
                            required
                        />
                        <InputError message={form.errors.message} />
                    </div>

                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Sending…' : 'Send message'}
                    </Button>
                </form>

                <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
                    We aim to respond within 2 business days.
                </p>
            </main>
        </PublicLayout>
    );
}
