# design-sync notes — @equalsite/ui

## Fixes applied

- `[TITLE_UNMAPPED] Chart`: story's `meta.component` is `ChartContainer` (chart.tsx exports several
  named chart primitives, no default `Chart` export) → `titleMap: {"Chart": "ChartContainer"}`.
- `[TITLE_UNMAPPED] Icons`: the "Icons" story is a hand-rolled gallery (`render: () => …` mapping over
  `Object.keys(Icons)`) showing every icon export at once — not itself a usable component, and
  individual icons (`LockIcon`, `ArrowRightIcon`, etc.) have no dedicated stories of their own →
  `titleMap: {"Icons": null}` (excluded from sync; the icon components themselves still ship in the
  bundle, just without dedicated cards).
- `[FONT_MISSING] Inter, Lexend`: packages/ui's Tailwind theme (`src/styles.css`) references
  `--font-sans: Inter` / `--font-display: Lexend` but ships no `@font-face` — the actual fonts are
  self-hosted by `apps/web` at build time via `laravel-vite-plugin/fonts` (`bunny()` provider,
  `apps/web/vite.config.ts`), not by packages/ui itself. Pulled the Basic-Latin-subset woff2s
  (400/500 weight, both families) out of a prior `apps/web` Vite build
  (`apps/web/public/build/assets/*.woff2` + `fonts-*.css`) into `.design-sync/fonts/` +
  `.design-sync/extra-fonts.css`, wired via `cfg.extraFonts`. Also injected the same `@font-face`
  rules into `.design-sync/sb-reference/iframe.html` (the compare oracle) so grading compares
  real-font-vs-real-font, not fallback-vs-fallback (`[FONT_MISSING]` is invisible to compare
  otherwise — see storybook SKILL.md §4a).
- `[GRID_OVERFLOW]` (wide): `ChartContainer`, `Item`, `Tabs`, `Collapsible`, `MetricCard` →
  `cardMode: "column"` in each's `overrides` entry.
- `[GRID_OVERFLOW]` (escape — fixed/portal content): `Sidebar` → `cardMode: "single"`,
  `primaryStory: "Default"`.
- `InputError` story "No Message" is `sb-error` in storybook itself: the component
  (`molecules/input-error.tsx`) legitimately returns `null` when `message` is undefined, so there's
  nothing to render on either side → `overrides.InputError.skip: ["molecules-inputerror--no-message"]`.
  `Default`/`With Field` stories grade clean.
- `InputOTP`'s only story ("Default") is `sb-error` in the reference storybook itself — the
  `input-otp` package's `OTPInput` never settles within the capture timeout (a real storybook-side
  failure, independent of the compiled preview) → `overrides.InputOTP.skip: ["atoms-inputotp--default"]`.
  This leaves InputOTP with zero gradeable stories (floor card only) — if this ever needs a real
  preview, the fix is upstream of design-sync (storybook itself doesn't render this story).
- `Icon`'s "Empty" story (`iconNode: null`) is `sb-error` in storybook itself — the component
  legitimately renders nothing on both sides (by design, per `icon.stories.tsx`) →
  `overrides.Icon.skip: ["atoms-icon--empty"]`. `Default` grades clean.

## Known warnings — triaged, safe to ignore on future syncs

- `[RENDER_THIN] Icon`, `[RENDER_THIN] Spinner`: **false positive**. Both components render a bare
  Lucide SVG icon with no text. The validator's "paints something" check
  (`package-validate.mjs`'s `stylePaints`/`paints`) matches `el.tagName` against
  `/^(IMG|SVG|CANVAS|VIDEO|IFRAME|PICTURE|HR)$/`, but inline `<svg>` elements in an HTML document
  report `tagName` as lowercase `"svg"` (SVG-namespace elements preserve authored case; only HTML
  elements are uppercased) — so the regex never matches and a pure-icon component always reads as
  "paints nothing" even when the screenshot clearly shows the icon. Confirmed by reading
  `_screenshots/atoms__Icon.png` and `_screenshots/atoms__Spinner.png` directly — both render
  correctly. Not fixed via config (no cfg key covers validator internals); `package-validate.mjs`
  isn't a repo-forkable module (it's not among the `libOverrides`-forkable seams). Expect this warn
  on every future rebuild for any icon-only or spinner-only component — it is not a regression.
- `NavigationMenu` grades `close`, permanently, on every future sync: `NavigationMenuLink`'s
  `bg-background` fill (`#fafaf9`, the DS's own `--background` token) is invisible against
  storybook's matching page background but shows as a faint pill against the preview card's
  hardcoded `#fff` canvas (`.ds-sync/lib/emit.mjs`'s card template — app-contract surface, never
  forked, no `cfg` key controls it). Confirmed via pixel-sampling both renders that this is the ONLY
  difference; component styling itself is byte-identical. Not a component defect and not fixable
  from this repo's side — any DS whose `--background`/page-bg token isn't pure white will hit this
  for any borderless `bg-background`-filled element. `Table`'s `Default` story hits the exact same
  cause (it sets no background of its own, so it inherits the page bg) but grades `match`, not
  `close` — a plain table has no visible fill to contrast against the canvas, so the framing
  difference has no visible effect there. Expect this on any future borderless/bg-inheriting
  component; it's the canvas, not the component.
- Badge's `Secondary`/`Outline` stories can LOOK unstyled in a quick glance at the storybook-side raw
  screenshot — the raw crop is tightly cropped around just the pill (e.g. 868×25px), which reads as a
  flat line at normal viewing size. Zoom 4-6x before judging any small/pastel pill-shaped component a
  mismatch; confirmed byte-identical to the preview once zoomed.

## Re-sync risks

- The `.design-sync/extra-fonts.css` + `.design-sync/fonts/*.woff2` are a **frozen snapshot** pulled
  from an `apps/web` build that existed at sync time (2026-07-12). If `apps/web/vite.config.ts`'s
  `bunny()` font weights/families ever change (new weight, new family), this won't auto-update —
  re-derive from a fresh `apps/web` build's `public/build/assets/fonts-*.css`.
- `docsMap`/`docsDir` discovery matched 0/50 components — packages/ui has no separate docs directory
  (no `docsDir`), so per-component descriptions in `.prompt.md` come from JSDoc/heuristics only, not
  hand-written docs. Not a bug, just means there's no docs source to wire up.
