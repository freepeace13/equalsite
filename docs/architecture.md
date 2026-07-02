# Equalsite — system architecture & MVP behavior

This doc covers how Equalsite behaves — page flow, state machines, data
model, and engineering decisions. For brand, color, typography, and
component visuals, see `style-guide.md`. Static Tailwind reference mockups:
`./markups/index.html` (landing/audit request), `./markups/lobby.html` (lobby), `./markups/progress.html`
(live progress), `./markups/result.html` (audit result).

---

## 1. Product framing

Equalsite is a free, no-signup web accessibility diagnostic. Core flow:

```
audit request form → crawler (queued → processing → complete/cancelled/failed) → audit result
```

No auth, no dashboard, no billing in MVP — those are phase 2. An audit's UUID
is its own access credential (same pattern as PageSpeed Insights / GTmetrix).
See §2 for the optional-account layer that sits on top of this without
reopening that decision.

## 2. User journey — optional passwordless accounts (locked)

The MVP stays no-signup by default, but supports an **optional** lightweight
account so someone can retrieve history across sessions/devices. This does
not reopen the "defer Fortify" decision — no passwords, no dashboard, no
billing. Exact sequence:

1. **Audit request form submit** (`./markups/index.html`).
2. **Email capture modal** — fires on submit, before the audit is created.
   Optional: "Save & continue" (email) or "Skip, continue as guest." Landing
   page copy ("no sign up needed") stays accurate either way — this is an
   offer, not a gate.
   - **Guest path:** no backend user created, goes straight to
     `./markups/progress.html` (waiting → processing → complete/cancelled/failed). No
     lobby, no history. **No client-side recovery token either** — closing
     the tab or losing the URL loses the audit, full stop. The form's own
     rate limit (no new audit for the same site within X duration of the
     last one) is what actually discourages skipping, since a lost guest
     audit can't just be silently re-run. The modal's "heads up" copy makes
     this consequence explicit rather than letting people find out the hard
     way.
   - **Email path:** backend creates a passwordless user, associates the
     audit, emails a signed link (`URL::temporarySignedRoute`, not Fortify).
     **The current browser session gets instant access** to the lobby — the
     emailed link is a backup/cross-device access method, not a required
     verification step.
