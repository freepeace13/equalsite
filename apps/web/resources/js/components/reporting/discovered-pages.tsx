import type React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@equalsite/ui';

export type DiscoveredPagesProps = {
    title?: string;
    subtitle?: string;
    pageUrls: string[];
    emptyLabel: React.ReactNode;
};

export function DiscoveredPages({
    title = 'Pages',
    subtitle = 'Discovered during scanning',
    pageUrls,
    emptyLabel,
}: DiscoveredPagesProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
                {pageUrls.length ? (
                    <div className="grid w-full grid-cols-1 gap-3">
                        {pageUrls.map((pageUrl) => (
                            <Card key={pageUrl}>
                                <CardHeader>
                                    <CardTitle>{pageUrl}</CardTitle>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm dark:text-slate-600 text-slate-300">
                        {emptyLabel}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
