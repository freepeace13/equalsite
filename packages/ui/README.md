# @equalsite/ui

Shared React component library for Equalsite — shadcn-style primitives (Button, StatusBadge,
SeverityBadge, ProgressBar, MetricCard, StatPair, Callout, Collapsible) built on Radix/cva
conventions, developed and visually verified in Storybook, and consumed by `apps/web`'s React
frontend.

The goal of this package is to stop UI patterns (status pills, severity badges, progress bars,
metric tiles, banners, disclosures) from being hand-rolled with duplicated Tailwind classes on
every page — see `docs/style-guide.md` for the brand rules every component here must satisfy.

---

## Responsibilities

| Concern | Implementation |
|---------|----------------|
| Base primitives | shadcn-style components (`cva` variants, `cn()` merge helper, Radix where needed) |
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
| Primitives | Radix UI (`@radix-ui/react-slot` today; add more only when a pattern needs real Radix behavior) |
| Dev/docs | Storybook 10 (`@storybook/react-vite`, `@storybook/addon-a11y`) |
| Build | tsup (dual ESM/CJS + `.d.ts`) |
| Config base | `@equalsite/tsconfig/react.json`, `@equalsite/eslint-config/react` |

---

## Package structure

```
packages/ui/
├── components.json              # shadcn CLI config (style: new-york, baseColor: neutral)
├── .storybook/
│   ├── main.ts                  # story glob, Tailwind vite plugin, "@" alias → src/
│   └── preview.ts               # imports src/styles.css globally
├── src/
│   ├── index.ts                 # barrel — every public export lives here, explicitly
│   ├── styles.css               # Tailwind + shadcn CSS variables (light/dark)
│   ├── lib/
│   │   └── utils.ts             # cn() — clsx + tailwind-merge
│   └── components/ui/
│       ├── button.tsx           (+ .stories.tsx)
│       ├── status-badge.tsx     (+ .stories.tsx)
│       ├── severity-badge.tsx   (+ .stories.tsx)
│       ├── progress-bar.tsx     (+ .stories.tsx)
│       ├── metric-card.tsx      (+ .stories.tsx)
│       ├── stat-pair.tsx        (+ .stories.tsx)
│       ├── callout.tsx          (+ .stories.tsx)
│       └── collapsible.tsx      (+ .stories.tsx)
├── tsconfig.json
└── tsup.config.ts
```

Every component file has a sibling `*.stories.tsx` — there is no component without a story, and no
story file without a corresponding component. Both live flat in `src/components/ui/`, matching the
shadcn CLI's own output layout (`components.json` → `"ui": "@/components/ui"`).

---

## Development guidelines

### 1. Base every component on shadcn conventions, not ad-hoc styling

- Variant sets use `cva` (`class-variance-authority`), not conditional string concatenation.
  See `button.tsx` or `status-badge.tsx` for the pattern: a `*Variants` cva map exported alongside
  the component, `defaultVariants` set, props destructured with `className` merged last via `cn()`.
- Every component root element carries a `data-slot="<kebab-name>"` attribute (shadcn convention) —
  makes components targetable/debuggable without relying on class names.
- Prefer composing Radix primitives (`@radix-ui/react-*`) over hand-rolled interaction logic when a
  pattern needs real accessibility behavior (focus trapping, roving tabindex, portal rendering).
  `Collapsible` is the deliberate exception — see "Notable design choices" below.
- To pull in a new shadcn primitive, use the shadcn CLI against `components.json`
  (`style: new-york`, `baseColor: neutral`, `iconLibrary: lucide`) rather than hand-copying from
  shadcn's docs, so aliases (`@/components`, `@/lib`, `@/hooks`) resolve consistently.

### 2. Follow `docs/style-guide.md` literally, not approximately

- **Severity/status colors are fixed brand tokens, not theme variables.** `SeverityBadge` and
  `StatusBadge` use literal Tailwind classes (`bg-red-100 text-red-700 dark:bg-red-900/40
  dark:text-red-300`, etc.) straight from the style guide's §3 table — they intentionally do **not**
  route through the `--destructive`/`--primary` CSS variables in `styles.css`, because severity
  colors must stay pinned to the brand's critical/serious/moderate/minor/pass palette regardless of
  what theme variables might do later. Only structural chrome (Button, focus rings) uses the CSS
  variable system.
- **Radius:** `rounded-lg` for cards/inputs/buttons, `rounded-full` for pills/badges/icon containers.
  Nothing in between — don't introduce `rounded-md`/`rounded-xl` as a one-off (§5).
- **Borders over shadows** for any card/panel (§5) — this is a deliberate flat, diagnostic-tool look.
- **Severity is never color-only.** Every severity/status variant pairs color with an icon and a
  text label — enforced structurally in `SeverityBadge`/`StatusBadge` (icon + label always render
  together; `hideIcon` only hides the icon, never the label).
