# Frontend Refactor — Phase A: Shared Live-Audit-Status Foundation

## Context

`apps/web/resources/js/pages/` has grown six large page components (2,167 of
3,378 total page lines across `audit/progress.tsx`, `sites/show.tsx`,
`dashboard.tsx`, `audit/show.tsx`, `audit/index.tsx`, `sites/index.tsx`) that
mix routing/data concerns with inline presentational sub-components and
duplicated state-management logic. This is the first of four staged
sub-projects to reorganize the front end:

- **Phase A** (this doc): extract the duplicated live-audit-status logic
  (WebSocket subscriptions, status badge config, progress-percent math) into
  shared hooks/helpers.
- **Phase B**: extract "scanning" organisms (queue/progress/live-row UI) into
  `components/scanning/`.
- **Phase C**: extract "reporting" organisms (violation grouping, score-trend
  charts) into `components/reporting/`.
- **Phase D**: final pass thinning every page down to composition once A–C
  exist.

Each phase gets its own design → plan → implementation cycle. Phase A is
scoped narrowly: relocate and dedupe existing logic with no behavior change,
no new abstractions beyond what today's duplication already justifies.

## Problem

Four page files each hand-roll the same "subscribe to this audit's WS channel
and react to status events" logic, with two distinct patterns:

**Pattern 1 — detail page** (`audit/progress.tsx`, ~160 lines of handler):
owns `scanInfo`/`scanProgress`/`scanQueue`/`scanUrls` as Inertia page props,
listens to all 10 event types including per-page ones (`.audit.page.*`), and
pushes every update via `router.replace({ props: (current) => ... })` so the
props store (and the `.layout` breadcrumbs, which read `scanInfo`) stay in
sync.

**Pattern 2 — list/card rows** (`sites/show.tsx`'s `CurrentAuditCard`,
`audit/index.tsx`'s `LiveHistoryRow`, `sites/index.tsx`'s `LiveSiteRow`):
each keeps local `useState` for `status`/`scanQueue`/`scanProgress`,
subscribes to the 6 top-level events only, and on a terminal event
(`completed`/`failed`/`cancelled`) calls `router.reload({ only: [...] })`
because score/issue counts aren't present in the WS payload.

Additionally, three constants/helpers are copy-pasted verbatim across these
same files (plus `dashboard.tsx` and `audit/show.tsx`):

- `SCAN_STATUS_BADGE` / `STATUS_BADGE` — `Record<ScanStatus, { status, label? }>` mapping to `@equalsite/ui`'s `StatusBadgeStatus` (4 copies).
- `isActiveStatus(status)` — `status === 'queued' || status === 'started'` (3 copies).
- the `scanned/total → pct` progress calculation (4 copies).
- `hostnameOf(url)` (2 copies, in `progress.tsx` and `audit/show.tsx`).

## Design

### `lib/audit-status.ts` (new)

Pure, stateless helpers — no React, no Inertia:

```ts
export const SCAN_STATUS_BADGE: Record<ScanStatus, { status: StatusBadgeStatus; label?: string }>;
export function isActiveStatus(status: ScanStatus): boolean;
export function scanProgressPercent(scanProgress: ScanProgress | null | undefined): number;
```

`scanProgressPercent` replaces the repeated:
```ts
const scanned = scanProgress?.completedRequests ?? 0;
const total = scanProgress?.totalRequests ?? 0;
const pct = total > 0 ? Math.round((scanned / total) * 100) : (scanProgress?.progressPercentage ?? 0);
```
with a single call; callers that also need `scanned`/`total` displayed
(`progress.tsx`, `sites/show.tsx`) still destructure those from
`scanProgress` directly — only the derived `pct` math is shared.

### `lib/utils.ts` (edit)

Add `hostnameOf(url: string): string` and `pathnameOf(url: string): string`
(currently only in `progress.tsx`; `audit/show.tsx` only needs `hostnameOf`).
Both already exist in `progress.tsx` with a try/catch fallback to the raw
input — behavior preserved as-is.

### `hooks/use-audit-live-status.ts` (new)

For the row/card pattern. Owns local state, matches current behavior
exactly:

