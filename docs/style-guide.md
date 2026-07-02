# Equalsite — brand & UI/UX style guide

This is the single source of truth for how Equalsite looks, sounds, and
behaves at the interface level. It's written for design and frontend work —
pair it with `architecture.md` for system behavior, data flow, and
implementation notes. Reference mockups: `./markups/index.html` (landing/audit
request), `./markups/lobby.html` (lobby), `./markups/progress.html` (live progress),
`./markups/result.html` (audit result).

---

## 1. Brand overview

**Positioning line:** "see your site the way everyone does."

Equalsite is a free, no-signup web accessibility diagnostic. The brand should
read as competent and calm, not alarmist — it's telling people uncomfortable
things about their site, so the tone carries the discomfort, not the
visuals. Think diagnostic tool, not compliance scare campaign.

**Voice principles:**
- Direct, sentence case, plain verbs. No jargon, no fear-mongering.
- Errors and empty states explain what happened and what to do next — never
  apologetic, never a raw exception string.
- Say the concrete consequence, not the abstract violation ("checkout button
  has no accessible label" beats "missing `aria-label` attribute").

## 2. Logo & mark

- **Wordmark:** lowercase `equalsite`, set in Lexend Medium (500). Never
  capitalize, never add a tagline inline with the mark.
- **Mark:** an equals sign whose top bar resolves into a checkmark hook —
  "equal access, verified." At icon/favicon sizes (≤24px), simplify to two
  rounded bars; the checkmark hook gets lost below that size, don't force it.
- **Construction:** mark sits in a rounded square (`rounded-md`, indigo-700
  fill, white stroke), never floating unbounded next to the wordmark.
- **Clear space:** minimum clear space around the lockup equals the height of
  the mark's container on all sides.
- **Don't:**
  - Don't recolor the mark outside the indigo-700/white pairing.
  - Don't stretch or skew the lockup.
  - Don't pair the wordmark with a different display font under any
    circumstance.

## 3. Color system

Every semantic color maps 1:1 onto a default Tailwind value — no custom
palette entries needed in `tailwind.config`. This is a deliberate constraint:
it keeps the palette impossible to drift from over time.

### Brand & neutrals

| Role | Hex | Tailwind |
|---|---|---|
| Brand / primary CTA | `#4338CA` | `indigo-700` |
| Ink (light mode) | `#12131A` | `slate-900` |
| Surface (light mode) | `#FAFAF9` | `stone-50` |
| Surface (dark mode) | `#0B0D12` | custom, close to `slate-950` |

### Severity / status

| Role | Hex | Tailwind |
|---|---|---|
| Critical | `#DC2626` | `red-600` |
| Serious | `#EA580C` | `orange-600` |
| Moderate | `#CA8A04` | `yellow-600` |
| Minor | `#64748B` | `slate-500` |
| Pass / healthy / complete | `#059669` | `emerald-600` |

### Rules

- **Severity is never color-only.** Every severity badge pairs color with an
  icon and a text label (critical / serious / moderate / minor). This isn't
  a style preference — it's the product's own accessibility standard applied
  to itself.
- **Dark mode is a real accessibility feature here** (photosensitivity, low
  vision), not a cosmetic option. Ship both modes at MVP via Tailwind's
  `class` strategy — this is not a fast-follow.
- All text/background pairings must clear WCAG AA contrast (4.5:1 body,
  3:1 large text/UI components) in both light and dark mode. Verify any new
  color pairing before shipping it, not after.

## 4. Typography

| Use | Font | Weight |
|---|---|---|
| Display / narrative headline / nav wordmark | Lexend | 500 |
| UI labels, body copy, data | Inter | 400 / 500 |

Lexend is a deliberate choice, not decoration — it's a typeface developed
from reading-proficiency research, which is a quiet on-brand detail worth
knowing if the choice is ever questioned.

**Weight discipline:** two weights only in UI chrome — 400 regular, 500
medium. Avoid 600/700 anywhere. Reserve the heaviest weight in use for the
single narrative headline per page — if everything is bold, nothing reads as
the point.

**Type scale** (Tailwind size tokens, as used across the mockups):

| Token | Size | Used for |
|---|---|---|
| `text-3xl`/`text-4xl` | 30–36px | Landing hero headline only |
| `text-xl` | 20px | Page-level headings (progress, lobby, result narrative) |
| `text-lg` | 18px | Modal titles, terminal-state headings |
| `text-sm` | 14px | Body copy, form labels, primary UI text |
| `text-xs` | 12px | Meta text, captions, badges, helper copy |

## 5. Spacing & shape

- **Corner radius:** `rounded-lg` (8px) for cards, inputs, and buttons.
  `rounded-full` for pills/badges and icon containers. Nothing in between —
  don't introduce `rounded-md`/`rounded-xl` as one-offs.
- **Borders over shadows.** Every card/panel uses a 1px (`border`) or
  hairline (`border` at 0.5px equivalent) border, not a drop shadow. Flat,
  not skeuomorphic — matches the diagnostic-tool tone, not a marketing page.
- **Spacing rhythm:** content blocks step in multiples of 4 (`gap-2`, `gap-3`,
  `gap-4`), section-level spacing in multiples of 8 (`py-8`, `py-10`,
  `py-16` for empty/terminal states).

## 6. Iconography

- Outline style only, 2px stroke, `stroke-linecap="round"` where the icon
  has open ends. No filled icons, no duotone.
- Sizes: 12–13px inline with badge/meta text, 14–16px inline with body text
  and buttons, 20–22px for group headers and feature-card icons.
- Icons are never decoration-only when they convey status (severity, state
  badges) — see §3 severity rule.

## 7. Design principles

These are the UX decisions that should govern any new screen, not just the
three that exist today:

1. **Lead with a story, not a bare score.** Any score/metric display pairs
   with a one-sentence, plain-English headline naming the worst concrete
   consequence — never a number alone.
2. **Group by who's affected, not by internal taxonomy.** Screen reader
   users, keyboard users, low vision users — not axe rule IDs. This is how a
   site owner actually triages, not how an auditor tags things.
3. **Quick-wins-first is the primary sort, everywhere a list of work
   appears.** Severity stays a per-item badge, never a section split — a
   critical 5-minute fix and a critical rebuild don't carry equal next-step
   effort, and the ordering should say so.
4. **Progressive disclosure by default.** Show summaries first, full detail
   one level deeper. Only the single most severe/urgent item in any list
   starts expanded.
5. **Live states must feel alive.** Real data streaming in (page paths,
   counts) beats a static spinner, every time a process takes more than a
   couple of seconds.
6. **Visual evidence over selector strings.** Anywhere a specific page
   element is being called out, show a screenshot with the element
   highlighted — don't make someone reconstruct the DOM in their head.

## 8. Component patterns

- **Severity badge** — pill, `bg-{color}-100 text-{color}-700` light /
  `bg-{color}-900/40 text-{color}-300` dark, icon + label. See §3 rule.
- **Metric card** — `bg-slate-100 dark:bg-slate-800/60`, no border,
  `rounded-lg`, label 12px muted above a 20–22px/500 number.
- **Stat pair** — same metric-card family, two values side by side separated
  by a hairline divider (used in queue/waiting contexts).
- **Group header (collapsible)** — icon for the category, title, subtitle,
  count badge, chevron. `aria-expanded` + `aria-controls` wired properly —
  this is an accessibility tool auditing itself in real time, so its own
  disclosure patterns have zero room for shortcuts.
- **Issue row** — screenshot thumbnail (64×48), title + severity badge,
  one-line plain-English impact, meta row (page count + fix-time estimate).
- **Sub-section divider** — small icon + label ("quick wins" / "structural
  work") + hairline rule. Not a heavy section header — it's a sort
  boundary, not a new topic.
- **Status card (state-driven)** — used for the current-audit summary and
  terminal states (complete/cancelled/failed): icon + status label + primary
  action, background tint shifts with state (indigo while active, emerald on
  complete, neutral on cancelled, red on failed).
- **Modal** — centered, `max-w-sm`, `rounded-xl`, backdrop click dismisses
  without submitting. Primary action full-width, secondary action as a
  quieter full-width text button beneath it, not side-by-side buttons.

## 9. Accessibility commitments (the product's own bar)

Since Equalsite audits other sites for exactly this, its own UI is held to
the same standard as a hard requirement, not an aspiration:

- WCAG 2.2 AA contrast minimum on every color pairing, both themes.
- Every interactive control has a visible focus ring
  (`focus:ring-2 focus:ring-indigo-600`), never removed for aesthetics.
- Disclosure/accordion patterns use real `aria-expanded`/`aria-controls`,
  not visual-only chevrons.
- Status/severity is never conveyed by color alone (§3).
- Dark mode is a shipped feature, not a v2 (§3).
