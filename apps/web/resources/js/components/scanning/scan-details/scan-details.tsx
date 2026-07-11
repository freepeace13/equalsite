import { Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Stack } from '@equalsite/ui';
import { Ban, CircleSmall, ExternalLink } from "lucide-react";
import { Link } from "@inertiajs/react";
import { TimeElapsed } from "./time-elapsed";
import { cn } from "@/lib/utils";
import type { ScanInfo, ScanQueue } from "@/types";
import { show } from '@/actions/App/Http/Controllers/Audit/ReportController';
import { QueuePosition } from "./queue-position";
import { Status } from "./status";
import { CreationDate } from "./creation-date";
import { StartDate } from "./start-date";
import { CompletionDate } from "./completion-date";
import { CancellationDate } from "./cancellation-date";

type ScanDetailsProps = {
    scanInfo: ScanInfo;
    scanQueue: ScanQueue;
};

export function ScanDetails({
    scanInfo,
    scanQueue
}: ScanDetailsProps) {
    return (
        <Card>
            <CardHeader>
                <Stack direction="row" justify="between">
                    <Badge
                        className={cn(
                            'leading-normal font-semibold',
                            ({
                                'queued': 'bg-chart-3/20 text-chart-3',
                                'started': 'bg-chart-1/20 text-chart-1',
                                'completed': 'bg-chart-2/20 text-chart-2',
                                'cancelled': 'bg-chart-5/20 text-chart-5',
                                'failed': 'bg-chart-5/20 text-chart-5'
                            })[scanInfo.status]
                        )}
                    >
                        <CircleSmall
                            data-icon="inline-start"
                            className={({
                                'queued': 'fill-chart-3',
                                'started': 'fill-chart-1',
                                'completed': 'fill-chart-2',
                                'cancelled': 'fill-chart-5',
                                'failed': 'fill-chart-5'
                            })[scanInfo.status]}
                        />
                        {scanInfo.status.toUpperCase()}
                    </Badge>
                    <Link href={show(scanInfo.auditId)}>View Reports</Link>
                </Stack>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 min-h-24">
                <div className="border flex flex-col justify-between rounded-md py-2 px-3">
                    <CardTitle className="font-bold text-2xl tracking-wider">
                        {`Scan #${String(scanInfo.auditId).padStart(6, '0')}`}
                    </CardTitle>
                    <div>
                        <div className="text-xs">Target URL</div>
                        <Button size="sm" variant="link" className="text-indigo-500">
                            {scanInfo.siteUrl}
                            <ExternalLink data-icon="inline-end" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <QueuePosition status={scanInfo.status} scanQueue={scanQueue} />
                    <div className="rounded-md border text-center text-xs flex flex-col justify-center gap-2 py-2 px-3">
                        <div>
                            <Button variant="destructive">
                                <Ban data-icon="inline-start" />
                                Cancel
                            </Button>
                        </div>
                        <p>This will remove the job from the queue.</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 lg:grid-cols-6 sm:grid-cols-3 gap-2">
                <TimeElapsed createdAt={scanInfo.createdAt} startedAt={scanInfo.startedAt} />
                <Status status={scanInfo.status} />
                <CreationDate createdAt={scanInfo.createdAt} />
                <StartDate startedAt={scanInfo.startedAt} />
                <CompletionDate completedAt={scanInfo.completedAt} />
                <CancellationDate cancelledAt={scanInfo.cancelledAt} />
            </CardFooter>
        </Card>
    )
}
