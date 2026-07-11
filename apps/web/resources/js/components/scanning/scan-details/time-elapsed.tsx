import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@equalsite/ui';
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
    createdAt: string;
    startedAt?: string;
};

function formatElapsed(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);

    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

const parseDate = (dateString: string | null) => {
    if (!dateString) {
        return Date.now();
    }
    return new Date(dateString).getTime();
};

export function TimeElapsed({
    createdAt,
    startedAt
}: Props) {
    const since = parseDate(createdAt);
    const [until, setUntil] = useState(startedAt ? parseDate(startedAt) : Date.now());
    useEffect(() => {
        const interval = setInterval(() => {
            setUntil(startedAt ? parseDate(startedAt) : Date.now());
        }, 1000);
        return () => {
            clearInterval(interval);
        }
    }, [startedAt]);
    const elapsedMs = until - since;
    return (
        <Item variant="outline">
            <ItemMedia variant="icon">
                <Clock className="size-4" />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>Time Elapsed</ItemTitle>
                <ItemDescription>{formatElapsed(elapsedMs)}</ItemDescription>
            </ItemContent>
        </Item>
    )
}
