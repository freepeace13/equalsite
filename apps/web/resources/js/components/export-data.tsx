import { Button, Heading } from '@equalsite/ui';
import { Form } from '@inertiajs/react';
import DataExportController from '@/actions/App/Http/Controllers/Settings/DataExportController';

export default function ExportData() {
    return (
        <div className="space-y-4">
            <Heading
                variant="small"
                title="Export your data"
                description="Email yourself a JSON copy of your account and audit history"
            />

            <Form
                {...DataExportController.store.form()}
                options={{ preserveScroll: true }}
            >
                {({ processing }) => (
                    <Button
                        type="submit"
                        variant="secondary"
                        disabled={processing}
                        data-test="export-data-button"
                    >
                        Email my data
                    </Button>
                )}
            </Form>
        </div>
    );
}
