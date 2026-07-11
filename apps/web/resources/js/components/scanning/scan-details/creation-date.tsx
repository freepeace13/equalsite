import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@equalsite/ui';
import { humanReadableDateTime } from '@/lib/utils';
import { Calendar } from 'lucide-react';

type CreateDateProps = {
    createdAt: string
}

export function CreationDate({ createdAt }: CreateDateProps) {
    return (
        <Item variant="outline">
            <ItemMedia variant="icon">
                <Calendar className="size-4" />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>Created At</ItemTitle>
                <ItemDescription>
                    {humanReadableDateTime(createdAt)}
                </ItemDescription>
            </ItemContent>
        </Item>
    );
}
