import type { ScanProgress, ScanStatus } from '@/types';
import type { StatusBadgeStatus } from '@equalsite/ui';

export const SCAN_STATUS_BADGE: Record<
	ScanStatus,
	{ status: StatusBadgeStatus; label?: string }
> = {
	queued: { status: 'queued' },
	started: { status: 'processing', label: 'crawling' },
	completed: { status: 'complete' },
	failed: { status: 'failed' },
	cancelled: { status: 'cancelled' },
};

export function isActiveStatus(status: ScanStatus): boolean {
	return status === 'queued' || status === 'started';
}

export function scanProgressPercent(
	scanProgress: ScanProgress | null | undefined,
): number {
	const scanned = scanProgress?.completedRequests ?? 0;
	const total = scanProgress?.totalRequests ?? 0;

	return total > 0
		? Math.round((scanned / total) * 100)
		: (scanProgress?.progressPercentage ?? 0);
}
