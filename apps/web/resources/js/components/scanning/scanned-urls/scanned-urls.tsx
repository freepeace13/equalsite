import { Button, ButtonGroup, ButtonGroupSeparator, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Separator, Spinner, Stack, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@equalsite/ui';
import { CheckCircle, ChevronLeft, ChevronRight, CircleX, Minus } from "lucide-react";
import { cn, match } from "@/lib/utils";
import { type ScannedUrl } from "@/types";
import usePagination from "@/hooks/use-pagination";
import { normalizeUrls } from "./utils";
import { BreakdownResult } from "./breakdown-result";
import { ErrorIcon } from "./error-icon";
import { EmptyMessage } from "./empty-message";

type ScannedUrlsProps = {
    urls: Record<string, ScannedUrl>;
}

type NormalizedUrl = ScannedUrl & {
    url: string;
}

export function ScannedUrls({ urls }: ScannedUrlsProps) {
    const normalizedUrls: NormalizedUrl[] = normalizeUrls(urls);
    const {
        firstPage,
        lastPage,
        totalItems,
        currentItems,
        currentPage,
        nextPage,
        prevPage,
        perPage
    } = usePagination(normalizedUrls, 7);

    const displayedCount = Math.min(currentPage * perPage, totalItems);

    const renderItem = (url: NormalizedUrl) => {
        return (
            <TableRow key={url.url}>
                <TableCell className="font-medium min-w-2xl">
                    <Stack direction="row" gap="xs" align="center">
                    {url.status && match(url.status, {
                        'started': <Spinner className="size-4" />,
                        'failed': <CircleX className="size-4 text-red-500/90" />,
                        'completed': <CheckCircle className="size-4 text-green-500" />,
                        'default': <Minus className="size-4" />
                    })}
                    <div className={cn(
                        'max-w-lg overflow-hidden text-ellipsis',
                        url?.status === 'started' && 'text-muted-foreground',
                        url?.status === 'failed' && 'line-through'
                    )}>
                        {url.url}
                    </div>
                </Stack>
                </TableCell>
                <TableCell>
                    <Stack direction="row" gap="xs">
                        {url?.status && match(url.status, {
                            'started': 'Processing...',
                            'failed': <ErrorIcon error={url?.errorMessage} />,
                            'completed': <BreakdownResult result={url?.severityBreakdown} />,
                        })}
                    </Stack>
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                        <ChevronRight className="size-4" />
                    </Button>
                </TableCell>
            </TableRow>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{`Scanned URL(s)`}</CardTitle>
                <CardDescription>{`URL(s) that have been crawled and their violation summary.`}</CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-3">URL</TableHead>
                            <TableHead>Violations</TableHead>
                            <TableHead className="text-right">&nbsp;</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!currentItems.length
                            ? <EmptyMessage />
                            : currentItems.map(i => renderItem(i))}
                    </TableBody>
                </Table>
                <Separator />
            </CardContent>
            <CardFooter className="flex flex-row justify-between align-middle">
                <CardDescription>
                    {`Showing ${displayedCount} of ${totalItems} processed URLs`}
                </CardDescription>
                <ButtonGroup>
                    <Button
                        variant="secondary"
                        onClick={prevPage}
                        disabled={firstPage}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <ButtonGroupSeparator />
                    <Button
                        variant="secondary"
                        onClick={nextPage}
                        disabled={lastPage}
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </ButtonGroup>
            </CardFooter>
        </Card>
    )
}
