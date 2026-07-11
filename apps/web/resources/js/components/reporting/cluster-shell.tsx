import {
    Card,
    CardAction,
    CardDescription,
    CardHeader,
    CardTitle,
    Collapsible,
    CollapsibleChevron,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@equalsite/ui';
import type { ReactNode } from 'react';
import { useState } from 'react';

type ClusterShellProps = {
    children: ReactNode;
    title: ReactNode | string;
    description: ReactNode | string;
}

export function ClusterShell({
    title,
    description,
    children,
    ...props
}: ClusterShellProps) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Card {...props}>
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
            >
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                    <CardAction>
                        <CollapsibleTrigger className="w-auto justify-center gap-0 rounded-full p-0 size-8 hover:bg-accent hover:text-accent-foreground">
                            <CollapsibleChevron />
                        </CollapsibleTrigger>
                    </CardAction>
                </CardHeader>
                <CollapsibleContent className="mt-4">
                    {children}
                </CollapsibleContent>
            </Collapsible>
        </Card>
    )
}
