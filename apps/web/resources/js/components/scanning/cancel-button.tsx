import { Button } from '@equalsite/ui';

export function CancelButton({ onCancel }: { onCancel: () => void }) {
    return (
        <Button variant="ghost-destructive" size="sm" onClick={onCancel}>
            cancel audit
        </Button>
    );
}
