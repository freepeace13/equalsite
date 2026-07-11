import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@equalsite/ui';
import { cn, match, str } from '@/lib/utils';
import type { ScanStatus } from '@/types';
import { CircleDot, CircleSmall } from 'lucide-react';

type StatusProps = {
    status: ScanStatus
}

export function Status({ status }: StatusProps) {
    return (
        <Item variant="outline">
            <ItemMedia variant="icon">
                <CircleDot className="size-4" />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>Status</ItemTitle>
                <ItemDescription>
                    <span className="inline-flex gap-1">
                        <CircleSmall
                            data-icon="inline-start"
                            className={cn(
                                'size-3 self-center',
                                match(status, {
                                    'queued': 'fill-chart-3 text-chart-3',
                                    'started': 'fill-chart-1 text-chart-1',
                                    'completed': 'fill-chart-2 text-chart-2',
                                    'default': 'fill-chart-5 text-chart-5',
                                })
                            )}
                        />
                        <span>
                            {match(status, {
                                'queued': 'Waiting',
                                'started': 'Running',
                                'default': str.title(status)
                            })}
                        </span>
                    </span>
                </ItemDescription>
            </ItemContent>
        </Item>
    )
}
