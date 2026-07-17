# Frontend Refactor Phase B: Scanning Organisms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Relocate the large presentational "scanning" components (`WaitingPanel`, `CrawlingPanel`, `FeedRow`, `ReportCta`, `CancelButton`, `CurrentAuditCard`, `LiveHistoryRow`, `LiveSiteRow`) out of their four page files and into `apps/web/resources/js/components/scanning/`, with zero behavior change, plus one new shared piece (`ScanProgressCell`) for the one block that's genuinely byte-duplicated today.

**Architecture:** A new `components/scanning/` directory, flat kebab-case files (one per top-level organism, matching this repo's existing barrel-free `components/*.tsx` convention). Each organism keeps consuming the Phase A hooks/helpers (`useAuditLiveStatus`, `useAuditProgressStream`, `lib/audit-status.ts`, `lib/utils.ts`) exactly as it does today — only the JSX and its supporting types/helpers move. Four page files are edited to import instead of declare these components.

**Tech Stack:** React 19, Inertia.js 3, TypeScript, `@equalsite/types`, `@equalsite/ui`. Builds on Phase A (`lib/audit-status.ts`, `lib/utils.ts`, `hooks/use-audit-live-status.ts`, `hooks/use-audit-progress-stream.ts` — already merged, unmodified by this plan).

## Global Constraints

- Zero behavior change — every migrated component must render and update identically to today. The two known pre-existing inconsistencies (queue-position quirk in `LiveSiteRow`; styling differences between `ScanProgressCell`'s two callers and `CurrentAuditCard`'s own inline JSX) are preserved as-is, not silently fixed.
- Exactly one new abstraction beyond relocation: `ScanProgressCell`, shared by `LiveSiteRow` and `LiveHistoryRow` only (byte-identical duplication today). `CurrentAuditCard` keeps its own separate inline JSX for the equivalent blocks — do not attempt to unify it onto `ScanProgressCell`.
- No changes to `lib/audit-status.ts`, `lib/utils.ts`, `hooks/use-audit-live-status.ts`, `hooks/use-audit-progress-stream.ts`, or `@equalsite/types` — this phase only moves presentational code and its directly-supporting local types/helpers.
- No component extraction beyond what's named in this plan — Phase C (reporting organisms) and Phase D (final thinning pass) are separate, later plans.
- New files live under `apps/web/resources/js/components/scanning/`, flat kebab-case naming (e.g. `waiting-panel.tsx`), no `index.ts` barrel (none exists elsewhere in `apps/web/resources/js/components/`).
- Style: 4-space indent, single quotes, semicolons, 80-col print width (`.prettierrc` at repo root) — match surrounding code exactly.
- Run all `pnpm` commands from the repo root using `--filter @equalsite/web` (per this repo's Turbo monorepo convention), unless a step says otherwise.

---

### Task 1: `components/scanning/scan-progress-cell.tsx` — shared progress/queue cell

**Files:**
- Create: `apps/web/resources/js/components/scanning/scan-progress-cell.tsx`

**Interfaces:**
- Consumes: `scanProgressPercent` from `@/lib/audit-status`; `ScanProgress`, `ScanQueue`, `ScanStatus` from `@/types`; `ProgressBar` from `@equalsite/ui`.
- Produces: `ScanProgressCell(props: { status: ScanStatus; scanQueue: ScanQueue | null; scanProgress: ScanProgress | null }): JSX.Element` — consumed by Tasks 4 and 5.

- [ ] **Step 1: Create the file**

```tsx
import { scanProgressPercent } from '@/lib/audit-status';
import type { ScanProgress, ScanQueue, ScanStatus } from '@/types';
import { ProgressBar } from '@equalsite/ui';

export function ScanProgressCell({
    status,
    scanQueue,
    scanProgress,
}: {
    status: ScanStatus;
    scanQueue: ScanQueue | null;
    scanProgress: ScanProgress | null;
}) {
    if (status === 'started') {
        const pct = scanProgressPercent(scanProgress);
        const scanned = scanProgress?.completedRequests ?? 0;
        const total = scanProgress?.totalRequests ?? 0;

        return (
            <div className="min-w-32">
                <ProgressBar value={pct} size="sm" className="mb-1" />
                <p className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                    {scanned} of {total} pages
                </p>
            </div>
        );
    }

    return (
        <span className="text-xs text-slate-500 dark:text-slate-400">
            position {scanQueue?.position ?? '—'} in queue
        </span>
    );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS (this file isn't imported anywhere yet, but must compile cleanly on its own).

- [ ] **Step 3: Commit**

```bash
git add apps/web/resources/js/components/scanning/scan-progress-cell.tsx
git commit -m "$(cat <<'EOF'
Add ScanProgressCell shared by LiveSiteRow and LiveHistoryRow

First piece of Phase B: extracts the byte-identical
progress-bar-vs-queue-position block that's duplicated today in
sites/index.tsx's LiveSiteRow and audit/index.tsx's LiveHistoryRow.
CurrentAuditCard's similar-looking blocks stay separate — they differ
in tag/margin/layout and aren't worth unifying via prop overrides.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Extract `audit/progress.tsx`'s scanning components

**Files:**
- Create: `apps/web/resources/js/components/scanning/cancel-button.tsx`
- Create: `apps/web/resources/js/components/scanning/waiting-panel.tsx`
- Create: `apps/web/resources/js/components/scanning/crawling-panel.tsx`
- Create: `apps/web/resources/js/components/scanning/report-cta.tsx`
- Modify: `apps/web/resources/js/pages/audit/progress.tsx`

**Interfaces:**
- `cancel-button.tsx` consumes: `Button` from `@equalsite/ui`. Produces: `CancelButton(props: { onCancel: () => void })` — consumed by `waiting-panel.tsx` and `crawling-panel.tsx`.
- `waiting-panel.tsx` consumes: `ScanQueue` from `@/types`; `Callout`, `StatPair` from `@equalsite/ui`; `CancelButton` from `./cancel-button`. Produces: `WaitingPanel(props: { scanQueue: ScanQueue; onCancel: () => void })`.
- `crawling-panel.tsx` consumes: `pathnameOf` from `@/lib/utils`; `ScannedUrl`, `ScanProgress` from `@/types`; several icons + `MetricCard`, `ProgressBar` from `@equalsite/ui`; `CancelButton` from `./cancel-button`. Produces: `countIssues(scanUrls: Record<string, ScannedUrl>): number` and `CrawlingPanel(props: { scanProgress: ScanProgress; scanUrls: Record<string, ScannedUrl>; onCancel: () => void })` — both consumed by `pages/audit/progress.tsx`. `countIssues` moves here (not `progress.tsx`) because `CrawlingPanel` needs it internally too — it's the heavier of its two callers, so it owns the export.
- `report-cta.tsx` consumes: `Link` from `@inertiajs/react`; `show` from `@/routes/audit`; `ArrowRightIcon`, `Button` from `@equalsite/ui`. Produces: `ReportCta(props: { auditId: string; issuesCount: number })`.

- [ ] **Step 1: Create `cancel-button.tsx`**

```tsx
import { Button } from '@equalsite/ui';

export function CancelButton({ onCancel }: { onCancel: () => void }) {
    return (
        <Button variant="ghost-destructive" size="sm" onClick={onCancel}>
            cancel audit
        </Button>
    );
}
```

- [ ] **Step 2: Create `waiting-panel.tsx`**

```tsx
import type { ScanQueue } from '@/types';
import { Callout, StatPair } from '@equalsite/ui';
import { CancelButton } from './cancel-button';

export function WaitingPanel({
    scanQueue,
    onCancel,
}: {
    scanQueue: ScanQueue;
    onCancel: () => void;
}) {
    const position = scanQueue.position ?? 0;
    const estMinutes = Math.max(1, Math.round(position * 1.5));
    const totalDots = Math.max(position + 2, 4);

    return (
        <>
            <div className="mb-1 flex items-start justify-between gap-4">
                <h1 className="font-display text-xl font-medium">
                    your audit is in line
                </h1>
                <CancelButton onCancel={onCancel} />
            </div>
            <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
                we'll start crawling as soon as a slot opens up — this page
                updates on its own.
            </p>

            <StatPair
                className="mb-6"
                items={[
                    { value: position, label: 'position in queue' },
                    { value: `~${estMinutes}`, label: 'min estimated wait' },
                ]}
            />

            <div className="mb-6 flex items-center gap-1" aria-hidden="true">
                {Array.from({ length: totalDots }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${i < totalDots - position ? 'bg-indigo-700' : 'bg-slate-200 dark:bg-slate-800'}`}
                    />
                ))}
            </div>

            <Callout>
                2 audits run at a time so every scan gets a full, accurate
                crawl. no need to keep this tab open — bookmark the link to
                check back later.
            </Callout>
        </>
    );
}
```

- [ ] **Step 3: Create `crawling-panel.tsx`**

```tsx
import { pathnameOf } from '@/lib/utils';
import type { ScannedUrl, ScanProgress } from '@/types';
import {
    AlertTriangleIcon,
    CheckCircleIcon,
    MetricCard,
    MinusCircleIcon,
    ProgressBar,
    SpinnerIcon,
    XCircleIcon,
} from '@equalsite/ui';
import { CancelButton } from './cancel-button';

