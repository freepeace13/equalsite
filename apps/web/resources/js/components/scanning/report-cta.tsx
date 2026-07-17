import { Link } from '@inertiajs/react';
import { show } from '@/routes/audit';
import { ArrowRightIcon, Button } from '@equalsite/ui';

export function ReportCta({
    auditId,
    issuesCount,
}: {
    auditId: string;
    issuesCount: number;
}) {
    return (
        <div className="mt-6 flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3.5 dark:bg-emerald-900/20">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
                <span className="font-medium">audit complete</span> —{' '}
                {issuesCount} issue{issuesCount !== 1 ? 's' : ''} found
            </p>
            <Button size="sm" asChild>
                <Link href={show(auditId).url}>
                    view report
                    <ArrowRightIcon />
                </Link>
            </Button>
        </div>
    );
}