- **Dark mode is mandatory, not optional**, for every variant of every component (§3, §9) — write
  the `dark:` class alongside the light one in the same line, don't ship a component and "add dark
  mode later."
- **Disclosure patterns must use real `aria-expanded`/`aria-controls`** (§8, §9) — see `Collapsible`.
- **Focus rings are never removed.** Interactive elements need a visible
  `focus:ring-2 focus:ring-indigo-600` (or the component's equivalent) — don't strip it for
  aesthetics.

### 3. Adding a new component — checklist

1. Confirm it's actually reusable — duplicated markup across 2+ consumers, or a pattern explicitly
   named in `docs/style-guide.md` §8 ("Component patterns"). One-off page markup doesn't belong here.
2. Create `src/components/ui/<kebab-name>.tsx`. Use `cva` for variants, `cn()` for class merging,
   a `data-slot` attribute, and literal style-guide colors for anything severity/status-semantic.
3. Create `src/components/ui/<kebab-name>.stories.tsx` alongside it (see Storybook conventions
   below) — cover every variant, not just the default.
4. Export the component, its variant function (if any), and its prop/variant types from
   `src/index.ts`, added **explicitly** (never `export *`) — matches the sub-path export discipline
   already required by the `new-shared-package` skill for `@equalsite/types`.
5. Run the verification loop before considering it done:
   ```bash
   pnpm --filter @equalsite/ui typecheck
   pnpm --filter @equalsite/ui lintcheck
   pnpm --filter @equalsite/ui build
   pnpm --filter @equalsite/ui build-storybook
   ```
6. Visually check every variant/state in Storybook (`pnpm --filter @equalsite/ui storybook`,
   `http://localhost:6006`), including the a11y addon panel, and toggle Storybook's dark mode to
   confirm both themes clear WCAG AA contrast.

### 4. Storybook conventions

- One `.stories.tsx` per component, `title: 'UI/<ComponentName>'`, `tags: ['autodocs']`.
- `argTypes` should expose every variant/enum prop as a `select` control (see `status-badge.stories.tsx`,
  `severity-badge.stories.tsx`) so reviewers can flip through states without editing code.
- Include one story per meaningful variant (`Queued`, `Processing`, `Complete`, …) **and**, where it
  aids at-a-glance review, a combined story (`AllStates`, `AllSeverities`, `Grid`) rendering every
  variant side by side.
- Storybook's Tailwind styling comes from `.storybook/preview.ts` importing `src/styles.css` — new
  components don't need their own CSS import.

### 5. Consumption modes

Same dual-mode pattern as `@equalsite/types` (see the `new-shared-package` skill for the full
rationale): the `exports` map in `package.json` resolves `import`/`require` to the tsup-built
`dist/*` for production, and the `source` condition resolves straight to `src/index.ts` for
dev/watch mode so consuming apps pick up edits without a rebuild step. Run
`pnpm --filter @equalsite/ui dev` (Storybook dev server) while iterating; run
`pnpm --filter @equalsite/ui build` before anything that consumes the built `dist/` output.

**Note:** `apps/web` does not yet depend on `@equalsite/ui` — components here are built and
storybooked but not yet wired into the audit pages under
`apps/web/resources/js/pages/audit/*.tsx`. When wiring it in, add `"@equalsite/ui": "workspace:*"`
to `apps/web/package.json` and import from `@equalsite/ui` / `@equalsite/ui/styles.css`.

---

## Notable design choices

**`Collapsible` doesn't use Radix.** Most disclosure UI here could use `@radix-ui/react-collapsible`,
but the existing `apps/web/resources/js/pages/audit/index.tsx` advanced-settings panel already
proved out a dependency-free grid-rows animation technique
(`grid-rows-[0fr]` ↔ `grid-rows-[1fr]` with `overflow-hidden` inside) that gives smooth height
transitions without measuring DOM heights in JS. `Collapsible`/`CollapsibleTrigger`/
`CollapsibleContent`/`CollapsibleChevron` wrap that exact technique behind a small context provider
(open state + generated `contentId` for `aria-controls`), so don't "upgrade" it to Radix without a
concrete reason — it would add a dependency to replace something that already works and is already
battle-tested in this codebase.

**Severity/status color literalism.** See "Follow the style guide literally" above — resist the
urge to route `SeverityBadge`/`StatusBadge` through the shadcn CSS-variable theme system. That
system is for structural chrome (buttons, borders, backgrounds); severity color is a fixed
accessibility-mandated mapping the product audits *other* sites against, so it must not silently
drift if the theme variables change.

---

## Verification

No component-level unit tests exist yet — correctness is verified via `typecheck` + `lintcheck` +
`build` + `build-storybook` (all must pass clean) plus manual visual review in Storybook, including
the `@storybook/addon-a11y` panel for each story. If you add interaction logic beyond simple
variant rendering (e.g. a component with internal state more complex than `Collapsible`'s), prefer
adding Storybook interaction tests (`play` functions) over a separate test runner/config.
