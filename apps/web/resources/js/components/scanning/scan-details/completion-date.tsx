import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@equalsite/ui';
import { humanReadableDateTime } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

type CompletionDateProps = {
    completedAt?: string
}

export function CompletionDate({ completedAt }: CompletionDateProps) {
    return (
        <Item variant="outline">
            <ItemMedia variant="icon">
                <CheckCircle className="size-4" />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>Completed At</ItemTitle>
                <ItemDescription>
                    {humanReadableDateTime(completedAt)}
                </ItemDescription>
            </ItemContent>
        </Item>
    );
}
