import { useForm } from '@inertiajs/react';
import { type ChangeEventHandler, type ReactNode, type SubmitEventHandler } from 'react';
import { AdvancedSettings, type AuditFormData } from '@/components/form/advance-settings';
import { savePendingAudit } from '@/lib/pending-audit';
import { store } from '@/routes/audit';
import { ArrowRightIcon, Button, InputError } from '@equalsite/ui';

type AuditRequestFormProps = {
    /** Whether the current visitor is signed in. Guests get diverted to `onUnauthenticated` instead of submitting. */
    isAuthenticated: boolean;
    /** Called instead of submitting when a guest tries to run an audit — the URL is already saved via savePendingAudit. */
    onUnauthenticated?: () => void;
    submitLabel?: string;
    submittingLabel?: string;
    autoFocus?: boolean;
    showAdvancedSettings?: boolean;
    /** Rendered between the field error and advanced settings, e.g. scan-limit copy. */
    caption?: ReactNode;
};

export function AuditRequestForm({
    isAuthenticated,
    onUnauthenticated,
    submitLabel = 'run audit',
    submittingLabel = 'starting…',
    autoFocus = false,
    showAdvancedSettings = true,
    caption,
}: AuditRequestFormProps) {
    const form = useForm<AuditFormData>({
        url: '',
        crawlDepth: '3',
        include: '',
        exclude: '',
        sameDomain: true,
    });

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        form.setData('url', e.target.value);
    };

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        let value = form.data.url.trim();
        if (value && !/^https?:\/\//i.test(value)) {
            value = 'https://' + value;
        }
        form.setData('url', value);
        if (!value) {
            return;
        }

        if (!isAuthenticated) {
            savePendingAudit({
                url: value,
                crawlDepth: form.data.crawlDepth,
                include: form.data.include,
                exclude: form.data.exclude,
                sameDomain: form.data.sameDomain,
            });
            onUnauthenticated?.();
            return;
        }

        form.submit(store());
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="mx-auto flex max-w-lg gap-2">
                <label htmlFor="url" className="sr-only">
                    Website URL
                </label>
                <input
                    id="url"
                    name="url"
                    type="text"
                    inputMode="url"
                    required
                    autoFocus={autoFocus}
                    placeholder="https://yoursite.com"
                    value={form.data.url}
                    onChange={handleChange}
                    disabled={form.processing}
                    className="h-11 flex-1 rounded-lg border border-slate-300 bg-white px-4 text-sm placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                />
                <Button type="submit" disabled={form.processing} className="h-11 px-5">
                    {form.processing ? submittingLabel : submitLabel}
                    {!form.processing && <ArrowRightIcon />}
                </Button>
            </form>

            {form.errors.url && (
                <div className="mx-auto mt-2 max-w-md text-left">
                    <InputError message={form.errors.url} />
                </div>
            )}

            {caption}

            {showAdvancedSettings && <AdvancedSettings form={form} />}
        </div>
    );
}
