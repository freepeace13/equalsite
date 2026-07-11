import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@equalsite/ui';
import type { ScanQueue, ScanStatus } from "@/types";
import { Ban, CheckCircle, Layers, Loader, TriangleAlert } from "lucide-react";

type QueuePositionProps = {
    status: ScanStatus;
    scanQueue: ScanQueue;
}

const config: Record<ScanStatus, { icon: React.ElementType; title: string; label: string }> = {
    queued: { icon: Layers, title: 'Your place in queue', label: '' },
    started: { icon: Loader, title: 'Scan status', label: 'In Progress' },
    completed: { icon: CheckCircle, title: 'Scan status', label: 'Completed' },
    cancelled: { icon: Ban, title: 'Scan status', label: 'Cancelled' },
    failed: { icon: TriangleAlert, title: 'Scan status', label: 'Failed' },
};

export function QueuePosition({ status, scanQueue }: QueuePositionProps) {
    const { icon: Icon, title, label } = config[status];

    return (
        <Item variant="outline">
            <ItemMedia variant="icon">
                <Icon className="size-4" />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>{title}</ItemTitle>
                {status === 'queued' ? (
                    scanQueue.ahead > 0 ? (
                        <>
                            <ItemTitle className="text-2xl">
                                {scanQueue.position}
                            </ItemTitle>
                            <ItemDescription>{scanQueue.ahead} processes ahead</ItemDescription>
                        </>
                    ) : (
                        <ItemTitle className="text-2xl">Next</ItemTitle>
                    )
                ) : (
                    <ItemTitle className="text-2xl">{label}</ItemTitle>
                )}
            </ItemContent>
        </Item>
    );
}
