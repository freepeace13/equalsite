# Equalsite — brand & UI/UX style guide

This is the single source of truth for how Equalsite looks, sounds, and behaves at the interface level. It's written for design and frontend work — pair it with `architecture` for system behavior, data flow, and implementation notes. There are no separate reference mockups — the shipped pages under `apps/web/resources/js/pages/` (landing, progress, audit result, dashboard, sites list, site page) and the components in `packages/ui` are themselves the reference.

---

## 1\. Brand overview

**Positioning line:** "see your site the way everyone does."

Equalsite is a WCAG 2.2 AA web accessibility diagnostic. **Auth is required for every audit** — no "no sign up needed" language anywhere on the landing page. The brand should read as competent and calm, not alarmist — it's telling people uncomfortable things about their site, so the tone carries the discomfort, not the visuals. Think diagnostic tool, not compliance scare campaign.

**Voice principles:**

- Direct, sentence case, plain verbs. No jargon, no fear-mongering.  
- Errors and empty states explain what happened and what to do next — never apologetic, never a raw exception string.  
- Say the concrete consequence, not the abstract violation ("checkout button has no accessible label" beats "missing `aria-label` attribute").  
- **No lawsuit/legal-risk framing, anywhere in the product (locked).** Explicitly rejected as an urgency mechanism — contradicts the "not a compliance scare campaign" principle, Equalsite can't back a legal-risk claim with any authority, and it's the tactic that damaged competitors' reputations in this space. Use issue-age ("open 12 days") and open counts instead — both create real urgency from true, neutral facts.  
- **Constrained states explain themselves plainly, never silently.** A disabled action (e.g. the Site page's "run new audit" button when the free-tier re-scan cap is active) still gets a `title` tooltip and an inline caption stating when it's available again — never just a grayed control with no explanation.

## 2\. Logo & mark

- **Wordmark:** lowercase `equalsite`, set in Lexend Medium (500). Never capitalize, never add a tagline inline with the mark.  
- **Mark:** an equals sign whose top bar resolves into a checkmark hook — "equal access, verified." At icon/favicon sizes (≤24px), simplify to two rounded bars; the checkmark hook gets lost below that size, don't force it.  
- **Construction:** mark sits in a rounded square (`rounded-md`, indigo-700 fill, white stroke), never floating unbounded next to the wordmark.  
- **Clear space:** minimum clear space around the lockup equals the height of the mark's container on all sides.  
- **Don't:**  
  - Don't recolor the mark outside the indigo-700/white pairing.  
  - Don't stretch or skew the lockup.  
  - Don't pair the wordmark with a different display font under any circumstance.

## 3\. Color system

Every semantic color maps 1:1 onto a default Tailwind value — no custom palette entries needed in `tailwind.config`.

### Brand & neutrals

| Role | Hex | Tailwind |
| :---- | :---- | :---- |
| Brand / primary CTA | `#4338CA` | `indigo-700` |
| Ink (light mode) | `#12131A` | `slate-900` |
| Surface (light mode) | `#FAFAF9` | `stone-50` |
| Surface (dark mode) | `#0B0D12` | custom, close to `slate-950` |

### Severity / status

| Role | Hex | Tailwind |
| :---- | :---- | :---- |
| Critical | `#DC2626` | `red-600` |
| Serious | `#EA580C` | `orange-600` |
| Moderate | `#CA8A04` | `yellow-600` |
| Minor | `#64748B` | `slate-500` |
| Pass / healthy / complete | `#059669` | `emerald-600` |

### Rules

- **Severity is never color-only.** Every severity badge pairs color with an icon and a text label. This is the product's own accessibility standard applied to itself.  
- **Dark mode is a real accessibility feature here**, not a cosmetic option. Ship both modes at MVP via Tailwind's `class` strategy.  
- All text/background pairings must clear WCAG AA contrast (4.5:1 body, 3:1 large text/UI components) in both light and dark mode.

## 4\. Typography

| Use | Font | Weight |
| :---- | :---- | :---- |
| Display / narrative headline / nav wordmark | Lexend | 500 |
| UI labels, body copy, data | Inter | 400 / 500 |

**Weight discipline:** two weights only in UI chrome — 400 regular, 500 medium. Avoid 600/700 anywhere. Reserve the heaviest weight in use for the single narrative headline per page.

**Type scale** (Tailwind size tokens):

| Token | Size | Used for |
| :---- | :---- | :---- |
| `text-3xl`/`text-4xl` | 30–36px | Landing hero headline only |
| `text-xl` | 20px | Page-level headings (progress, dashboard, site page, result narrative) |
| `text-lg` | 18px | Modal titles, terminal-state headings |
| `text-sm` | 14px | Body copy, form labels, primary UI text |
| `text-xs` | 12px | Meta text, captions, badges, helper copy |

## 5\. Spacing & shape

- **Corner radius:** `rounded-lg` (8px) for cards, inputs, and buttons. `rounded-full` for pills/badges and icon containers.  
- **Borders over shadows.** Every card/panel uses a 1px/hairline border, not a drop shadow.  
- **Spacing rhythm:** content blocks step in multiples of 4, section-level spacing in multiples of 8\.

## 6\. Iconography

- Outline style only, 2px stroke, `stroke-linecap="round"` where the icon has open ends. No filled icons, no duotone.  
- Sizes: 12–13px inline with badge/meta text, 14–16px inline with body text and buttons, 20–22px for group headers and feature-card icons.  
- Icons are never decoration-only when they convey status — see §3.

## 7\. Design principles

1. **Lead with a story, not a bare score.** Any score/metric display pairs with a one-sentence, plain-English headline naming the worst concrete consequence.  
2. **Group by who's affected, not by internal taxonomy.**  
3. **Quick-wins-first is the primary sort, everywhere a list of work appears.**  
4. **Progressive disclosure by default.**  
5. **Live states must feel alive.** Real data streaming in beats a static spinner — this now extends to **list-level** live states too (section 8's inline live-status row), not just single-audit pages.  
6. **Visual evidence over selector strings.**  
7. **Urgency comes from true, neutral facts, never manufactured risk.** Issue age, unresolved counts, and rate-limit timing are the approved levers — never a scored or implied legal/compliance threat.

## 8\. Component patterns

- **Severity badge** — pill, `bg-{color}-100 text-{color}-700` light / `bg-{color}-900/40 text-{color}-300` dark, icon \+ label.  
- **Metric card** — `bg-slate-100 dark:bg-slate-800/60`, no border, `rounded-lg`, label 12px muted above a 20–22px/500 number. Used for Dashboard's four portfolio metrics and Site page's stats.  
- **Stat pair** — same metric-card family, two values side by side separated by a hairline divider.  
- **Group header (collapsible)** — icon, title, subtitle, count badge, chevron. `aria-expanded` \+ `aria-controls` wired properly.  
- **Issue row** — screenshot thumbnail (64×48), title \+ severity badge, one-line plain-English impact, meta row (page count \+ fix-time estimate).  
- **Issue-age tag** — small muted text/badge reading "open N days" — sourced from `audit_violations.first_seen_at`. Neutral tone only, never a warning or threat.  
- **Sub-section divider** — small icon \+ label \+ hairline rule.  
- **Status card (state-driven)** — icon \+ status label \+ primary action, background tint shifts with state (indigo active, emerald complete, neutral cancelled, red failed).  
- **Modal** — centered, `max-w-sm`, `rounded-xl`, backdrop click dismisses without submitting. Applies to the login/register modal (tabbed Login/Register) the same as any other modal.  
- **Trend chart** — simple line chart for the Dashboard's aggregate score trend and the Site page's per-domain score trend. Indigo line, severity colors only for annotating specific point events — no new palette entries.  
- **Inline live-status row** — used in the Sites list when a site has an in-progress audit. Combines three existing primitives at row scale rather than introducing a new one: a slim progress bar (`h-1.5 rounded-full`, indigo fill) paired with a running page count (e.g. "12 of 22 pages") in place of the score cell, the same `processing`/`queued` badge used on the progress page, and an action link that reads "view progress" instead of "view site" while active. A subtle indigo-tinted row background (`bg-indigo-50/40 dark:bg-indigo-900/10`) distinguishes it from static rows without needing a separate banner component — see `architecture` section 3.2.1 for why this was chosen over a banner.

## 9\. Accessibility commitments (the product's own bar)

- WCAG 2.2 AA contrast minimum on every color pairing, both themes.  
- Every interactive control has a visible focus ring (`focus:ring-2 focus:ring-indigo-600`), never removed for aesthetics.  
- Disclosure/accordion patterns use real `aria-expanded`/`aria-controls`.  
- Status/severity is never conveyed by color alone (§3).  
- Dark mode is a shipped feature, not an afterthought (§3).

## 10\. Related docs

- `architecture` — page flow, state machines, data model, the Dashboard/Sites-list/Site page definitions and the inline live-status decision (section 3.2.1).  
- `monetization` — free/Pro plan limits that surface in UI (site cap, page cap, crawl depth, re-scan frequency, history retention).