3. **Lobby** (`./markups/lobby.html`) — only reachable by email-path users. Shows:
   - A compact **current audit card** — its own mini state machine, see §3.2:
     status badge, queue position or processing progress, cancel button, and
     a "view progress" link to `./markups/progress.html` for the full live experience.
   - **Audit history list**, one row per past audit: URL, runtime duration,
     status (including `cancelled` and `failed`), `total_url_with_issue` /
     `total_scanned_urls`, score, request date, total issues found.
   - Cancelling from either the lobby card or `./markups/progress.html` sets status to
     `cancelled` and **keeps the row in history** (not deleted) — a
     cancelled scan is still useful information (e.g. "I meant to audit
     this, didn't finish").
4. **Progress** (`./markups/progress.html`) — same state machine described in §3.1
   (waiting/processing/cancelled/failed, complete shown in place), plus:
   - Cancel button, visible during `waiting` and `processing`.
   - "Back to lobby" link — only rendered for email-path (logged-in) users;
     guests see no equivalent (there's nothing to go back to).
   - "View report" CTA — revealed in place once status is `complete`,
     without navigating to a separate screen.
5. **Result** (`./markups/result.html`) — header metadata block includes audit request
   date, and `total_url_with_issue` displayed alongside "X pages scanned"
   (e.g. "14 of 22 pages have issues").

## 3. State machines

### 3.1 Progress page (`./markups/progress.html`)

Covers the full audit lifecycle behind one URL — for guests, it's their
landing page for this audit; for email-path users, it's reachable via "view
progress" from the lobby. States:

**`waiting`** — job accepted, sitting in the BullMQ queue (concurrency is
capped at 2 Playwright instances per the deployment plan, so queuing is
expected under load, not an error state). Shows queue position, an estimated
wait (position × average job duration — rough heuristic is fine for MVP),
and an explainer for *why* there's a queue, reframing the wait as a trust
signal rather than a broken page.

**`processing`** — the live activity feed: real page paths streaming in,
running counts (pages found / scanned / issues so far), progress bar.
**There is no separate "audit complete" screen.** Once status flips to
complete, the page stays on this same view and reveals a "view report" CTA
in place at the bottom — swapping to a whole new screen for what's
essentially "the last row of the feed" was an unnecessary context switch.

**`cancelled`** / **`failed`** — distinct terminal screens (cancelled =
person-initiated, failed = crawler couldn't complete — site unreachable,
blocked robots, timeout). Both keep the audit in history rather than
deleting it. `failed` matches the `audit.failed` Redis Stream event already
defined in the crawler service.

**Chrome shared across all states:**
- Cancel button — visible during `waiting`/`processing` only, hidden once
  terminal.
- "Back to lobby" link — hidden entirely for guests. In the static mockup
  this is simulated via a `localStorage` flag set when `./markups/index.html`'s modal
  is skipped; in production, drive it from an Inertia shared prop
  (`auth.user` present or null), not client storage.

In production this is driven by Redis Stream events (`audit.started` fires
waiting → processing, `audit.progress`/`audit.page.completed` drive the
feed, `audit.completed` reveals the report CTA, `audit.failed` drives the
failed screen); queue position comes from Horizon/BullMQ's own queue depth
for that job.

### 3.2 Lobby current-audit card (`./markups/lobby.html`)

Mirrors the same lifecycle in miniature: `queued` → `processing` →
`complete`/`cancelled`/`failed`. It's a compact summary (status, queue
position or progress bar, one action row), not a duplicate of the full
`./markups/progress.html` experience — "view progress" is the link between the two.
Cancelling from the card jumps straight to the `cancelled` terminal state
without navigating away.

## 4. Business logic

### Fix-time estimate

MVP: hardcoded `axe rule ID → effort tier` lookup table (quick win /
structural), maintained by hand. Don't build dynamic effort scoring for
MVP — not enough signal yet, and a static map is fast to ship and good
enough to sort by. Drives the quick-wins-first sort described in
`style-guide.md` §7.

## 5. Data model

- `audits` needs a nullable `user_id` (guest audits have none) and a
  `status` enum that includes `cancelled` and `failed` alongside `queued` /
  `processing` / `complete`.
- Passwordless `users` row needs nothing beyond `email` — no password
  column, no Fortify tables.

## 6. Engineering notes (mockup fixes worth carrying into production)

**URL field silently blocked the email modal.** `./markups/index.html`'s URL input
was `type="url"`. Browsers won't fire the `submit` event on a scheme-less
value like `acme.com` (native constraint validation blocks it silently), so
the email modal never opened for anyone who didn't type the full `https://`.
Fixed by using `type="text" inputmode="url"` and normalizing the value in JS
(prepend `https://` if missing) before the modal opens. Don't reintroduce
`type="url"` with `required` on this field in the real form.

**A single script-block failure took down the whole page.** Root cause of a
follow-up "modal still not showing" report, found by running the file
through a headless browser rather than guessing: all of `./markups/index.html`'s JS
lived in one `<script>` block, and the theme toggle read `localStorage` on
the very first line. In any context where `localStorage` throws
(sandboxed/cross-origin preview iframes without storage access are the
common case), that single uncaught error halted the entire block — so the
form's `submit` listener never registered, and the modal could never open,
with no visible error to explain why. Fixed two ways, both worth carrying
into the real app:
1. **Isolate independent features** into separate script blocks (or React
   components/effects) so one feature's failure can't silently disable
   unrelated ones.
2. **Guard all `localStorage` access** through small helpers that catch and
   no-op on failure, rather than calling `localStorage` directly inline. In
   the real Inertia app, prefer a persisted user preference (or default to
   system theme) over local storage for anything that must not fail.

Verified with a headless Playwright run that forces `localStorage` to throw
on access.

## 7. Implementation note for Claude Code

The production app is Laravel 13 + React 19 (Inertia). The five HTML files
referenced above are static Tailwind references, not the final components —
translate each into an Inertia page + React components under
`apps/web/resources/js/`, keeping:

- Tailwind config additions: `fontFamily.display = Lexend`, `fontFamily.sans
  = Inter`. No custom color palette needed — see `style-guide.md` §3.
- The collapsible group behavior (vanilla JS in the mockup) becomes a
  `<Disclosure>`-style React component with proper `aria-expanded` state.
- `./markups/progress.html`'s state machine (§3.1) becomes React state driven by the
  real Soketi/Redis Stream subscription, not the mockup's
  `setTimeout`/`setInterval` demo logic — those are only there to preview
  the intended feel and timing.
- Queue position for the `waiting` state should come from Horizon/BullMQ's
  queue depth API, scoped to the job's position among pending jobs — not
  something the frontend estimates on its own.
- Guest vs. email-path rendering (e.g. the "back to lobby" link) should come
  from an Inertia shared prop (`auth.user` present or null), not a
  client-side guess — the mockup's `localStorage` flag is a demo stand-in
  only.

## 8. Related docs

- `style-guide.md` — brand identity, color/type tokens, component patterns,
  and the locked UX design principles (narrative score, impact-first
  grouping, quick-wins-first sort, progressive disclosure).
- `CLAUDE.md` should reference **both** this file and `style-guide.md` —
  update its pointer if it currently links only to a single
  `design-system.md`.