```ts
function useAuditLiveStatus(params: {
  auditId: string;
  initialStatus: ScanStatus;
  initialScanQueue: ScanQueue | null;
  initialScanProgress: ScanProgress | null;
  reloadProps: string[]; // passed to router.reload({ only })
}): {
  status: ScanStatus;
  scanQueue: ScanQueue | null;
  scanProgress: ScanProgress | null;
};
```

Internally: the same 6-event `useEchoPublic` subscription and branching
currently duplicated in `CurrentAuditCard`/`LiveHistoryRow`/`LiveSiteRow`,
parameterized only by `reloadProps` (today's `only: [...]` arrays differ
slightly per caller — `['currentAudit', 'issuesSnapshot', 'scoreTrend',
'history']` vs `['history']` vs `['sites']`).

### `hooks/use-audit-progress-stream.ts` (new)

For `audit/progress.tsx` only — not a generalized abstraction, just the
existing handler relocated out of the page body:

```ts
function useAuditProgressStream(initial: {
  scanInfo: ScanInfo;
  scanProgress: ScanProgress;
  scanQueue: ScanQueue;
  scanUrls: Record<string, ScannedUrl>;
}): {
  scanInfo: ScanInfo;
  scanProgress: ScanProgress;
  scanQueue: ScanQueue;
  scanUrls: Record<string, ScannedUrl>;
};
```

Internally identical to today's inline handler: subscribes to all 10 events,
calls `router.replace({ preserveScroll: true, props: (current) => ... })`
for each. The hook's return value is derived from the same props Inertia is
already updating — this hook exists so `progress.tsx`'s body no longer
contains ~160 lines of event-branching, not to change how state propagates.

### Migration (this phase only)

- `sites/show.tsx`, `audit/index.tsx`, `sites/index.tsx`: replace inline
  `useState` + `useEchoPublic` blocks with `useAuditLiveStatus`; replace
  local `STATUS_BADGE`/`isActiveStatus` with imports from
  `lib/audit-status.ts`.
- `audit/progress.tsx`: replace the inline handler with
  `useAuditProgressStream`; replace local `SCAN_STATUS_BADGE`,
  `hostnameOf`/`pathnameOf` with shared versions. The page-local
  `countIssues` helper (specific to `scanUrls` shape used only here) stays.
- `dashboard.tsx`: replace its local `STATUS_BADGE`/`isActiveStatus` with the
  shared versions (it has no live WS subscription itself — `sitesPreview` is
  server-rendered snapshot data — so no hook change needed there).
- `audit/show.tsx`: replace local `hostnameOf` with the shared one.

No component extraction in this phase — `WaitingPanel`, `CrawlingPanel`,
`FeedRow`, `CurrentAuditCard`'s JSX, `ViolationCard`, `ImpactGroup`, chart
components, etc. all stay in their current page files, unchanged, until
Phases B/C.

## Data Flow

Unchanged: Soketi → `useEchoPublic` → hook → either local state (row hook) or
Inertia props (progress hook) → re-render. No changes to
`packages/types/src/events.ts`, the crawler worker, or `app/Listeners/` — this
is purely a browser-side reorganization, out of scope for the
crawler-event-contract skill.

## Error Handling

None of this introduces new failure modes. `useEchoPublic` subscription
failures, malformed events, etc. are handled (or not handled) exactly as
today — this phase relocates code, it doesn't add validation or error
boundaries that don't already exist.

## Testing / Verification

`apps/web` has no frontend unit-test infra today (no vitest/testing-library,
no existing `*.test.tsx` files) — introducing one is out of scope for this
phase. Verification:

- `pnpm --filter @equalsite/web typecheck`
- `pnpm --filter @equalsite/web lintcheck`
- `pnpm --filter @equalsite/web build`
- Manual read-through diff per file to confirm behavior parity (event
  branches, `only` arrays, badge labels) against the pre-refactor version.
- Per this repo's CLAUDE.md: no unprompted Docker/Vite stack start or browser
  verification — ask the user to eyeball the live-updating pages (audit
  progress, sites show, audit index, sites index, dashboard) after the diff
  lands.

## Out of Scope

- Any component extraction (Phases B/C).
- Any change to page `.layout` breadcrumb logic.
- Any change to `@equalsite/types` event contracts.
- Introducing React Context — Phase A's state is all local-component or
  Inertia-props-backed; no cross-tree sharing need has appeared yet. If
  Phase B/C surfaces one, it'll be designed then, not preemptively here.
