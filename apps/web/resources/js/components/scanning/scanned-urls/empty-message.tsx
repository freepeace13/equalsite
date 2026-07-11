import { TableCell, TableRow } from '@equalsite/ui';

export function EmptyMessage() {
    return (
        <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground">
                No records found
            </TableCell>
        </TableRow>
    );
}
