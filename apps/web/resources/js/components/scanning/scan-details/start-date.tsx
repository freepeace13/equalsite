import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@equalsite/ui';
import { humanReadableDateTime } from '@/lib/utils';
import { Play } from 'lucide-react';

type StartDateProps = {
    startedAt?: string
}

export function StartDate({ startedAt }: StartDateProps) {
    return (
        <Item variant="outline">
            <ItemMedia variant="icon">
                <Play className="size-4" />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>Started At</ItemTitle>
                <ItemDescription>
                    {humanReadableDateTime(startedAt)}
                </ItemDescription>
            </ItemContent>
        </Item>
    );
}
