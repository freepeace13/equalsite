## Setup

No provider or root wrapper is required. Every component reads its colors from CSS custom
properties set on `:root`/`.dark` in the bundled `styles.css` — just render components directly.
Dark mode is a `dark` class on any ancestor (`<html class="dark">` or lower); there is no
`ThemeProvider` component to import.

```jsx
<Button>Save changes</Button>
```

renders correctly with no setup beyond the bundle + `styles.css` already being loaded.

## Styling idiom: Tailwind v4 utility classes over CSS variables

This is a shadcn-style system — style with Tailwind utility classes, not inline styles or CSS
modules, and prefer the CSS-variable-backed family below over hardcoded colors for anything
structural (buttons, cards, panels, borders, focus rings):

| Purpose | Classes |
|---|---|
| Page/app background | `bg-background`, `text-foreground` |
| Cards/panels | `bg-card`, `text-card-foreground` |
| Primary action | `bg-primary`, `text-primary-foreground` |
| Secondary/neutral | `bg-secondary`, `text-secondary-foreground` |
| Muted/subtle text | `bg-muted`, `text-muted-foreground` |
| Hover/interactive tint | `bg-accent`, `text-accent-foreground` |
| Destructive action | `bg-destructive`, `text-destructive-foreground` |
| Borders / inputs / focus | `border-border`, `border-input`, `ring-ring` |
| Charts | `var(--chart-1)` … `var(--chart-5)` in a `ChartConfig`'s `color` field, e.g. `{ critical: { label: 'Critical', color: 'var(--chart-1)' } }` passed to `<ChartContainer config={...}>` — not a Tailwind class |
| Sidebar chrome | `bg-sidebar`, `text-sidebar-foreground`, `bg-sidebar-primary`, `bg-sidebar-accent` |

Radius is binary, not a spectrum: `rounded-lg` for cards/inputs/buttons, `rounded-full` for
pills/badges/icon containers — never introduce `rounded-md`/`rounded-xl` as a one-off. Prefer
borders over shadows for any card/panel (a deliberate flat, diagnostic-tool look). Fonts:
`font-sans` (Inter, body text) and `font-display` (Lexend, headings — see `<Heading>`).

**Exception — severity/status color is intentionally NOT theme-driven.** `<SeverityBadge>` and
`<StatusBadge>` use fixed literal Tailwind classes (e.g. `bg-red-100 text-red-700
dark:bg-red-900/40 dark:text-red-300`) pinned to a brand critical/serious/moderate/minor/pass
palette, independent of `--primary`/`--destructive`. Don't hand-roll severity colors from the
variable table above — use `<SeverityBadge>`/`<StatusBadge>` so the mapping stays consistent, and
always pair color with an icon + text label (never color-only).

Always write the `dark:` variant alongside the light class on the same line — every component here
ships both, and a design missing `dark:` classes will look unstyled in dark mode even though the
component itself supports it.

## Where the truth lives

Read `styles.css` (and its `@import`s) for the full token list before styling anything not covered
above. Each component's own `.d.ts` (props) and `.prompt.md` (usage notes, variants) are the
per-component authority — read them before composing a component you haven't used yet, especially
compound ones (`ChartContainer` wraps Recharts children; `Collapsible`, `NavigationMenu`, `Sidebar`
carry internal state/context).

## Example

```jsx
<Card className="p-4">
  <Heading title="Audit summary" variant="small" />
  <div className="flex items-center gap-2 mt-2">
    <StatusBadge status="complete" />
    <span className="text-muted-foreground text-sm">42 pages scanned</span>
  </div>
  <Button className="mt-4">View report</Button>
</Card>
```