export function countIssues(scanUrls: Record<string, ScannedUrl>) {
    return Object.values(scanUrls).reduce(
        (sum, u) => sum + (u.violationsCount ?? 0),
        0,
    );
}

function FeedRow({ url, entry }: { url: string; entry: ScannedUrl }) {
    const path = pathnameOf(url);

    if (entry.status === 'completed') {
        const count = entry.violationsCount ?? 0;
        const critical = entry.severityBreakdown?.critical ?? 0;
        const serious = entry.severityBreakdown?.serious ?? 0;
        const isCritical = critical > 0;
        const isModerate = !isCritical && serious > 0;

        return (
            <div className="flex animate-in items-center gap-2.5 px-4 py-2.5 fade-in slide-in-from-bottom-1">
                {count === 0 ? (
                    <CheckCircleIcon className="text-emerald-600 dark:text-emerald-400" />
                ) : (
                    <AlertTriangleIcon
                        className={
                            isCritical
                                ? 'text-red-600 dark:text-red-400'
                                : isModerate
                                    ? 'text-yellow-600 dark:text-yellow-400'
                                    : 'text-slate-500'
                        }
                    />
                )}
                <span className="flex-1 truncate text-sm">{path}</span>
                <span
                    className={`text-xs ${count === 0 ? 'text-emerald-600 dark:text-emerald-400' : isCritical ? 'text-red-600 dark:text-red-400' : isModerate ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-500'}`}
                >
                    {count === 0
                        ? 'no issues'
                        : `${count} issue${count !== 1 ? 's' : ''}`}
                </span>
            </div>
        );
    }

    if (entry.status === 'failed') {
        return (
            <div className="flex animate-in items-center gap-2.5 px-4 py-2.5 fade-in slide-in-from-bottom-1">
                <XCircleIcon className="text-red-500" />
                <span className="flex-1 truncate text-sm">{path}</span>
                <span className="text-xs text-red-500">failed</span>
            </div>
        );
    }

    if (entry.status === 'skipped') {
        return (
            <div className="flex animate-in items-center gap-2.5 px-4 py-2.5 fade-in slide-in-from-bottom-1">
                <MinusCircleIcon className="text-slate-400" />
                <span className="flex-1 truncate text-sm">{path}</span>
                <span className="text-xs text-slate-400">skipped</span>
            </div>
        );
    }

    return (
        <div className="flex animate-in items-center gap-2.5 px-4 py-2.5 fade-in slide-in-from-bottom-1">
            <SpinnerIcon className="text-slate-400" />
            <span className="flex-1 truncate text-sm">{path}</span>
            <span className="text-xs text-slate-400">scanning…</span>
        </div>
    );
}

