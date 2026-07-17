# Frontend Refactor — Phase B: Scanning Organisms

## Context

Phase A (merged, PR #4) extracted the duplicated live-audit-status *logic*
(WebSocket subscriptions, status badge config, progress-percent math,
hostname/pathname parsing) into `lib/audit-status.ts`, `lib/utils.ts`, and two
hooks (`useAuditLiveStatus`, `useAuditProgressStream`). It deliberately left
all presentational JSX in place, per its own "no component extraction in this
phase" constraint.

This is Phase B of the same four-stage rollout:

- **Phase A** (done): shared live-audit-status hooks/helpers.
- **Phase B** (this doc): extract "scanning" organisms — the queue/progress/
  live-row presentational components — into `components/scanning/`.
- **Phase C**: extract "reporting" organisms (violation grouping, score-trend
  charts) into `components/reporting/`.
- **Phase D**: final pass thinning every page down to composition once A–C
  exist.

## Problem

Four page files still carry large, page-local presentational components that
now consume Phase A's shared hooks/helpers internally, but the JSX itself
hasn't moved:

- `pages/audit/progress.tsx`: `CancelButton`, `WaitingPanel`, `FeedRow`,
  `CrawlingPanel`, `ReportCta` — all single-occurrence (only used within this
  file), but together make this the largest page file in the app.
- `pages/sites/show.tsx`: `CurrentAuditCard` (single-occurrence) plus a module
  helper `runNewAudit`.
- `pages/audit/index.tsx`: `LiveHistoryRow` (single-occurrence).
- `pages/sites/index.tsx`: `LiveSiteRow` (single-occurrence).

Unlike Phase A, most of these are *not* copy-pasted across files — the
problem here is page-file size and mixing of routing/data concerns with
large inline presentational sub-components, not duplication. The one
genuine exception: the "progress-bar-vs-queue-position" cell inside
`LiveSiteRow` and `LiveHistoryRow` is byte-identical in both files.

`CurrentAuditCard`'s queued/started blocks look superficially similar to that
same cell but are structurally different (different tag — `<p>` vs `<span>`
— different margin/utility classes, and embedded in a different flex layout
alongside header/buttons rather than standing alone in a table cell). Forcing
it onto a shared component would require prop overrides purely to preserve
today's styling, which fights the duplication instead of removing it — so it
stays separate.

## Design

### New directory: `apps/web/resources/js/components/scanning/`

Flat kebab-case files, matching the existing (barrel-free) convention in
`apps/web/resources/js/components/*.tsx`. One file per top-level organism;
small private helpers used by exactly one organism stay colocated in that
organism's file (e.g. `FeedRow` inside `crawling-panel.tsx`).

```
components/scanning/
  cancel-button.tsx       # CancelButton — used by both waiting-panel and crawling-panel
  waiting-panel.tsx       # WaitingPanel
  crawling-panel.tsx      # CrawlingPanel + private FeedRow
  report-cta.tsx          # ReportCta
  current-audit-card.tsx  # CurrentAuditCard + private CARD_SHELL; exports CurrentAudit type
  run-new-audit.ts        # runNewAudit(url: string) — plain fn, Inertia-coupled, not a component
  live-history-row.tsx    # LiveHistoryRow; exports HistoryRow type
  live-site-row.tsx       # LiveSiteRow; exports Site type
  scan-progress-cell.tsx  # NEW: ScanProgressCell, shared by live-site-row + live-history-row
```

`CancelButton` is today a single private function shared by `WaitingPanel`
and `CrawlingPanel` within one file. Splitting those into separate files
turns it into real cross-file duplication if left inline, so it gets its own
file (unchanged 3-line implementation, just relocated).

### `scan-progress-cell.tsx` (new)

The only genuinely new abstraction in this phase — extracts the byte-identical
block currently duplicated in `LiveSiteRow` and `LiveHistoryRow`:

```tsx
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

Call sites keep their own `<TableCell>` wrapper (`LiveHistoryRow` uses
`colSpan={2}`, `LiveSiteRow` doesn't — that wrapping stays where it is, only
the inner branch moves). `LiveSiteRow` continues to pass the **static**
`site.scanQueue` prop (not the hook's live `scanQueue`), preserving the
pre-existing Phase A quirk exactly; `LiveHistoryRow` passes the hook's live
`scanQueue`. Same component, different argument per call site.

`CurrentAuditCard` is *not* a caller of `ScanProgressCell` — its queued/
started JSX moves into `current-audit-card.tsx` unchanged, byte-for-byte.

### Type ownership

Two page-scoped types currently live alongside the component that will move:

- `Site` (today in `sites/index.tsx`) — used by both `LiveSiteRow` (moving)
  and `SiteRow`/`ScoreCell` (staying). `live-site-row.tsx` becomes the
  exporting owner; `sites/index.tsx` imports it back.
- `HistoryRow` (today in `audit/index.tsx`) — used by both `LiveHistoryRow`
  (moving) and `HistoryTableRow` (staying). `live-history-row.tsx` becomes
  the exporting owner; `audit/index.tsx` imports it back.

Note: `sites/show.tsx` has its own **different** `HistoryRow` type (no
`domain`/`scanQueue`/`scanProgress` fields — it's for that site's own audit
history table, unrelated to live rows). It is untouched by this phase and
keeps its current name/definition; the two `HistoryRow` types are unrelated
beyond sharing a name, each page-local.

`CurrentAudit` (today in `sites/show.tsx`, used by both `CurrentAuditCard`
and `SiteShowProps`) follows the same pattern: exported from
`current-audit-card.tsx`, imported back into `sites/show.tsx`.

### `runNewAudit` relocation

`runNewAudit(url: string)` (today a module-level function in
`sites/show.tsx`) is called by both `CurrentAuditCard` (moving) and the
page's own "run new audit" button (staying). It's Inertia-coupled
(`router.post(store().url, ...)`), so it doesn't belong in
`lib/audit-status.ts` (deliberately pure/stateless, no React/Inertia, per
Phase A). It gets its own file, `components/scanning/run-new-audit.ts`
(plain `.ts`, not `.tsx` — no JSX), unchanged implementation. Both
`current-audit-card.tsx` and `sites/show.tsx` import it from there.

### Migration summary per page

- `pages/audit/progress.tsx`: imports `WaitingPanel`, `CrawlingPanel`,
  `ReportCta` from `@/components/scanning/*`. Keeps `countIssues` (page-local,
  specific to this page's `scanUrls` shape) and the default-exported
  `Progress` component / `Progress.layout` unchanged.
- `pages/sites/show.tsx`: imports `CurrentAuditCard`, `CurrentAudit`,
  `runNewAudit` from `@/components/scanning/*`. Keeps `ScoreTrendChart`,
  `HistoryTableRow`, its own distinct `HistoryRow` type, and the
  default-exported `Show` component unchanged.
- `pages/audit/index.tsx`: imports `LiveHistoryRow`, `HistoryRow` from
  `@/components/scanning/live-history-row`. Keeps `HistoryTableRow` and the
  default-exported `Index` component unchanged (it now imports the `HistoryRow`
  type instead of declaring it).
- `pages/sites/index.tsx`: imports `LiveSiteRow`, `Site` from
  `@/components/scanning/live-site-row`. Keeps `ScoreCell`, `SiteRow`, and the
  default-exported `Index` component unchanged (imports the `Site` type
  instead of declaring it).

No behavior change anywhere in this migration — every relocated component
keeps its exact current JSX, props, and (where applicable) the Phase A hooks
it already consumes. `ScanProgressCell` is the only new abstraction, and it
only replaces markup that was already byte-identical in two places.

## Data Flow

Unchanged from Phase A: Soketi → `useEchoPublic` (inside the Phase A hooks) →
either local state (`useAuditLiveStatus`) or Inertia props
(`useAuditProgressStream`) → re-render. This phase only relocates JSX and
type/helper declarations to new files under `components/scanning/`; it does
not touch how data reaches any component.

## Error Handling

None of this introduces new failure modes. Nothing here adds validation or
error boundaries beyond what already exists in the relocated code.

## Testing / Verification

Same approach as Phase A — `apps/web` still has no frontend unit-test infra:

- `pnpm --filter @equalsite/web typecheck`
- `pnpm --filter @equalsite/web lintcheck`
- `pnpm --filter @equalsite/web build`
- Manual read-through diff per file to confirm byte-for-byte JSX parity
  against the pre-refactor version (aside from the one intentional
  `ScanProgressCell` extraction).
- Per this repo's CLAUDE.md: no unprompted Docker/Vite stack start or browser
  verification — ask the user to eyeball the four affected pages (audit
  progress, sites show, audit index, sites index) after the diff lands,
  particularly while an audit is actively queued/crawling.

## Out of Scope

- Phase C (reporting organisms: `ViolationCard`, `ImpactGroup`, score-trend
  chart components).
- Phase D (final page-thinning pass).
- Any change to `@equalsite/types`, `lib/audit-status.ts`, `lib/utils.ts`, or
  the two Phase A hooks (`useAuditLiveStatus`, `useAuditProgressStream`).
- Unifying `CurrentAuditCard`'s queued/started JSX with `ScanProgressCell` —
  the styling differences are pre-existing and not worth prop-override
  complexity to paper over (same reasoning Phase A applied to the
  `sites/index.tsx` queue-position quirk).
- Introducing React Context — still no cross-tree state-sharing need has
  appeared.
