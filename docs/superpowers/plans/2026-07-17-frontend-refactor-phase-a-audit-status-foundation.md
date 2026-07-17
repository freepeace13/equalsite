# Frontend Refactor Phase A: Audit-Status Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deduplicate the live-audit-status logic (WebSocket subscriptions, status-badge config, progress-percent math, hostname/pathname parsing) that is currently copy-pasted across six `apps/web` page files, with zero behavior change.

**Architecture:** Two new hooks (`useAuditLiveStatus` for list/card rows, `useAuditProgressStream` for the full detail page) plus a new `lib/audit-status.ts` module of pure helpers, all following this repo's existing `hooks/use-*.ts` / `lib/*.ts` conventions. Six existing page files are edited to consume these instead of their inline duplicates.

**Tech Stack:** React 19, Inertia.js 3, `@laravel/echo-react` (`useEchoPublic`), TypeScript, `@equalsite/types`, `@equalsite/ui`.

## Global Constraints

- Zero behavior change — every migrated file must render and update identically to today. The one known pre-existing inconsistency (see Task 5) is preserved as-is, not silently fixed.
- No new abstractions beyond deduplicating what's already duplicated 2+ times (per `docs/superpowers/specs/2026-07-17-frontend-refactor-phase-a-audit-status-foundation-design.md`).
- No component extraction in this phase — inline sub-components (`WaitingPanel`, `CrawlingPanel`, `ViolationCard`, etc.) stay where they are.
- No new test tooling — `apps/web` has no vitest/testing-library setup today; verification is `pnpm --filter @equalsite/web typecheck`, `lintcheck`, and `build`.
- Style: 4-space indent, single quotes, semicolons, 80-col print width (`.prettierrc` at repo root) — match surrounding code exactly.
- No changes to `packages/types/src/events.ts`, the crawler worker, or `app/Listeners/` — this phase is browser-only.
- Run all `pnpm` commands from the repo root using `--filter @equalsite/web` (per this repo's Turbo monorepo convention), unless a step says otherwise.

---

### Task 1: `lib/audit-status.ts` — shared status config and helpers

**Files:**
- Create: `apps/web/resources/js/lib/audit-status.ts`

**Interfaces:**
- Consumes: `ScanStatus`, `ScanProgress` from `@/types`; `StatusBadgeStatus` from `@equalsite/ui`.
- Produces: `SCAN_STATUS_BADGE: Record<ScanStatus, { status: StatusBadgeStatus; label?: string }>`, `isActiveStatus(status: ScanStatus): boolean`, `scanProgressPercent(scanProgress: ScanProgress | null | undefined): number` — consumed by Tasks 5–9.

- [ ] **Step 1: Create the file**

```ts
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
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS (no errors — this file isn't imported anywhere yet, but must still compile cleanly on its own).

- [ ] **Step 3: Commit**

```bash
git add apps/web/resources/js/lib/audit-status.ts
git commit -m "$(cat <<'EOF'
Add shared audit-status helpers (SCAN_STATUS_BADGE, isActiveStatus, scanProgressPercent)

First piece of the frontend-refactor Phase A foundation: these three
were previously copy-pasted verbatim across 3-4 page files each.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `lib/utils.ts` — add `hostnameOf` / `pathnameOf`

**Files:**
- Modify: `apps/web/resources/js/lib/utils.ts`

**Interfaces:**
- Produces: `hostnameOf(url: string): string`, `pathnameOf(url: string): string` — consumed by Task 8 (`audit/progress.tsx`) and Task 9 (`audit/show.tsx`).

- [ ] **Step 1: Append the two functions**

Add to the end of `apps/web/resources/js/lib/utils.ts` (after `humanReadableDateTime`):

```ts

export function hostnameOf(url: string): string {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}

export function pathnameOf(url: string): string {
    try {
        return new URL(url).pathname || '/';
    } catch {
        return url;
    }
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/resources/js/lib/utils.ts
git commit -m "$(cat <<'EOF'
Add hostnameOf/pathnameOf to lib/utils

Previously duplicated in audit/progress.tsx (both) and audit/show.tsx
(hostnameOf only).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `hooks/use-audit-live-status.ts` — row/card live-status hook

**Files:**
- Create: `apps/web/resources/js/hooks/use-audit-live-status.ts`

**Interfaces:**
- Consumes: `ScanStatus`, `ScanQueue`, `ScanProgress` from `@/types`; `QueuedWsEvent`, `StartedWsEvent`, `ProgressWsEvent`, `CompletedWsEvent`, `FailedWsEvent`, `CancelledWsEvent` from `@equalsite/types`; `useEchoPublic` from `@laravel/echo-react`; `router` from `@inertiajs/react`.
- Produces: `useAuditLiveStatus(params: UseAuditLiveStatusParams): UseAuditLiveStatusResult` — consumed by Tasks 5, 6, 7.
  ```ts
  type UseAuditLiveStatusParams = {
      auditId: string;
      initialStatus: ScanStatus;
      initialScanQueue: ScanQueue | null;
      initialScanProgress: ScanProgress | null;
      reloadProps: string[];
  };
  type UseAuditLiveStatusResult = {
      status: ScanStatus;
      scanQueue: ScanQueue | null;
      scanProgress: ScanProgress | null;
  };
  ```

- [ ] **Step 1: Create the file**

```ts
import { router } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import { useState } from 'react';
import type {
    CancelledWsEvent,
    CompletedWsEvent,
    FailedWsEvent,
    ProgressWsEvent,
    QueuedWsEvent,
    StartedWsEvent,
} from '@equalsite/types';
import type { ScanProgress, ScanQueue, ScanStatus } from '@/types';

type AuditStatusWsEvent =
    | QueuedWsEvent
    | StartedWsEvent
    | ProgressWsEvent
    | CompletedWsEvent
    | FailedWsEvent
    | CancelledWsEvent;

type UseAuditLiveStatusParams = {
    auditId: string;
    initialStatus: ScanStatus;
    initialScanQueue: ScanQueue | null;
    initialScanProgress: ScanProgress | null;
    /** Passed to `router.reload({ only })` when a terminal event arrives —
     * score/issue counts aren't in the WS payload, so the authoritative
     * values are refetched instead of guessed client-side. */
    reloadProps: string[];
};

type UseAuditLiveStatusResult = {
    status: ScanStatus;
    scanQueue: ScanQueue | null;
    scanProgress: ScanProgress | null;
};

export function useAuditLiveStatus({
    auditId,
    initialStatus,
    initialScanQueue,
    initialScanProgress,
    reloadProps,
}: UseAuditLiveStatusParams): UseAuditLiveStatusResult {
    const [status, setStatus] = useState<ScanStatus>(initialStatus);
    const [scanQueue, setScanQueue] = useState(initialScanQueue);
    const [scanProgress, setScanProgress] = useState(initialScanProgress);

    useEchoPublic<AuditStatusWsEvent>(
        `audit-${auditId}-scanning`,
        [
            '.audit.queued',
            '.audit.started',
            '.audit.progress',
            '.audit.completed',
            '.audit.failed',
            '.audit.cancelled',
        ],
        (e) => {
            if (e.type === 'audit.queued') {
                setScanQueue({ ...(e as QueuedWsEvent).data });
            } else if (e.type === 'audit.started') {
                setStatus('started');
            } else if (e.type === 'audit.progress') {
                setScanProgress({ ...(e as ProgressWsEvent).data });
            } else if (
                e.type === 'audit.completed' ||
                e.type === 'audit.failed' ||
                e.type === 'audit.cancelled'
            ) {
                router.reload({ only: reloadProps });
            }
        },
    );

    return { status, scanQueue, scanProgress };
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/resources/js/hooks/use-audit-live-status.ts
git commit -m "$(cat <<'EOF'
Add useAuditLiveStatus hook for row/card live-status UI

Deduplicates the useState + useEchoPublic block currently hand-rolled
in CurrentAuditCard (sites/show.tsx), LiveHistoryRow (audit/index.tsx),
and LiveSiteRow (sites/index.tsx).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: `hooks/use-audit-progress-stream.ts` — detail-page live-status hook

**Files:**
- Create: `apps/web/resources/js/hooks/use-audit-progress-stream.ts`

**Interfaces:**
- Consumes: `ScanInfo`, `ScanProgress`, `ScanQueue`, `ScannedUrl` from `@/types`; all 10 `*WsEvent` types from `@equalsite/types`; `omit` from `@/lib/obj`; `useEchoPublic` from `@laravel/echo-react`; `router` from `@inertiajs/react`.
- Produces: `AuditProgressStreamProps` (type, re-used by Task 8 as its page-props type), `useAuditProgressStream(auditId: string): void` — consumed by Task 8.

This hook takes only `auditId` — unlike `useAuditLiveStatus`, it doesn't need
to receive or return `scanInfo`/`scanProgress`/`scanQueue`/`scanUrls`. It
subscribes to WS events and pushes every update via
`router.replace({ props: (current) => ... })`, which mutates the Inertia page
props store directly; the page component's default-exported function already
re-renders with the fresh props automatically (this is how `audit/progress.tsx`
works today — the hook just relocates that handler, it doesn't change how
state reaches the component).

- [ ] **Step 1: Create the file**

```ts
import { router } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import type {
    CancelledWsEvent,
    CompletedWsEvent,
    FailedWsEvent,
    PageCompletedWsEvent,
    PageFailedWsEvent,
    PageSkippedWsEvent,
    PageStartedWsEvent,
    ProgressWsEvent,
    QueuedWsEvent,
    StartedWsEvent,
} from '@equalsite/types';
import { omit } from '@/lib/obj';
import type { ScanInfo, ScannedUrl, ScanProgress, ScanQueue } from '@/types';

type AuditProgressWsEvent =
    | QueuedWsEvent
    | StartedWsEvent
    | ProgressWsEvent
    | CompletedWsEvent
    | FailedWsEvent
    | CancelledWsEvent
    | PageStartedWsEvent
    | PageFailedWsEvent
    | PageSkippedWsEvent
    | PageCompletedWsEvent;

export type AuditProgressStreamProps = {
    scanInfo: ScanInfo;
    scanProgress: ScanProgress;
    scanQueue: ScanQueue;
    scanUrls: Record<string, ScannedUrl>;
};

export function useAuditProgressStream(auditId: string): void {
    useEchoPublic<AuditProgressWsEvent>(
        `audit-${auditId}-scanning`,
        [
            '.audit.queued',
            '.audit.started',
            '.audit.progress',
            '.audit.completed',
            '.audit.failed',
            '.audit.cancelled',
            '.audit.page.started',
            '.audit.page.skipped',
            '.audit.page.failed',
            '.audit.page.completed',
        ],
        (e) => {
            if (e.type === 'audit.queued') {
                const data = (e as QueuedWsEvent).data;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanQueue: omit(data, ['auditId']) as ScanQueue,
                    }),
                });
            } else if (e.type === 'audit.started') {
                const { timestamp } = e as StartedWsEvent;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanInfo: {
                            ...current.scanInfo,
                            status: 'started',
                            startedAt: timestamp,
                        },
                    }),
                });
            } else if (e.type === 'audit.progress') {
                const { data } = e as ProgressWsEvent;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanProgress: { ...data },
                    }),
                });
            } else if (e.type === 'audit.completed') {
                const { timestamp } = e as CompletedWsEvent;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanInfo: {
                            ...current.scanInfo,
                            status: 'completed',
                            completedAt: timestamp,
                        },
                    }),
                });
            } else if (e.type === 'audit.failed') {
                const { error } = (e as FailedWsEvent).data;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanInfo: {
                            ...current.scanInfo,
                            status: 'failed',
                            failureReason: error,
                        },
                    }),
                });
            } else if (e.type === 'audit.cancelled') {
                const { timestamp } = e as CancelledWsEvent;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanInfo: {
                            ...current.scanInfo,
                            status: 'cancelled',
                            cancelledAt: timestamp,
                        },
                    }),
                });
            } else if (e.type === 'audit.page.started') {
                const { data, timestamp } = e as PageStartedWsEvent;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanUrls: {
                            ...current.scanUrls,
                            [data.pageUrl]: {
                                status: 'started',
                                attemptsCount: data.attemptsCount,
                                startedAt: timestamp,
                            },
                        },
                    }),
                });
            } else if (e.type === 'audit.page.skipped') {
                const { data, timestamp } = e as PageSkippedWsEvent;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanUrls: {
                            ...current.scanUrls,
                            [data.pageUrl]: {
                                status: 'skipped',
                                skippingReason: data.reason,
                                skippedAt: timestamp,
                            },
                        },
                    }),
                });
            } else if (e.type === 'audit.page.failed') {
                const { data, timestamp } = e as PageFailedWsEvent;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanUrls: {
                            ...current.scanUrls,
                            [data.pageUrl]: {
                                ...current.scanUrls[data.pageUrl],
                                status: 'failed',
                                errorMessage: data.errorMessage,
                                attemptsCount: data.attemptsCount,
                                failedAt: timestamp,
                            },
                        },
                    }),
                });
            } else if (e.type === 'audit.page.completed') {
                const { data, timestamp } = e as PageCompletedWsEvent;
                router.replace<AuditProgressStreamProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanUrls: {
                            ...current.scanUrls,
                            [data.pageUrl]: {
                                ...current.scanUrls[data.pageUrl],
                                status: 'completed',
                                violationsCount: data.violationsCount,
                                passesCount: data.passesCount,
                                severityBreakdown: data.severityBreakdown,
                                completedAt: timestamp,
                            },
                        },
                    }),
                });
            }
        },
    );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/resources/js/hooks/use-audit-progress-stream.ts
git commit -m "$(cat <<'EOF'
Add useAuditProgressStream hook for the audit detail/progress page

Relocates the ~160-line inline WS handler from audit/progress.tsx
(all 10 event types, including per-page ones) with identical
behavior — still updates via router.replace on the Inertia props
store.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Migrate `pages/sites/index.tsx`

**Files:**
- Modify: `apps/web/resources/js/pages/sites/index.tsx`

**Interfaces:**
- Consumes: `SCAN_STATUS_BADGE`, `isActiveStatus`, `scanProgressPercent` from `@/lib/audit-status` (Task 1); `useAuditLiveStatus` from `@/hooks/use-audit-live-status` (Task 3).

**Important — preserve a pre-existing quirk:** today's `LiveSiteRow` does
*not* track `scanQueue` live (no `.audit.queued` handler, no `scanQueue`
state) — it displays the static `site.scanQueue?.position` prop even while
subscribed. This differs from `audit/index.tsx`'s `LiveHistoryRow` and
`sites/show.tsx`'s `CurrentAuditCard`, which do track it live. That
inconsistency predates this refactor; per the "zero behavior change"
constraint, do **not** fix it here — call `useAuditLiveStatus` as usual (it
always tracks `scanQueue` internally) but keep rendering `site.scanQueue?.position`
(the prop), not the hook's returned `scanQueue`. Mention this to the user
after this task as a possible follow-up, not something to silently change.

- [ ] **Step 1: Replace the imports (lines 1–33)**

Replace:
```ts
import { Head, Link, router } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import { useState } from 'react';
import { AuditRequestModal } from '@/components/audit-request-modal';
import { PublicHeader } from '@/components/public-header';
import { dashboard } from '@/routes';
import { progress } from '@/routes/audit';
import { index, show } from '@/routes/sites';
import { humanReadableDateTime, str } from '@/lib/utils';
import type { ScanProgress, ScanQueue, ScanStatus } from '@/types';
import type {
    CancelledWsEvent,
    CompletedWsEvent,
    FailedWsEvent,
    ProgressWsEvent,
    QueuedWsEvent,
    StartedWsEvent,
} from '@equalsite/types';
import {
    ArrowRightIcon,
    Button,
    EmptyState,
    ProgressBar,
    StatusBadge,
    type StatusBadgeStatus,
    Table,
    TableBody,
    TableCard,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@equalsite/ui';
```

With:
```ts
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { AuditRequestModal } from '@/components/audit-request-modal';
import { PublicHeader } from '@/components/public-header';
import { dashboard } from '@/routes';
import { progress } from '@/routes/audit';
import { index, show } from '@/routes/sites';
import {
    isActiveStatus,
    SCAN_STATUS_BADGE,
    scanProgressPercent,
} from '@/lib/audit-status';
import { humanReadableDateTime, str } from '@/lib/utils';
import { useAuditLiveStatus } from '@/hooks/use-audit-live-status';
import type { ScanProgress, ScanQueue, ScanStatus } from '@/types';
import {
    ArrowRightIcon,
    Button,
    EmptyState,
    ProgressBar,
    StatusBadge,
    Table,
    TableBody,
    TableCard,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@equalsite/ui';
```

- [ ] **Step 2: Remove the local `WsEvents` type, `STATUS_BADGE` const, and `isActiveStatus` function**

Delete this block entirely (it's now imported):
```ts
type WsEvents =
    | QueuedWsEvent
    | StartedWsEvent
    | ProgressWsEvent
    | CompletedWsEvent
    | FailedWsEvent
    | CancelledWsEvent;

const STATUS_BADGE: Record<ScanStatus, { status: StatusBadgeStatus; label?: string }> = {
    queued: { status: 'queued' },
    started: { status: 'processing', label: 'crawling' },
    completed: { status: 'complete' },
    failed: { status: 'failed' },
    cancelled: { status: 'cancelled' },
};

function isActiveStatus(status: ScanStatus) {
    return status === 'queued' || status === 'started';
}
```

- [ ] **Step 3: Replace `LiveSiteRow`**

Replace the whole `LiveSiteRow` function with:
```tsx
function LiveSiteRow({ site }: { site: Site }) {
    const { status, scanProgress } = useAuditLiveStatus({
        auditId: site.auditId,
        initialStatus: site.status,
        initialScanQueue: site.scanQueue,
        initialScanProgress: site.scanProgress,
        reloadProps: ['sites'],
    });

    const pct = scanProgressPercent(scanProgress);
    const scanned = scanProgress?.completedRequests ?? 0;
    const total = scanProgress?.totalRequests ?? 0;

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
                {status === 'started' ? (
                    <div className="min-w-32">
                        <ProgressBar value={pct} size="sm" className="mb-1" />
                        <p className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                            {scanned} of {total} pages
                        </p>
                    </div>
                ) : (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        position {site.scanQueue?.position ?? '—'} in queue
                    </span>
                )}
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

- [ ] **Step 4: Update `SiteRow`'s badge reference**

In `SiteRow`, replace `<StatusBadge {...STATUS_BADGE[site.status]} />` with `<StatusBadge {...SCAN_STATUS_BADGE[site.status]} />`.

- [ ] **Step 5: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/resources/js/pages/sites/index.tsx
git commit -m "$(cat <<'EOF'
Migrate sites/index.tsx to shared audit-status hook and helpers

LiveSiteRow now uses useAuditLiveStatus instead of a hand-rolled
useState + useEchoPublic block. Preserves the existing behavior of
displaying the static scanQueue prop (not a live value) for queue
position, matching today's code exactly.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Migrate `pages/audit/index.tsx`

**Files:**
- Modify: `apps/web/resources/js/pages/audit/index.tsx`

**Interfaces:**
- Consumes: `SCAN_STATUS_BADGE`, `isActiveStatus`, `scanProgressPercent` from `@/lib/audit-status`; `useAuditLiveStatus` from `@/hooks/use-audit-live-status`.

- [ ] **Step 1: Replace the imports (lines 1–32)**

Replace:
```ts
import { Head, Link, router } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import { useState } from 'react';
import { AuditRequestModal } from '@/components/audit-request-modal';
import { index, progress, show } from '@/routes/audit';
import { show as siteShow } from '@/routes/sites';
import { humanReadableDateTime, str } from '@/lib/utils';
import type { ScanProgress, ScanQueue, ScanStatus } from '@/types';
import type {
    CancelledWsEvent,
    CompletedWsEvent,
    FailedWsEvent,
    ProgressWsEvent,
    QueuedWsEvent,
    StartedWsEvent,
} from '@equalsite/types';
import {
    ArrowRightIcon,
    Button,
    EmptyState,
    ProgressBar,
    SectionLabel,
    StatusBadge,
    type StatusBadgeStatus,
    Table,
    TableBody,
    TableCard,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@equalsite/ui';
```

With:
```ts
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { AuditRequestModal } from '@/components/audit-request-modal';
import { index, progress, show } from '@/routes/audit';
import { show as siteShow } from '@/routes/sites';
import {
    isActiveStatus,
    SCAN_STATUS_BADGE,
    scanProgressPercent,
} from '@/lib/audit-status';
import { humanReadableDateTime, str } from '@/lib/utils';
import { useAuditLiveStatus } from '@/hooks/use-audit-live-status';
import type { ScanProgress, ScanQueue, ScanStatus } from '@/types';
import {
    ArrowRightIcon,
    Button,
    EmptyState,
    ProgressBar,
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
```

- [ ] **Step 2: Remove the local `WsEvents` type, `STATUS_BADGE` const, and `isActiveStatus` function**

Delete:
```ts
type WsEvents =
    | QueuedWsEvent
    | StartedWsEvent
    | ProgressWsEvent
    | CompletedWsEvent
    | FailedWsEvent
    | CancelledWsEvent;

const STATUS_BADGE: Record<ScanStatus, { status: StatusBadgeStatus; label?: string }> = {
    queued: { status: 'queued' },
    started: { status: 'processing', label: 'crawling' },
    completed: { status: 'complete' },
    failed: { status: 'failed' },
    cancelled: { status: 'cancelled' },
};

function isActiveStatus(status: ScanStatus) {
    return status === 'queued' || status === 'started';
}
```

- [ ] **Step 3: Replace `LiveHistoryRow`**

```tsx
function LiveHistoryRow({ row }: { row: HistoryRow }) {
    const { status, scanQueue, scanProgress } = useAuditLiveStatus({
        auditId: row.auditId,
        initialStatus: row.status,
        initialScanQueue: row.scanQueue,
        initialScanProgress: row.scanProgress,
        reloadProps: ['history'],
    });

    const pct = scanProgressPercent(scanProgress);
    const scanned = scanProgress?.completedRequests ?? 0;
    const total = scanProgress?.totalRequests ?? 0;

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
                {status === 'started' ? (
                    <div className="min-w-32">
                        <ProgressBar value={pct} size="sm" className="mb-1" />
                        <p className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                            {scanned} of {total} pages
                        </p>
                    </div>
                ) : (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        position {scanQueue?.position ?? '—'} in queue
                    </span>
                )}
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

- [ ] **Step 4: Update `HistoryTableRow`'s badge reference**

Replace `<StatusBadge {...STATUS_BADGE[row.status]} />` with `<StatusBadge {...SCAN_STATUS_BADGE[row.status]} />`.

- [ ] **Step 5: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/resources/js/pages/audit/index.tsx
git commit -m "$(cat <<'EOF'
Migrate audit/index.tsx to shared audit-status hook and helpers

LiveHistoryRow now uses useAuditLiveStatus instead of a hand-rolled
useState + useEchoPublic block. No behavior change.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Migrate `pages/sites/show.tsx`

**Files:**
- Modify: `apps/web/resources/js/pages/sites/show.tsx`

**Interfaces:**
- Consumes: `SCAN_STATUS_BADGE`, `scanProgressPercent` from `@/lib/audit-status`; `useAuditLiveStatus` from `@/hooks/use-audit-live-status`.

- [ ] **Step 1: Replace the imports (lines 1–45)**

Replace:
```ts
import { Head, Link, router } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import { useState } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
} from 'recharts';
import { PublicHeader } from '@/components/public-header';
import { dashboard } from '@/routes';
import { show as auditShow, cancel, progress, store } from '@/routes/audit';
import { show, index as sitesIndex } from '@/routes/sites';
import { humanReadableDateTime, relativeTimeUntil, str } from '@/lib/utils';
import type { ScanProgress, ScanQueue, ScanStatus } from '@/types';
import type {
    CancelledWsEvent,
    CompletedWsEvent,
    FailedWsEvent,
    ProgressWsEvent,
    QueuedWsEvent,
    StartedWsEvent,
} from '@equalsite/types';
import {
    ArrowRightIcon,
    Button,
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ProgressBar,
    SectionLabel,
    StatPair,
    StatusBadge,
    type StatusBadgeStatus,
    SurfacePanel,
    Table,
    TableBody,
    TableCard,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@equalsite/ui';
```

With:
```ts
import { Head, Link, router } from '@inertiajs/react';
import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
} from 'recharts';
import { PublicHeader } from '@/components/public-header';
import { dashboard } from '@/routes';
import { show as auditShow, cancel, progress, store } from '@/routes/audit';
import { show, index as sitesIndex } from '@/routes/sites';
import { SCAN_STATUS_BADGE, scanProgressPercent } from '@/lib/audit-status';
import { humanReadableDateTime, relativeTimeUntil, str } from '@/lib/utils';
import { useAuditLiveStatus } from '@/hooks/use-audit-live-status';
import type { ScanProgress, ScanQueue, ScanStatus } from '@/types';
import {
    ArrowRightIcon,
    Button,
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ProgressBar,
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
```

Note: `router` is still used elsewhere in this file (`runNewAudit`, `handleCancel`), so it stays imported — unlike Tasks 5/6 where it became unused. `useState` becomes fully unused in this file after Step 2 (it was only used inside `CurrentAuditCard`) — it is dropped here for that reason.

- [ ] **Step 2: Remove the local `WsEvents` type and `STATUS_BADGE` const**

Delete (keep `CARD_SHELL` — it's unique to this file):
```ts
type WsEvents =
    | QueuedWsEvent
    | StartedWsEvent
    | ProgressWsEvent
    | CompletedWsEvent
    | FailedWsEvent
    | CancelledWsEvent;

const STATUS_BADGE: Record<ScanStatus, { status: StatusBadgeStatus; label?: string }> = {
    queued: { status: 'queued' },
    started: { status: 'processing', label: 'crawling' },
    completed: { status: 'complete' },
    failed: { status: 'failed' },
    cancelled: { status: 'cancelled' },
};
```

- [ ] **Step 3: Replace `CurrentAuditCard`**

```tsx
function CurrentAuditCard({ audit }: { audit: CurrentAudit }) {
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

- [ ] **Step 4: Update `HistoryTableRow`'s badge reference**

Replace `<StatusBadge {...STATUS_BADGE[row.status]} />` with `<StatusBadge {...SCAN_STATUS_BADGE[row.status]} />`.

- [ ] **Step 5: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/resources/js/pages/sites/show.tsx
git commit -m "$(cat <<'EOF'
Migrate sites/show.tsx to shared audit-status hook and helpers

CurrentAuditCard now uses useAuditLiveStatus instead of a hand-rolled
useState + useEchoPublic block. No behavior change.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Migrate `pages/audit/progress.tsx`

**Files:**
- Modify: `apps/web/resources/js/pages/audit/progress.tsx`

**Interfaces:**
- Consumes: `SCAN_STATUS_BADGE` from `@/lib/audit-status`; `hostnameOf`, `pathnameOf` from `@/lib/utils`; `useAuditProgressStream`, `type AuditProgressStreamProps` from `@/hooks/use-audit-progress-stream`.

This is the largest single change: the ~160-line inline `useEchoPublic`
handler collapses to one hook call.

- [ ] **Step 1: Replace the imports and the header section down through `countIssues` (lines 1–87)**

Replace everything from the top of the file through the end of the local
`countIssues` function (i.e. lines 1–87 of the original file — this spans the
imports, `ScanProgressPageProps`/`WsEvents` types, `SCAN_STATUS_BADGE` const,
`hostnameOf`, `pathnameOf`, and `countIssues`) with:

```tsx
import { Head, Link, router } from '@inertiajs/react';
import { cancel, index, progress, show } from '@/routes/audit';
import { SCAN_STATUS_BADGE } from '@/lib/audit-status';
import { hostnameOf, pathnameOf } from '@/lib/utils';
import {
    useAuditProgressStream,
    type AuditProgressStreamProps as ScanProgressPageProps,
} from '@/hooks/use-audit-progress-stream';
import type { ScannedUrl, ScanProgress, ScanQueue } from '@/types';
import {
    AlertTriangleIcon,
    ArrowRightIcon,
    Button,
    Callout,
    CheckCircleIcon,
    GlobeIcon,
    MetricCard,
    MinusCircleIcon,
    ProgressBar,
    SpinnerIcon,
    StatPair,
    StatusBadge,
    XCircleIcon,
} from '@equalsite/ui';

function countIssues(scanUrls: Record<string, ScannedUrl>) {
    return Object.values(scanUrls).reduce(
        (sum, u) => sum + (u.violationsCount ?? 0),
        0,
    );
}
```

This removes: the `useEchoPublic` import, `PublicHeader` import (verify it
was unused already — it is; `progress.tsx` never rendered it, confirm by
searching the rest of the file before deleting the import), the `omit`
import, the `type { ScanInfo, ... }` import (no longer needed directly), the
`@equalsite/types` WS-event-type import block, the local `ScanProgressPageProps`
type, the local `WsEvents` type, and the local `SCAN_STATUS_BADGE` const,
`hostnameOf`, and `pathnameOf` — all now imported from shared modules.
`countIssues` is reproduced verbatim in the replacement block above (same
body, same position in the file) since it's specific to this page's
`scanUrls` shape and isn't part of the Phase A dedup — do not declare it a
second time further down the file.

- [ ] **Step 2: Verify `PublicHeader` really is unused in this file**

Run: `grep -n "PublicHeader" apps/web/resources/js/pages/audit/progress.tsx`
Expected: no matches after Step 1 (confirms it's safe that the import was
dropped). If it *is* used somewhere in the JSX, re-add the import — don't
silently drop a used component.

- [ ] **Step 3: Replace the WS-handling block in the default-exported component**

Find:
```tsx
export default function Progress({
    scanInfo,
    scanProgress,
    scanQueue,
    scanUrls,
}: ScanProgressPageProps) {
    const domain = hostnameOf(scanInfo.siteUrl);

    useEchoPublic<WsEvents>(
        `audit-${scanInfo.auditId}-scanning`,
        [
            /* ... */
        ],
        (e) => {
            /* ~150 lines of branches */
        },
    );

    const handleCancel = () => {
```

Replace the `useEchoPublic<WsEvents>(...)` call (everything from
`useEchoPublic<WsEvents>(` through its closing `);`) with:

```tsx
    useAuditProgressStream(scanInfo.auditId);
```

So the function now reads:
```tsx
export default function Progress({
    scanInfo,
    scanProgress,
    scanQueue,
    scanUrls,
}: ScanProgressPageProps) {
    const domain = hostnameOf(scanInfo.siteUrl);

    useAuditProgressStream(scanInfo.auditId);

    const handleCancel = () => {
```

Everything below `handleCancel` (the rest of the component body, and
`Progress.layout` at the bottom) is unchanged — it already refers to
`SCAN_STATUS_BADGE`, `scanInfo`, `scanProgress`, `scanQueue`, `scanUrls`,
`hostnameOf`, `pathnameOf`, `countIssues` by the same names, which now
resolve to the shared imports/hook instead of local declarations.

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/resources/js/pages/audit/progress.tsx
git commit -m "$(cat <<'EOF'
Migrate audit/progress.tsx to useAuditProgressStream

Collapses the ~160-line inline WS event handler into a single hook
call. No behavior change — same 10 event types, same router.replace
props-updater pattern.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Migrate `pages/dashboard.tsx` and `pages/audit/show.tsx`

**Files:**
- Modify: `apps/web/resources/js/pages/dashboard.tsx`
- Modify: `apps/web/resources/js/pages/audit/show.tsx`

**Interfaces:**
- Consumes: `SCAN_STATUS_BADGE`, `isActiveStatus` from `@/lib/audit-status`; `hostnameOf` from `@/lib/utils`.

Neither file has a live WS subscription (`dashboard.tsx`'s `sitesPreview` is
server-rendered snapshot data; `audit/show.tsx` is a static report view), so
only the duplicated constant/helper references change.

- [ ] **Step 1: `dashboard.tsx` — remove local `STATUS_BADGE`/`isActiveStatus`, import shared versions**

Replace:
```ts
const STATUS_BADGE: Record<
    ScanStatus,
    { status: StatusBadgeStatus; label?: string }
> = {
    queued: { status: 'queued' },
    started: { status: 'processing', label: 'crawling' },
    completed: { status: 'complete' },
    failed: { status: 'failed' },
    cancelled: { status: 'cancelled' },
};

function isActiveStatus(status: ScanStatus) {
    return status === 'queued' || status === 'started';
}
```
With nothing (delete the block).

Add to the imports (near the other `@/lib/*` imports):
```ts
import { isActiveStatus, SCAN_STATUS_BADGE } from '@/lib/audit-status';
```

Then replace every `STATUS_BADGE[...]` reference in this file (in
`SitePreviewCard`) with `SCAN_STATUS_BADGE[...]`. `type StatusBadgeStatus`
import from `@equalsite/ui` becomes unused after this — remove it from that
import line; `ScanStatus` type import from `@/types` stays (still used by
the `SitePreview` type).

- [ ] **Step 2: `audit/show.tsx` — remove local `hostnameOf`, import shared version**

Replace:
```ts
function hostnameOf(url: string) {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}
```
With nothing (delete it).

Add to the imports:
```ts
import { hostnameOf } from '@/lib/utils';
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/resources/js/pages/dashboard.tsx apps/web/resources/js/pages/audit/show.tsx
git commit -m "$(cat <<'EOF'
Migrate dashboard.tsx and audit/show.tsx to shared audit-status helpers

Both files only needed the shared constant/helper — neither has a
live WS subscription. No behavior change.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Full-suite verification and formatting pass

**Files:** none created/modified beyond auto-formatting.

- [ ] **Step 1: Full typecheck**

Run: `pnpm --filter @equalsite/web typecheck`
Expected: PASS, zero errors.

- [ ] **Step 2: Lint check**

Run: `pnpm --filter @equalsite/web lintcheck`
Expected: PASS. If it reports unused-import warnings, fix them (this
usually means Step 1 of some earlier task missed dropping an import — go
back to that task's file and remove the unused import rather than
suppressing the lint rule).

- [ ] **Step 3: Format check and auto-fix**

Run: `pnpm --filter @equalsite/web format:check`
If it reports files needing formatting, run: `pnpm --filter @equalsite/web format`
then re-run `format:check` to confirm it's now clean.

- [ ] **Step 4: Build**

Run: `pnpm --filter @equalsite/web build`
Expected: succeeds with no errors.

- [ ] **Step 5: Grep for any remaining duplication this phase should have removed**

Run:
```bash
grep -rn "function isActiveStatus" apps/web/resources/js/pages/
grep -rn "function hostnameOf" apps/web/resources/js/pages/
grep -rn "const STATUS_BADGE" apps/web/resources/js/pages/
grep -rn "const SCAN_STATUS_BADGE" apps/web/resources/js/pages/
```
Expected: no matches for any of these four (all should now live only in
`lib/audit-status.ts` / `lib/utils.ts`).

- [ ] **Step 6: Commit if formatting produced changes**

```bash
git add -A
git status
```
If `format` in Step 3 changed any files, commit them:
```bash
git commit -m "$(cat <<'EOF'
Format frontend-refactor Phase A files

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
If nothing changed, skip this commit.

- [ ] **Step 7: Report to the user**

Summarize for the user: this phase is code-complete and verified via
typecheck/lintcheck/build, but per this repo's CLAUDE.md, no automated
browser verification exists — ask them to eyeball the live-updating pages
(`/audit/{id}/progress`, a site's show page, `/audit`, `/sites`,
`/dashboard`) themselves, particularly while an audit is actively
queued/crawling, to confirm the live status UI still updates exactly as
before. Also flag the `sites/index.tsx` queue-position inconsistency
documented in Task 5 as a possible small follow-up (out of scope for this
phase).

---

## Next Phases (not part of this plan)

Once this phase lands, Phase B (scanning organisms — `WaitingPanel`,
`CrawlingPanel`, `FeedRow`, `CurrentAuditCard`'s JSX, `LiveHistoryRow`/`LiveSiteRow`'s
JSX into `components/scanning/`) and Phase C (reporting organisms —
`ViolationCard`, `ImpactGroup`, chart components into `components/reporting/`)
each get their own brainstorming → spec → plan cycle, per the staged-rollout
decision made at the start of this refactor.
