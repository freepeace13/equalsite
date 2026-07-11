# @equalsite/ui

Shared React component library for Equalsite, structured as an [Atomic Design](https://codebrahma.com/atomic-design-react-component-structure-guide/)
hierarchy: shadcn-style **atoms** (Button, Card, Dialog, Sidebar, Table, …) and small, single-purpose
**molecules** built from them (StatusBadge, SeverityBadge, MetricCard, Callout, AlertError, …). Built on
Radix/cva conventions, developed and visually verified in Storybook, and consumed by `apps/web`'s React
frontend via `"@equalsite/ui": "workspace:*"`.

The goal of this package is to stop UI patterns (status pills, severity badges, progress bars, metric
tiles, banners, disclosures, and now the full set of shadcn primitives) from being hand-rolled or
duplicated across `apps/web` — see `docs/style-guide.md` for the brand rules every component here must
satisfy.

**This package is the single source of shadcn primitives for the monorepo.** `apps/web` has no local
`resources/js/components/ui/` directory anymore and no `components.json` of its own — every shadcn atom
lives here and is imported from `@equalsite/ui`. Run the shadcn CLI from `packages/ui/` when adding a new
primitive.

---

## Responsibilities

| Concern | Implementation |
|---------|----------------|
| Base primitives (atoms) | shadcn-style components (`cva` variants, `cn()` merge helper, Radix where needed) |
| Composed patterns (molecules) | Small, single-purpose compositions of atoms — no domain or router coupling |
| Brand compliance | Every color/spacing/radius choice maps to `docs/style-guide.md` tokens |
| Visual development & review | Storybook (`@storybook/react-vite`), one story file per component |
| Accessibility | `@storybook/addon-a11y`, ARIA states baked into components (not left to callers) |
| Distribution | Dual ESM/CJS build (tsup) + a `source` export condition for zero-rebuild dev |

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`), `class-variance-authority`, `tailwind-merge` |
| Primitives | Radix UI (avatar, checkbox, dialog, dropdown-menu, label, navigation-menu, popover, progress, scroll-area, select, separator, slot, tabs, toggle, toggle-group, tooltip) |
| Dev/docs | Storybook 10 (`@storybook/react-vite`, `@storybook/addon-a11y`) |
| Build | tsup (dual ESM/CJS + `.d.ts`) |
| Config base | `@equalsite/tsconfig/react.json`, `@equalsite/eslint-config/react` |

---

## Package structure

```
packages/ui/
├── components.json              # shadcn CLI config — the only one in the monorepo
├── .storybook/
│   ├── main.ts                  # story glob (recursive, no change needed per subfolder), "@" alias → src/
│   └── preview.ts               # imports src/styles.css globally
├── src/
│   ├── index.ts                 # barrel — every public export lives here, explicitly
│   ├── styles.css               # Tailwind + shadcn CSS variables (light/dark) — canonical, self-contained
│   ├── lib/
│   │   └── utils.ts             # cn() — clsx + tailwind-merge
│   ├── hooks/
│   │   └── use-mobile.ts        # useIsMobile — framework-agnostic matchMedia hook, used by Sidebar
│   └── components/
│       ├── atoms/                # shadcn ui primitives — one per shadcn-generated file
│       │   ├── button.tsx        (+ .stories.tsx)
│       │   ├── card.tsx, dialog.tsx, sidebar.tsx, table.tsx, tabs.tsx, tooltip.tsx, ... (~33 total)
│       │   └── icons/
│       │       └── icons.tsx     (+ .stories.tsx) — Equalsite's custom icon set
│       └── molecules/             # small, single-purpose compositions of atoms
│           ├── status-badge.tsx, severity-badge.tsx, progress-bar.tsx,
│           │   metric-card.tsx, stat-pair.tsx, callout.tsx, collapsible.tsx
│           └── alert-error.tsx, code-block.tsx, container.tsx, stack.tsx,
│               heading.tsx, input-error.tsx, password-input.tsx
├── tsconfig.json
└── tsup.config.ts
```

Every component file has a sibling `*.stories.tsx` — there is no component without a story, and no story
file without a corresponding component. The shadcn CLI's own output layout maps directly onto `atoms/`
(`components.json` → `"ui": "@/components/atoms"`).

### What's an atom vs. a molecule here

- **Atom** = a shadcn ui primitive, full stop. If it came out of (or would come out of) `shadcn add`, it
  belongs in `atoms/`, regardless of how large or stateful it ends up (e.g. `sidebar.tsx` is a genuinely
  complex primitive, but it's still an atom by this rule — don't split it up).
- **Molecule** = a small, single-purpose composition of one or more atoms with no domain or router
  coupling (no Inertia, no Wayfinder actions, no `apps/web`-local types). `StatusBadge` (icon + text +
  variant), `MetricCard` (icon + value + label), `AlertError` (Alert + error list) are molecules.

### What deliberately stays out of this package

`reporting/*` and `scanning/**` under `apps/web/resources/js/components/` are organism-shaped (they
compose several molecules/atoms into a full UI section) but **intentionally remain in `apps/web`**: they
import their prop types from `apps/web`-local `@/types` (`Remediation`, `IViolation`, `ScanStatus`,
`ScanInfo`, `ScannedUrl`, …), and some import Wayfinder-generated actions. Moving them here would make
`packages/ui` depend backward on `apps/web`, which isn't resolvable via the workspace. If they need to be
shared beyond `apps/web` later, the prerequisite is promoting those view-model types into
`@equalsite/types` first — that hasn't happened yet.

Likewise, anything wired to Inertia routing, Laravel Wayfinder actions, or app-only state — `app-header`,
`app-sidebar`, `nav-*`, `user-*`, `two-factor-*`, `delete-user`, `app-shell`/`app-content`, `app-logo*`,
`breadcrumbs`, `text-link`, `public-header`, `appearance-tabs` — stays in `apps/web`. This package has no
dependency on `@inertiajs/react` and should stay that way.

---

## Development guidelines

### 1. Base every component on shadcn conventions, not ad-hoc styling

- Variant sets use `cva` (`class-variance-authority`), not conditional string concatenation.
  See `atoms/button.tsx` or `molecules/status-badge.tsx` for the pattern: a `*Variants` cva map exported
  alongside the component, `defaultVariants` set, props destructured with `className` merged last via
  `cn()`.
- Every component root element carries a `data-slot="<kebab-name>"` attribute (shadcn convention) —
  makes components targetable/debuggable without relying on class names.
- Prefer composing Radix primitives (`@radix-ui/react-*`) over hand-rolled interaction logic when a
  pattern needs real accessibility behavior (focus trapping, roving tabindex, portal rendering).
  `molecules/collapsible.tsx` is the deliberate exception — see "Notable design choices" below.
- To pull in a new shadcn primitive, use the shadcn CLI against `components.json`
  (`style: new-york`, `baseColor: neutral`, `iconLibrary: lucide`) from `packages/ui/` rather than
  hand-copying from shadcn's docs, so aliases (`@/components`, `@/lib`, `@/hooks`) resolve consistently
  — new primitives land in `src/components/atoms/`.

### 2. Follow `docs/style-guide.md` literally, not approximately

- **Severity/status colors are fixed brand tokens, not theme variables.** `SeverityBadge` and
  `StatusBadge` use literal Tailwind classes (`bg-red-100 text-red-700 dark:bg-red-900/40
  dark:text-red-300`, etc.) straight from the style guide's §3 table — they intentionally do **not**
  route through the `--destructive`/`--primary` CSS variables in `styles.css`, because severity colors
  must stay pinned to the brand's critical/serious/moderate/minor/pass palette regardless of what theme
  variables might do later. Only structural chrome (Button, focus rings) uses the CSS variable system.
- **Radius:** `rounded-lg` for cards/inputs/buttons, `rounded-full` for pills/badges/icon containers.
  Nothing in between — don't introduce `rounded-md`/`rounded-xl` as a one-off (§5).
- **Borders over shadows** for any card/panel (§5) — this is a deliberate flat, diagnostic-tool look.
- **Severity is never color-only.** Every severity/status variant pairs color with an icon and a text
  label — enforced structurally in `SeverityBadge`/`StatusBadge` (icon + label always render together;
  `hideIcon` only hides the icon, never the label).
- **Dark mode is mandatory, not optional**, for every variant of every component (§3, §9) — write the
  `dark:` class alongside the light one in the same line, don't ship a component and "add dark mode
  later."
- **Disclosure patterns must use real `aria-expanded`/`aria-controls`** (§8, §9) — see `Collapsible`.
- **Focus rings are never removed.** Interactive elements need a visible
  `focus:ring-2 focus:ring-indigo-600` (or the component's equivalent) — don't strip it for aesthetics.

### 3. Adding a new component — checklist

1. Decide atom vs. molecule (see above). Confirm a molecule is actually reusable — duplicated markup
   across 2+ consumers, or a pattern explicitly named in `docs/style-guide.md` §8 ("Component
   patterns"). One-off page markup, or anything needing Inertia/`apps/web`-local types, doesn't belong
   here.
2. Create `src/components/atoms/<kebab-name>.tsx` or `src/components/molecules/<kebab-name>.tsx`. Use
   `cva` for variants, `cn()` for class merging, a `data-slot` attribute, and literal style-guide colors
   for anything severity/status-semantic.
3. Create the sibling `*.stories.tsx` alongside it (see Storybook conventions below) — cover every
   variant, not just the default.
4. Export the component, its variant function (if any), and its prop/variant types from `src/index.ts`,
   added **explicitly** (never `export *`) — matches the sub-path export discipline already required by
   the `new-shared-package` skill for `@equalsite/types`.
5. If the component needs an app-level hook that only exists in `apps/web` (e.g. reading Inertia flash
   data, or app theme context), don't import that hook here — split it the way `atoms/sonner.tsx` /
   `apps/web/resources/js/components/toaster.tsx` do (see "Notable design choices" below).
6. Run the verification loop before considering it done:
   ```bash
   pnpm --filter @equalsite/ui typecheck
   pnpm --filter @equalsite/ui lintcheck
   pnpm --filter @equalsite/ui build
   pnpm --filter @equalsite/ui build-storybook
   ```
7. Visually check every variant/state in Storybook (`pnpm --filter @equalsite/ui storybook`,
   `http://localhost:6006`), including the a11y addon panel, and toggle Storybook's dark mode to confirm
   both themes clear WCAG AA contrast.

### 4. Storybook conventions

- One `.stories.tsx` per component, `title: 'Atoms/<ComponentName>'` or `title: 'Molecules/<ComponentName>'`,
  `tags: ['autodocs']`.
- `argTypes` should expose every variant/enum prop as a `select` control (see `status-badge.stories.tsx`,
  `severity-badge.stories.tsx`) so reviewers can flip through states without editing code.
- Include one story per meaningful variant (`Queued`, `Processing`, `Complete`, …) **and**, where it aids
  at-a-glance review, a combined story (`AllStates`, `AllSeverities`, `Grid`) rendering every variant side
  by side.
- Storybook's Tailwind styling comes from `.storybook/preview.ts` importing `src/styles.css` — new
  components don't need their own CSS import.

### 5. Consumption modes

Same dual-mode pattern as `@equalsite/types` (see the `new-shared-package` skill for the full rationale):
the `exports` map in `package.json` resolves `import`/`require` to the tsup-built `dist/*` for
production, and the `source` condition resolves straight to `src/index.ts` for dev/watch mode so
consuming apps pick up edits without a rebuild step. Run `pnpm --filter @equalsite/ui dev` (Storybook dev
server) while iterating; run `pnpm --filter @equalsite/ui build` before anything that consumes the built
`dist/` output.

`apps/web` depends on `@equalsite/ui` (`"@equalsite/ui": "workspace:*"` in `apps/web/package.json`) and
imports from it throughout — `import { Button, Card, StatusBadge, ... } from '@equalsite/ui'` and
`@equalsite/ui/styles.css`. `apps/web/resources/css/app.css` imports `@equalsite/ui/styles.css` directly
rather than duplicating the design tokens; it only keeps its own `@source` directives for scanning Blade
views.

---

## Notable design choices

**`Collapsible` doesn't use Radix.** Most disclosure UI here could use `@radix-ui/react-collapsible`,
but a dependency-free grid-rows animation technique (`grid-rows-[0fr]` ↔ `grid-rows-[1fr]` with
`overflow-hidden` inside) gives smooth height transitions without measuring DOM heights in JS.
`Collapsible`/`CollapsibleTrigger`/`CollapsibleContent`/`CollapsibleChevron` wrap that exact technique
behind a small context provider (open state + generated `contentId` for `aria-controls`). This is now the
**only** Collapsible implementation in the monorepo — `apps/web`'s `reporting/cluster-shell.tsx` used to
carry its own Radix-based `Collapsible` (with a different open/close DOM technique) purely because it was
the one remaining consumer of the shadcn-generated Radix atom; it's been migrated onto this component
instead (with a `className` override on `CollapsibleTrigger` to keep its circular icon-button look), and
the Radix `collapsible.tsx` atom and `@radix-ui/react-collapsible` dependency were deleted. Don't
reintroduce a second Collapsible without a concrete reason.

**`Button` was merged from two diverging copies.** Before this package absorbed `apps/web`'s local shadcn
atoms, `apps/web/resources/js/components/ui/button.tsx` and this package's `button.tsx` had drifted:
`apps/web`'s had `icon-xs`/`icon-sm`/`icon-lg` sizes that this package's lacked, and this package's had a
`ghost-destructive` variant that `apps/web`'s lacked. The canonical `atoms/button.tsx` now has the union
of both. If you're about to add a one-off Button variant somewhere in `apps/web`, add it here instead —
this drift is exactly what led to the merge.

**App-hook-coupled shadcn atoms get split into a pure atom + an app-local wrapper.** `sonner.tsx`
(`Toaster`) is the template: the shadcn-generated version directly called Inertia's flash-message hook
and the app's theme-appearance hook, which would have made it impossible to keep this package
framework-agnostic. The fix — `atoms/sonner.tsx` here only accepts `ToasterProps` (including `theme`) and
renders `sonner`'s `<Toaster>` with Equalsite's CSS-variable styling; `apps/web/resources/js/components/toaster.tsx`
is a two-line wrapper that calls `useAppearance()` / `useFlashToast()` and passes `theme` through. If a
future shadcn atom turns out to need an app-only hook, split it the same way rather than importing the
hook here.

**Severity/status color literalism.** See "Follow the style guide literally" above — resist the urge to
route `SeverityBadge`/`StatusBadge` through the shadcn CSS-variable theme system. That system is for
structural chrome (buttons, borders, backgrounds); severity color is a fixed accessibility-mandated
mapping the product audits *other* sites against, so it must not silently drift if the theme variables
change.

---

## Verification

No component-level unit tests exist yet — correctness is verified via `typecheck` + `lintcheck` + `build`
+ `build-storybook` (all must pass clean) plus manual visual review in Storybook, including the
`@storybook/addon-a11y` panel for each story. If you add interaction logic beyond simple variant
rendering (e.g. a component with internal state more complex than `Collapsible`'s), prefer adding
Storybook interaction tests (`play` functions) over a separate test runner/config.
