import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '@equalsite/ui';
import { TriangleAlert } from "lucide-react";

type ErrorIconProps = {
    error?: string
}

export function ErrorIcon({ error }: ErrorIconProps) {
    return error ? (
        <Popover>
            <PopoverTrigger asChild>
                <TriangleAlert className="size-4 text-red-500/90" />
            </PopoverTrigger>
            <PopoverContent align="end">
                <PopoverHeader>
                    <PopoverTitle>URL Request Failed</PopoverTitle>
                    <PopoverDescription className="text-red-500/80">
                        {error}
                    </PopoverDescription>
                </PopoverHeader>
            </PopoverContent>
        </Popover>
    ) : null;
}
