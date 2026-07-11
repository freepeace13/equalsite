import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@equalsite/ui';
import { humanReadableDateTime } from '@/lib/utils';
import { CircleX } from 'lucide-react';

type CancellationDateProps = {
    cancelledAt?: string
}

export function CancellationDate({ cancelledAt }: CancellationDateProps) {
    return (
        <Item variant="outline">
            <ItemMedia variant="icon">
                <CircleX className="size-4" />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>Cancelled At</ItemTitle>
                <ItemDescription>
                    {humanReadableDateTime(cancelledAt)}
                </ItemDescription>
            </ItemContent>
        </Item>
    );
}
