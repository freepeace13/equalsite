import { Head, router } from '@inertiajs/react';
import { cancel, index, progress } from '@/routes/audit';
import { SCAN_STATUS_BADGE } from '@/lib/audit-status';
import { hostnameOf } from '@/lib/utils';
import {
    countFailedPages,
    countIssues,
    CrawlingPanel,
} from '@/components/scanning/crawling-panel';
import { ReportCta } from '@/components/scanning/report-cta';
import { WaitingPanel } from '@/components/scanning/waiting-panel';
import {
    useAuditProgressStream,
    type AuditProgressStreamProps as ScanProgressPageProps,
} from '@/hooks/use-audit-progress-stream';
import { Callout, GlobeIcon, StatusBadge } from '@equalsite/ui';

export default function Progress({
    scanInfo,
    scanProgress,
    scanQueue,
    scanUrls,
}: ScanProgressPageProps) {
    const domain = hostnameOf(scanInfo.siteUrl);

    useAuditProgressStream(scanInfo.auditId);

    const handleCancel = () => {
        if (
            !window.confirm(
                'Cancel this audit? It will stay in your history marked as cancelled.',
            )
        ) {
            return;
        }

        router.delete(cancel(scanInfo.auditId).url, {
            preserveScroll: true,
        });
    };

    const activePanel =
        scanInfo.status === 'started' || scanInfo.status === 'completed'
            ? 'crawling'
            : scanInfo.status === 'queued'
              ? 'waiting'
              : null;
    const issuesCount = countIssues(scanUrls);
    const failedPagesCount = countFailedPages(scanUrls);
    const attemptedPagesCount = Object.keys(scanUrls).length;
    const badge = SCAN_STATUS_BADGE[scanInfo.status];

    return (
        <>
            <Head title={`Auditing ${domain}`} />

            <main className="container mx-auto py-10">
                <div className="mb-6 flex items-center justify-between">
                    <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <GlobeIcon />
                        {domain}
                    </p>
                    <StatusBadge status={badge.status} label={badge.label} />
                </div>

                {activePanel === 'waiting' && (
                    <WaitingPanel
                        scanQueue={scanQueue}
                        onCancel={handleCancel}
                    />
                )}
                {activePanel === 'crawling' && (
                    <CrawlingPanel
                        scanProgress={scanProgress}
                        scanUrls={scanUrls}
                        onCancel={handleCancel}
                    />
                )}

                {scanInfo.status === 'completed' && failedPagesCount > 0 && (
                    <Callout
                        variant="warning"
                        title="Some pages couldn't be scanned."
                        className="mt-6"
                    >
                        {failedPagesCount} of {attemptedPagesCount} pages failed to scan.
                        The report only covers the pages that completed successfully.
                    </Callout>
                )}

                {scanInfo.status === 'completed' && (
                    <ReportCta
                        auditId={scanInfo.auditId}
                        issuesCount={issuesCount}
                    />
                )}

                {scanInfo.status === 'failed' && (
                    <Callout
                        variant="danger"
                        title="Scan failed."
                        className="mt-6"
                    >
                        {scanInfo.failureReason ??
                            'An unexpected error occurred.'}
                    </Callout>
                )}

                {scanInfo.status === 'cancelled' && (
                    <Callout title="Audit cancelled." className="mt-6">
                        No report will be generated for this run.
                    </Callout>
                )}
            </main>
        </>
    );
}

Progress.layout = (props: ScanProgressPageProps) => ({
    breadcrumbs: [
        { title: 'Audits', href: index() },
        {
            title: hostnameOf(props.scanInfo.siteUrl),
            href: progress(props.scanInfo.auditId),
        },
    ],
});
