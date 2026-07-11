import { Card, CardContent, CardDescription, CardHeader, CardTitle, Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemSeparator, ItemTitle } from '@equalsite/ui';
import * as React from "react";
import { Ban, CheckCircle, CircleX, Clock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stage {
    title: string;
    description: string;
    date: string;
    icon: React.ReactNode;
    active: boolean;
}

const fakeItems: Stage[] = [
    {
        title: 'Scan Queued',
        description: 'Job added to the queue',
        date: (new Date).toLocaleString(),
        icon: <Clock className="size-4" />,
        active: false
    },
    {
        title: 'Scan Started',
        description: 'Waiting to start',
        date: (new Date).toLocaleString(),
        icon: <PlayCircle className="size-4" />,
        active: false,
    },
    {
        title: 'Crawling in Progress',
        description: 'Discovering and processing URLs',
        date: (new Date).toLocaleString(),
        icon: <Clock className="size-4" />,
        active: false
    },
    {
        title: 'Scan Completed',
        description: 'Results ready',
        date: (new Date).toLocaleString(),
        icon: <CheckCircle className="size-4" />,
        active: true
    },
    {
        title: 'Scan Cancelled',
        description: 'Scan was cancelled',
        date: (new Date).toLocaleString(),
        icon: <Ban className="size-4" />,
        active: false
    },
    {
        title: 'Scan Failed',
        description: 'Scan encountered an error',
        date: (new Date).toLocaleString(),
        icon: <CircleX className="size-4" />,
        active: false
    },
];

export default function ScanTimeline() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Scan Timeline
                </CardTitle>
                <CardDescription>Important events in this scan's lifecycle.</CardDescription>
            </CardHeader>
            <CardContent className="gap-2 flex flex-col">
                {fakeItems.map((v, i) => (
                    <div key={v.title}>
                        <Item variant={v.active ? 'muted' : undefined}>
                            <ItemMedia variant="icon">
                                <div
                                    className={cn(
                                        'bg-chart-3/80 text-black p-1 rounded-full',
                                        v.active ? 'bg-chart-3/90 text-black' : 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    {v.icon}
                                </div>
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle>{v.title}</ItemTitle>
                                <ItemDescription>{v.date}</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <ItemDescription className={v.active ? 'text-primary' : undefined}>
                                    {v.description}
                                </ItemDescription>
                            </ItemActions>
                        </Item>
                        {(i < fakeItems.length - 1) && <ItemSeparator />}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