export function CrawlingPanel({
    scanProgress,
    scanUrls,
    onCancel,
}: {
    scanProgress: ScanProgress;
    scanUrls: Record<string, ScannedUrl>;
    onCancel: () => void;
}) {
    const scanned = scanProgress.completedRequests ?? 0;
    const total = scanProgress.totalRequests ?? 0;
    const pct =
        total > 0
            ? Math.round((scanned / total) * 100)
            : (scanProgress.progressPercentage ?? 0);
    const issuesCount = countIssues(scanUrls);

    const orderedUrls = Object.entries(scanUrls).filter(
        ([, e]) => e.status && e.status !== 'started',
    );

    return (
        <>
            <div className="mb-6 flex items-start justify-between gap-4">
                <h1 className="font-display text-xl font-medium">
                    checking every page for accessibility issues
                </h1>
                <CancelButton onCancel={onCancel} />
            </div>

            <ProgressBar value={pct} className="mb-2" />
            <p className="mb-8 text-xs text-slate-400 dark:text-slate-500">
                {scanned} of {total} pages
            </p>

            <div className="mb-8 grid grid-cols-3 gap-3">
                <MetricCard label="pages found" value={total} />
                <MetricCard label="pages scanned" value={scanned} />
                <MetricCard
                    label="issues found so far"
                    value={issuesCount}
                    tone="warning"
                />
            </div>

            <p className="mb-2 text-xs text-slate-400 dark:text-slate-500">
                activity
            </p>
            <div
                role="log"
                aria-live="polite"
                className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800"
            >
                {orderedUrls.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                        starting crawl…
                    </div>
                ) : (
                    orderedUrls.map(([url, entry]) => (
                        <FeedRow key={url} url={url} entry={entry} />
                    ))
                )}
            </div>
        </>
    );
}
```

- [ ] **Step 4: Create `report-cta.tsx`**

```tsx
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
```

- [ ] **Step 5: Replace the full contents of `pages/audit/progress.tsx`**

```tsx
import { Head, router } from '@inertiajs/react';
import { cancel, index, progress } from '@/routes/audit';
import { SCAN_STATUS_BADGE } from '@/lib/audit-status';
import { hostnameOf } from '@/lib/utils';
import {
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
    const badge = SCAN_STATUS_BADGE[scanInfo.status];

    return (
        <>
            <Head title={`Auditing ${domain}`} />

            <main className="mx-auto container py-10">
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
```

This drops `Link` (only `ReportCta` used it), `show` from `@/routes/audit` (only `ReportCta` used it), and the whole `import type { ScannedUrl, ScanProgress, ScanQueue } from '@/types'` block (nothing in the remaining page body references these types directly anymore — `ScanProgressPageProps` already carries the full shape via the hook's exported type) compared to the original file.

- [ ] **Step 6: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/web/resources/js/components/scanning/cancel-button.tsx \
        apps/web/resources/js/components/scanning/waiting-panel.tsx \
        apps/web/resources/js/components/scanning/crawling-panel.tsx \
        apps/web/resources/js/components/scanning/report-cta.tsx \
        apps/web/resources/js/pages/audit/progress.tsx
git commit -m "$(cat <<'EOF'
Extract audit/progress.tsx's panels into components/scanning/

Relocates WaitingPanel, CrawlingPanel (with its private FeedRow),
ReportCta, and the shared CancelButton out of the page file — no
behavior change. progress.tsx now composes these plus the Phase A
useAuditProgressStream hook instead of declaring them inline.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Extract `sites/show.tsx`'s `CurrentAuditCard`

**Files:**
- Create: `apps/web/resources/js/components/scanning/run-new-audit.ts`
- Create: `apps/web/resources/js/components/scanning/current-audit-card.tsx`
- Modify: `apps/web/resources/js/pages/sites/show.tsx`

**Interfaces:**
- `run-new-audit.ts` consumes: `router` from `@inertiajs/react`; `store` from `@/routes/audit`. Produces: `runNewAudit(url: string): void` — consumed by `current-audit-card.tsx` and `pages/sites/show.tsx`.
- `current-audit-card.tsx` consumes: `scanProgressPercent` from `@/lib/audit-status`; `str` from `@/lib/utils`; `useAuditLiveStatus` from `@/hooks/use-audit-live-status`; `ScanProgress`, `ScanQueue`, `ScanStatus` from `@/types`; `Button`, `ProgressBar`, `StatusBadge` from `@equalsite/ui`; `runNewAudit` from `./run-new-audit`. Produces: exported type `CurrentAudit` and `CurrentAuditCard(props: { audit: CurrentAudit })` — both consumed by `pages/sites/show.tsx`.

- [ ] **Step 1: Create `run-new-audit.ts`**

```ts
import { router } from '@inertiajs/react';
import { store } from '@/routes/audit';

export function runNewAudit(url: string) {
    router.post(
        store().url,
        { url, stayOnPage: true },
        { preserveState: true, preserveScroll: true },
    );
}
```

- [ ] **Step 2: Create `current-audit-card.tsx`**

```tsx
import { Link, router } from '@inertiajs/react';
import { show as auditShow, cancel, progress } from '@/routes/audit';
import { scanProgressPercent } from '@/lib/audit-status';
import { str } from '@/lib/utils';
import { useAuditLiveStatus } from '@/hooks/use-audit-live-status';
import type { ScanProgress, ScanQueue, ScanStatus } from '@/types';
import { Button, ProgressBar, StatusBadge } from '@equalsite/ui';
import { runNewAudit } from './run-new-audit';

export type CurrentAudit = {
    auditId: string;
    siteUrl: string;
    status: ScanStatus;
    failureReason: string | null;
    score: number | null;
    issuesFound: number | null;
    scanQueue: ScanQueue | null;
    scanProgress: ScanProgress | null;
};

const CARD_SHELL: Record<ScanStatus, string> = {
    queued: 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-900/10',
    started: 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-900/10',
    completed: 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-900/10',
    cancelled: 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40',
    failed: 'border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-900/10',
};

export function CurrentAuditCard({ audit }: { audit: CurrentAudit }) {
    const { status, scanQueue, scanProgress } = useAuditLiveStatus({
        auditId: audit.auditId,
        initialStatus: audit.status,
        initialScanQueue: audit.scanQueue,
        initialScanProgress: audit.scanProgress,
        reloadProps: ['currentAudit', 'issuesSnapshot', 'scoreTrend', 'history'],
    });

    const handleCancel = () => {
        if (!window.confirm("cancel this audit? it'll stay in your history marked as cancelled.")) {
            return;
        }
        router.delete(cancel(audit.auditId).url);
    };

    const pct = scanProgressPercent(scanProgress);
    const scanned = scanProgress?.completedRequests ?? 0;
    const total = scanProgress?.totalRequests ?? 0;

    return (
        <div className={`mb-8 rounded-lg border p-5 transition-colors ${CARD_SHELL[status]}`}>
            {status === 'queued' && (
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <StatusBadge status="queued" className="mb-1" />
                        <p className="mt-1 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                            position {scanQueue?.position ?? '—'} in queue
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={progress(audit.auditId).url}>view progress</Link>
                        </Button>
                        <Button variant="ghost-destructive" size="sm" onClick={handleCancel}>
                            cancel
                        </Button>
                    </div>
                </div>
            )}

            {status === 'started' && (
                <>
                    <div className="mb-3 flex items-start justify-between gap-4">
                        <StatusBadge status="processing" label="crawling" />
                        <div className="flex shrink-0 items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={progress(audit.auditId).url}>view progress</Link>
                            </Button>
                            <Button variant="ghost-destructive" size="sm" onClick={handleCancel}>
                                cancel
                            </Button>
                        </div>
                    </div>
                    <ProgressBar value={pct} size="sm" className="mb-2" />
                    <p className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                        {scanned} of {total} pages
                    </p>
                </>
            )}

            {status === 'completed' && (
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <StatusBadge status="complete" className="mb-1" />
                        <p className="mt-1 text-sm">
                            score {audit.score} —{' '}
                            {audit.issuesFound} {str.plural('issue', audit.issuesFound ?? 0)} found
                        </p>
                    </div>
                    <Button size="sm" asChild>
                        <Link href={auditShow(audit.auditId, { query: { from: 'site' } }).url}>view report</Link>
                    </Button>
                </div>
            )}

            {status === 'cancelled' && (
                <div className="flex items-center justify-between gap-4">
                    <StatusBadge status="cancelled" />
                    <Button variant="outline" size="sm" onClick={() => runNewAudit(audit.siteUrl)}>
                        run another
                    </Button>
                </div>
            )}

            {status === 'failed' && (
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <StatusBadge status="failed" className="mb-1" />
                        <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-400">
                            {audit.failureReason ?? "couldn't reach the site"}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => runNewAudit(audit.siteUrl)}>
                        try again
                    </Button>
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 3: Replace the full contents of `pages/sites/show.tsx`**

```tsx
import { Head, Link } from '@inertiajs/react';
import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
} from 'recharts';
import { PublicHeader } from '@/components/public-header';
import { dashboard } from '@/routes';
import { show as auditShow, progress } from '@/routes/audit';
import { show, index as sitesIndex } from '@/routes/sites';
import { SCAN_STATUS_BADGE } from '@/lib/audit-status';
import { humanReadableDateTime, relativeTimeUntil, str } from '@/lib/utils';
import {
    CurrentAuditCard,
    type CurrentAudit,
} from '@/components/scanning/current-audit-card';
import { runNewAudit } from '@/components/scanning/run-new-audit';
import type { ScanStatus } from '@/types';
import {
    ArrowRightIcon,
    Button,
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    SectionLabel,
    StatPair,
    StatusBadge,
    SurfacePanel,
    Table,
    TableBody,
    TableCard,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@equalsite/ui';

type HistoryRow = {
    auditId: string;
    status: ScanStatus;
    score: number | null;
    issuesFound: number | null;
    requestedAt: string;
};

type IssuesSnapshot = {
    critical: number;
    quickWins: number;
};

type Rescan = {
    availableAt: string | null;
};

type SiteShowProps = {
    domain: string;
    currentAudit: CurrentAudit;
    issuesSnapshot: IssuesSnapshot | null;
    scoreTrend: HistoryRow[];
    history: HistoryRow[];
    lastAuditUrl: string;
    rescan: Rescan;
};

function ScoreTrendChart({ data }: { data: HistoryRow[] }) {
    const chartData = data.map((row) => ({
        date: new Date(row.requestedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: row.score ?? 0,
    }));

    const chartConfig = {
        score: { label: 'score', color: '#4338CA' },
    } satisfies ChartConfig;

    return (
        <div className="h-40 w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart data={chartData} margin={{ left: -16, right: 12, top: 8, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={32} fontSize={11} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--color-score)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: 'var(--color-score)' }}
                    />
                </LineChart>
            </ChartContainer>
        </div>
    );
}

function HistoryTableRow({ row }: { row: HistoryRow }) {
    const isActive = row.status === 'queued' || row.status === 'started';

    return (
        <TableRow className={isActive ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : undefined}>
            <TableCell>
                <StatusBadge {...SCAN_STATUS_BADGE[row.status]} />
            </TableCell>
            <TableCell className={row.score === null ? 'text-slate-400 dark:text-slate-500' : 'font-medium tabular-nums'}>
                {row.score ?? '—'}
            </TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">
                {row.issuesFound ?? '—'}
            </TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">
                {humanReadableDateTime(row.requestedAt)}
            </TableCell>
            <TableCell className="text-right">
                {row.status === 'completed' && (
                    <Link
                        href={auditShow(row.auditId, { query: { from: 'site' } }).url}
                        className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                    >
                        view report
                    </Link>
                )}
                {isActive && (
                    <Link
                        href={progress(row.auditId).url}
                        className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                    >
                        view progress
                    </Link>
                )}
            </TableCell>
        </TableRow>
    );
}

export default function Show({
    domain,
    currentAudit,
    issuesSnapshot,
    scoreTrend,
    history,
    lastAuditUrl,
    rescan,
}: SiteShowProps) {
    const rescanBlocked =
        rescan.availableAt !== null && new Date(rescan.availableAt).getTime() > Date.now();
    const rescanCaption = rescanBlocked
        ? `next scan available in ${relativeTimeUntil(rescan.availableAt as string)}`
        : undefined;

    return (
        <>
            <Head title={`Audit history for ${domain}`} />

            <main className="mx-auto container py-10">
                <Link
                    href={sitesIndex().url}
                    className="mb-3 inline-block text-xs text-slate-500 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
                >
                    ← your sites
                </Link>

                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-xl font-medium">{domain}</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {history.length} {str.plural('audit', history.length)} run
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Button
                            size="sm"
                            onClick={() => runNewAudit(lastAuditUrl)}
                            disabled={rescanBlocked}
                            title={rescanCaption}
                        >
                            run new audit
                            <ArrowRightIcon />
                        </Button>
                        {rescanCaption && (
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                {rescanCaption}
                            </p>
                        )}
                    </div>
                </div>

                <CurrentAuditCard audit={currentAudit} />

                {scoreTrend.length >= 2 && (
                    <div className="mb-8">
                        <SectionLabel className="mb-2">score trend</SectionLabel>
                        <SurfacePanel padding="sm">
                            <ScoreTrendChart data={scoreTrend} />
                        </SurfacePanel>
                    </div>
                )}

                {issuesSnapshot && (
                    <div className="mb-8">
                        <SectionLabel className="mb-2">open issues</SectionLabel>
                        <StatPair
                            items={[
                                { value: issuesSnapshot.critical, label: 'critical issues' },
                                { value: issuesSnapshot.quickWins, label: 'quick wins available' },
                            ]}
                        />
                    </div>
                )}

                <SectionLabel className="mb-2">history</SectionLabel>
                <TableCard>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-900">
                                <TableHead>status</TableHead>
                                <TableHead>score</TableHead>
                                <TableHead>issues found</TableHead>
                                <TableHead>requested</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((row) => (
                                <HistoryTableRow key={row.auditId} row={row} />
                            ))}
                        </TableBody>
                    </Table>
                </TableCard>
            </main>
        </>
    );
}

Show.layout = (props: SiteShowProps) => ({
    breadcrumbs: [
        { title: 'Sites', href: sitesIndex() },
        { title: props.domain, href: show(props.domain) },
    ],
});
```

This drops `router` (only `runNewAudit`/`CurrentAuditCard`'s cancel handler used it — both moved), `cancel` and `store` from `@/routes/audit` (only used by the moved code), `scanProgressPercent` from `@/lib/audit-status` (only `CurrentAuditCard` used it), `useAuditLiveStatus`, `ProgressBar`, and narrows the `@/types` import down to `ScanStatus` only (this page's own `HistoryRow` type — a *different* type from `audit/index.tsx`'s `HistoryRow` — still needs it; `ScanProgress`/`ScanQueue` don't appear anywhere else in the remaining page).

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/resources/js/components/scanning/run-new-audit.ts \
        apps/web/resources/js/components/scanning/current-audit-card.tsx \
        apps/web/resources/js/pages/sites/show.tsx
git commit -m "$(cat <<'EOF'
Extract sites/show.tsx's CurrentAuditCard into components/scanning/

Relocates CurrentAuditCard (with its private CARD_SHELL) and the
runNewAudit helper — the latter gets its own file since both the
extracted card and the page's own "run new audit" button call it. No
behavior change.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Extract `audit/index.tsx`'s `LiveHistoryRow`

**Files:**
- Create: `apps/web/resources/js/components/scanning/live-history-row.tsx`
- Modify: `apps/web/resources/js/pages/audit/index.tsx`

**Interfaces:**
- `live-history-row.tsx` consumes: `SCAN_STATUS_BADGE` from `@/lib/audit-status`; `useAuditLiveStatus` from `@/hooks/use-audit-live-status`; `ScanProgress`, `ScanQueue`, `ScanStatus` from `@/types`; `StatusBadge`, `TableCell`, `TableRow` from `@equalsite/ui`; `ScanProgressCell` from `./scan-progress-cell` (Task 1). Produces: exported type `HistoryRow` and `LiveHistoryRow(props: { row: HistoryRow })` — both consumed by `pages/audit/index.tsx`.

- [ ] **Step 1: Create `live-history-row.tsx`**

```tsx
import { Link } from '@inertiajs/react';
import { progress } from '@/routes/audit';
import { show as siteShow } from '@/routes/sites';
import { SCAN_STATUS_BADGE } from '@/lib/audit-status';
import { useAuditLiveStatus } from '@/hooks/use-audit-live-status';
import type { ScanProgress, ScanQueue, ScanStatus } from '@/types';
import { StatusBadge, TableCell, TableRow } from '@equalsite/ui';
import { ScanProgressCell } from './scan-progress-cell';

export type HistoryRow = {
    auditId: string;
    domain: string;
    status: ScanStatus;
    score: number | null;
    issuesFound: number | null;
    scanQueue: ScanQueue | null;
    scanProgress: ScanProgress | null;
    requestedAt: string;
};

export function LiveHistoryRow({ row }: { row: HistoryRow }) {
    const { status, scanQueue, scanProgress } = useAuditLiveStatus({
        auditId: row.auditId,
        initialStatus: row.status,
        initialScanQueue: row.scanQueue,
        initialScanProgress: row.scanProgress,
        reloadProps: ['history'],
    });

    return (
        <TableRow className="bg-indigo-50/40 dark:bg-indigo-900/10">
            <TableCell className="font-medium">
                <Link href={siteShow(row.domain).url} className="hover:underline">
                    {row.domain}
                </Link>
            </TableCell>
            <TableCell>
                <StatusBadge {...SCAN_STATUS_BADGE[status]} />
            </TableCell>
            <TableCell colSpan={2}>
                <ScanProgressCell
                    status={status}
                    scanQueue={scanQueue}
                    scanProgress={scanProgress}
                />
            </TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">running now</TableCell>
            <TableCell className="text-right">
                <Link
                    href={progress(row.auditId).url}
                    className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                >
                    view progress
                </Link>
            </TableCell>
        </TableRow>
    );
}
```

- [ ] **Step 2: Replace the full contents of `pages/audit/index.tsx`**

```tsx
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { AuditRequestModal } from '@/components/audit-request-modal';
import { index, show } from '@/routes/audit';
import { show as siteShow } from '@/routes/sites';
import { isActiveStatus, SCAN_STATUS_BADGE } from '@/lib/audit-status';
import { humanReadableDateTime, str } from '@/lib/utils';
import {
    LiveHistoryRow,
    type HistoryRow,
} from '@/components/scanning/live-history-row';
import {
    ArrowRightIcon,
    Button,
    EmptyState,
    SectionLabel,
    StatusBadge,
    Table,
    TableBody,
    TableCard,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@equalsite/ui';

type AuditIndexProps = {
    history: HistoryRow[];
};

function HistoryTableRow({ row }: { row: HistoryRow }) {
    return (
        <TableRow>
            <TableCell className="font-medium">
                <Link href={siteShow(row.domain).url} className="hover:underline">
                    {row.domain}
                </Link>
            </TableCell>
            <TableCell>
                <StatusBadge {...SCAN_STATUS_BADGE[row.status]} />
            </TableCell>
            <TableCell className={row.score === null ? 'text-slate-400 dark:text-slate-500' : 'font-medium tabular-nums'}>
                {row.score ?? '—'}
            </TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">
                {row.issuesFound ?? '—'}
            </TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">
                {humanReadableDateTime(row.requestedAt)}
            </TableCell>
            <TableCell className="text-right">
                {row.status === 'completed' && (
                    <Link
                        href={show(row.auditId).url}
                        className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                    >
                        view report
                    </Link>
                )}
            </TableCell>
        </TableRow>
    );
}

export default function Index({ history }: AuditIndexProps) {
    const [auditFormOpen, setAuditFormOpen] = useState(false);

    return (
        <>
            <Head title="Your audits" />

            <main className="mx-auto container py-10">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-xl font-medium">your audits</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {history.length} {str.plural('audit', history.length)} run across all your sites
                        </p>
                    </div>
                    <Button size="sm" onClick={() => setAuditFormOpen(true)}>
                        run a new audit
                        <ArrowRightIcon />
                    </Button>
                </div>

                {history.length === 0 ? (
                    <EmptyState
                        title="no audits yet"
                        description="run one above and it'll show up here, along with the rest of your audit history."
                    />
                ) : (
                    <>
                        <SectionLabel className="mb-2">history</SectionLabel>
                        <TableCard>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 dark:bg-slate-900">
                                        <TableHead>domain</TableHead>
                                        <TableHead>status</TableHead>
                                        <TableHead>score</TableHead>
                                        <TableHead>issues found</TableHead>
                                        <TableHead>requested</TableHead>
                                        <TableHead />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map((row) =>
                                        isActiveStatus(row.status) ? (
                                            <LiveHistoryRow key={row.auditId} row={row} />
                                        ) : (
                                            <HistoryTableRow key={row.auditId} row={row} />
                                        ),
                                    )}
                                </TableBody>
                            </Table>
                        </TableCard>
                    </>
                )}
            </main>

            <AuditRequestModal open={auditFormOpen} onOpenChange={setAuditFormOpen} />
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Audits',
            href: index(),
        },
    ],
};
```

This drops `useAuditLiveStatus`, `scanProgressPercent`, `ProgressBar` (all only used by the moved `LiveHistoryRow`), the `progress` route import (only `LiveHistoryRow`'s "view progress" link used it — `HistoryTableRow` has no such link), and the whole `import type { ScanProgress, ScanQueue, ScanStatus } from '@/types'` block (the remaining page only references the imported `HistoryRow` type, not these directly) compared to the original file.

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/resources/js/components/scanning/live-history-row.tsx \
        apps/web/resources/js/pages/audit/index.tsx
git commit -m "$(cat <<'EOF'
Extract audit/index.tsx's LiveHistoryRow into components/scanning/

Relocates LiveHistoryRow and its HistoryRow type; it now uses the
shared ScanProgressCell (Task 1) instead of an inline duplicate of
the progress-bar-vs-queue-position block. No behavior change.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Extract `sites/index.tsx`'s `LiveSiteRow`

**Files:**
- Create: `apps/web/resources/js/components/scanning/live-site-row.tsx`
- Modify: `apps/web/resources/js/pages/sites/index.tsx`

**Interfaces:**
- `live-site-row.tsx` consumes: `SCAN_STATUS_BADGE` from `@/lib/audit-status`; `useAuditLiveStatus` from `@/hooks/use-audit-live-status`; `ScanProgress`, `ScanQueue`, `ScanStatus` from `@/types`; `StatusBadge`, `TableCell`, `TableRow` from `@equalsite/ui`; `ScanProgressCell` from `./scan-progress-cell` (Task 1). Produces: exported type `Site` and `LiveSiteRow(props: { site: Site })` — both consumed by `pages/sites/index.tsx`.

**Important — preserve the pre-existing queue-position quirk:** `LiveSiteRow` passes the **static** `site.scanQueue` prop into `ScanProgressCell`, not the hook's live `scanQueue` (it doesn't destructure `scanQueue` from `useAuditLiveStatus` at all) — this matches today's behavior exactly and must not be "fixed" here.

- [ ] **Step 1: Create `live-site-row.tsx`**

```tsx
import { Link } from '@inertiajs/react';
import { progress } from '@/routes/audit';
import { show } from '@/routes/sites';
import { SCAN_STATUS_BADGE } from '@/lib/audit-status';
import { useAuditLiveStatus } from '@/hooks/use-audit-live-status';
import type { ScanProgress, ScanQueue, ScanStatus } from '@/types';
import { StatusBadge, TableCell, TableRow } from '@equalsite/ui';
import { ScanProgressCell } from './scan-progress-cell';

export type Site = {
    domain: string;
    auditCount: number;
    lastRunAt: string;
    auditId: string;
    status: ScanStatus;
    score: number | null;
    scanQueue: ScanQueue | null;
    scanProgress: ScanProgress | null;
};

export function LiveSiteRow({ site }: { site: Site }) {
    const { status, scanProgress } = useAuditLiveStatus({
        auditId: site.auditId,
        initialStatus: site.status,
        initialScanQueue: site.scanQueue,
        initialScanProgress: site.scanProgress,
        reloadProps: ['sites'],
    });

    return (
        <TableRow className="bg-indigo-50/40 dark:bg-indigo-900/10">
            <TableCell className="font-medium">
                <Link href={show(site.domain).url} className="hover:underline">
                    {site.domain}
                </Link>
            </TableCell>
            <TableCell>
                <StatusBadge {...SCAN_STATUS_BADGE[status]} />
            </TableCell>
            <TableCell>
                <ScanProgressCell
                    status={status}
                    scanQueue={site.scanQueue}
                    scanProgress={scanProgress}
                />
            </TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">{site.auditCount}</TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">running now</TableCell>
            <TableCell className="text-right">
                <Link
                    href={progress(site.auditId).url}
                    className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                >
                    view progress
                </Link>
            </TableCell>
        </TableRow>
    );
}
```

- [ ] **Step 2: Replace the full contents of `pages/sites/index.tsx`**

```tsx
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { AuditRequestModal } from '@/components/audit-request-modal';
import { PublicHeader } from '@/components/public-header';
import { dashboard } from '@/routes';
import { index, show } from '@/routes/sites';
import { isActiveStatus, SCAN_STATUS_BADGE } from '@/lib/audit-status';
import { humanReadableDateTime, str } from '@/lib/utils';
import {
    LiveSiteRow,
    type Site,
} from '@/components/scanning/live-site-row';
import {
    ArrowRightIcon,
    Button,
    EmptyState,
    StatusBadge,
    Table,
    TableBody,
    TableCard,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@equalsite/ui';

type SitesIndexProps = {
    sites: Site[];
};

function ScoreCell({ score }: { score: number | null }) {
    if (score === null) {
        return <span className="text-slate-400 dark:text-slate-500">—</span>;
    }

    const tone =
        score >= 90
            ? 'text-emerald-600 dark:text-emerald-400'
            : score >= 60
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400';

    return <span className={`font-medium tabular-nums ${tone}`}>{score}</span>;
}

function SiteRow({ site }: { site: Site }) {
    return (
        <TableRow>
            <TableCell className="font-medium">
                <Link href={show(site.domain).url} className="hover:underline">
                    {site.domain}
                </Link>
            </TableCell>
            <TableCell>
                <StatusBadge {...SCAN_STATUS_BADGE[site.status]} />
            </TableCell>
            <TableCell>
                <ScoreCell score={site.score} />
            </TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">{site.auditCount}</TableCell>
            <TableCell className="text-slate-500 dark:text-slate-400">
                {humanReadableDateTime(site.lastRunAt)}
            </TableCell>
            <TableCell className="text-right">
                <Link
                    href={show(site.domain).url}
                    className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                >
                    view site
                </Link>
            </TableCell>
        </TableRow>
    );
}

export default function Index({ sites }: SitesIndexProps) {
    const [auditFormOpen, setAuditFormOpen] = useState(false);

    return (
        <>
            <Head title="Your sites" />

            <main className="mx-auto container py-10">
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-xl font-medium">your sites</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {sites.length} {str.plural('site', sites.length)} tracked
                        </p>
                    </div>
                    {sites.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setAuditFormOpen(true)}
                            className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                        >
                            run a new audit
                        </button>
                    )}
                </div>

                {sites.length === 0 ? (
                    <EmptyState
                        title="no sites yet"
                        description="run your first audit and it'll show up here, grouped with the rest of that site's history."
                        action={
                            <Button size="sm" onClick={() => setAuditFormOpen(true)}>
                                run your first audit
                                <ArrowRightIcon />
                            </Button>
                        }
                    />
                ) : (
                    <TableCard>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 dark:bg-slate-900">
                                    <TableHead>domain</TableHead>
                                    <TableHead>status</TableHead>
                                    <TableHead>score</TableHead>
                                    <TableHead>audits</TableHead>
                                    <TableHead>last run</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sites.map((site) =>
                                    isActiveStatus(site.status) ? (
                                        <LiveSiteRow key={site.domain} site={site} />
                                    ) : (
                                        <SiteRow key={site.domain} site={site} />
                                    ),
                                )}
                            </TableBody>
                        </Table>
                    </TableCard>
                )}
            </main>

            <AuditRequestModal open={auditFormOpen} onOpenChange={setAuditFormOpen} />
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Sites',
            href: index(),
        },
    ],
};
```

This drops `useAuditLiveStatus`, `scanProgressPercent`, `ProgressBar`, the `progress` route import (only `LiveSiteRow`'s "view progress" link used it), and the whole `import type { ScanProgress, ScanQueue, ScanStatus } from '@/types'` block compared to the original file — all only used by the moved `LiveSiteRow`.

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/resources/js/components/scanning/live-site-row.tsx \
        apps/web/resources/js/pages/sites/index.tsx
git commit -m "$(cat <<'EOF'
Extract sites/index.tsx's LiveSiteRow into components/scanning/

Relocates LiveSiteRow and its Site type; it now uses the shared
ScanProgressCell (Task 1) instead of an inline duplicate of the
progress-bar-vs-queue-position block. Preserves the existing
behavior of passing the static site.scanQueue prop (not the hook's
live value) into that cell, matching today's code exactly.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Full-suite verification and formatting pass

**Files:** none created/modified beyond auto-formatting.

- [ ] **Step 1: Full typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS, zero errors.

- [ ] **Step 2: Lint check**

Run: `pnpm --filter @equalsite/web lintcheck`
Expected: PASS. If it reports unused-import warnings, go back to that
task's file and remove the unused import rather than suppressing the lint
rule — this usually means an import removal in Task 2–5's replacement steps
was missed.

- [ ] **Step 3: Format check and auto-fix**

Run: `pnpm --filter @equalsite/web format:check`
If it reports files needing formatting, run: `pnpm --filter @equalsite/web format`
then re-run `format:check` to confirm it's now clean.

- [ ] **Step 4: Build**

Run: `pnpm --filter @equalsite/web build`
Expected: succeeds with no errors.

- [ ] **Step 5: Grep for any remaining duplication/leftovers this phase should have removed**

Run:
```bash
grep -rln "function WaitingPanel\|function CrawlingPanel\|function FeedRow\|function ReportCta\|function CancelButton\|function CurrentAuditCard\|function LiveHistoryRow\|function LiveSiteRow" apps/web/resources/js/pages/
ls apps/web/resources/js/components/scanning/
```
Expected: the `grep` produces no matches (all these functions now live only
under `components/scanning/`); the `ls` shows exactly 9 files:
`cancel-button.tsx`, `crawling-panel.tsx`, `current-audit-card.tsx`,
`live-history-row.tsx`, `live-site-row.tsx`, `report-cta.tsx`,
`run-new-audit.ts`, `scan-progress-cell.tsx`, `waiting-panel.tsx`.

- [ ] **Step 6: Commit if formatting produced changes**

```bash
git add -A
git status
```
If `format` in Step 3 changed any files, commit them:
```bash
git commit -m "$(cat <<'EOF'
Format frontend-refactor Phase B files

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
If nothing changed, skip this commit.

- [ ] **Step 7: Report to the user**

Summarize for the user: this phase is code-complete and verified via
typecheck/lintcheck/build, but per this repo's CLAUDE.md, no automated
browser verification exists — ask them to eyeball the four affected pages
(`/audit/{id}/progress`, a site's show page, `/audit`, `/sites`) themselves,
particularly while an audit is actively queued/crawling, to confirm the
live-updating UI still renders and updates exactly as before. Mention that
Phase C (reporting organisms) and Phase D (final thinning pass) remain as
separate future work.

---

## Next Phases (not part of this plan)

Phase C (reporting organisms — `ViolationCard`, `ImpactGroup`, score-trend
chart components into `components/reporting/`) and Phase D (final pass
thinning every page down to composition) each get their own brainstorming →
spec → plan cycle, per the staged-rollout decision made at the start of this
refactor.
