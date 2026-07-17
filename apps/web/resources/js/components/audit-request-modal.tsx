import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@equalsite/ui';
import { AuditRequestForm } from '@/components/form/audit-request-form';

type AuditRequestModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
};

export function AuditRequestModal({
    open,
    onOpenChange,
    title = 'run a new audit',
    description = "enter a URL to scan — it'll show up in your sites list once it starts.",
}: AuditRequestModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="font-display">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <AuditRequestForm isAuthenticated autoFocus submitLabel="run audit" />
            </DialogContent>
        </Dialog>
    );
}
