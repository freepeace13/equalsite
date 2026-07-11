import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Field, FieldDescription, FieldLabel, Item, ItemContent, ItemDescription, ItemMedia, ItemTitle, Progress } from '@equalsite/ui';
import { CircleCheck, CircleX, Globe, Hourglass } from "lucide-react";
import type { ScanProgress } from "@/types";

type ScanOverviewProps = {
    scanProgress: ScanProgress;
}

export default function ScanOverview({
    scanProgress,
}: ScanOverviewProps) {
    const {
        totalRequests,
        pendingRequests,
        completedRequests,
        progressPercentage
    } = scanProgress;
    return (
        <Card>
            <CardHeader>
                <CardTitle>Crawl Overview</CardTitle>
                <CardDescription>Real-time statistics about this crawl job.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <Item variant="outline">
                    <ItemMedia variant="icon">
                        <Globe className="size-4 text-blue-500" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Total Requests</ItemTitle>
                        <ItemTitle className="text-2xl">{totalRequests}</ItemTitle>
                        <ItemDescription>All URLs discovered</ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="outline">
                    <ItemMedia variant="icon">
                        <Hourglass className="size-4 text-indigo-500" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Pending Requests</ItemTitle>
                        <ItemTitle className="text-2xl">{pendingRequests}</ItemTitle>
                        <ItemDescription>In queue / waiting</ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="outline">
                    <ItemMedia variant="icon">
                        <CircleCheck className="size-4 text-green-500" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Processed Requests</ItemTitle>
                        <ItemTitle className="text-2xl">{completedRequests}</ItemTitle>
                        <ItemDescription>Successfully processed</ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="outline">
                    <ItemMedia variant="icon">
                        <CircleX className="size-4 text-red-500" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Failed Requests</ItemTitle>
                        <ItemTitle className="text-2xl">0</ItemTitle>
                        <ItemDescription>Errors / Failed</ItemDescription>
                    </ItemContent>
                </Item>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Field>
                    <FieldLabel htmlFor="progress-upload">
                        <span>Progress</span>
                        <span className="ml-auto">{`${progressPercentage}%`}</span>
                    </FieldLabel>
                    <Progress value={progressPercentage} id="progress-upload" className="h-2" />
                    <FieldDescription>
                        {completedRequests} of {totalRequests} requests processed
                    </FieldDescription>
                </Field>
            </CardFooter>
        </Card>
    )
}
