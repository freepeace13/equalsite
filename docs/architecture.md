# Equalsite — system architecture & MVP behavior (v3)

This doc covers how Equalsite behaves — page flow, state machines, data model, and engineering decisions. For brand, color, typography, and component visuals, see `style-guide`. Static Tailwind reference mockups: `index.html` (landing/audit request), `progress.html` (live progress), `result.html` (audit result), `dashboard.html`, `user-audits.html`, and `site.html` (new pages, mockups now built — see `03_Design_&_Assets/`). `waiting.html` (formerly "lobby") is superseded by `site.html` — see section 7 for the mapping.

**v2 reversed the "no-signup" and "optional passwordless account" decisions locked in v1** — auth is now mandatory for every audit. **This version (v3) adds no new product decisions of its own beyond one: how in-progress audits are shown in the User Audits list (section 3.2.1)** — everything else is unchanged from v2, carried forward with references updated to the now-built mockups.

---

## 1\. Product framing

Equalsite is a WCAG 2.2 AA web accessibility diagnostic. Core flow:

audit request form → login/register → crawler (queued → processing →

complete/cancelled/failed) → audit result

Every audit belongs to an authenticated account — no anonymous/guest path. Free and Pro are both real accounts; the difference is plan limits (see `monetization` doc) and queue priority, not whether sign-in is required.

## 2\. User accounts & authentication (locked)

Auth uses **Laravel Fortify** — not a custom passwordless flow. A dashboard, per-site history, and billing all need real session security (password reset, 2FA-ready), which passwordless magic links don't cover well once money and account-scoped data are involved.

Sequence:

1. **Audit request form submit** (`index.html`).  
2. **Login/register modal** — fires on submit, before the audit is created. Tabbed single modal (Login / Register), not two separate modals. Replaces v1's email-capture modal entirely — there is no "skip, continue as guest" option anymore.  
3. On successful auth: backend creates the audit, associates it with `user_id`, and the browser **redirects straight to `progress.html`** — no intermediate lobby stop on first run.  
4. From here on, the account's audits are always reachable via **User Audits** and **Site page** (section 3\) — there's no separate "logged in vs. guest" branching anywhere downstream.

## 3\. New pages

### 3.1 Dashboard (`dashboard.html`)

Portfolio-level view across all of an account's sites. Four metrics, deliberately minimal rather than a wall of charts:

1. **Sites tracked / audits run** — also doubles as plan-usage display (ties directly to the free-tier site cap, see `monetization`).  
2. **Overall score trend** — one line chart, aggregate across all sites.  
3. **Open critical issues** — count, aggregated across sites, with the oldest open issue's age shown alongside it (e.g. "oldest open 12 days") per the issue-age mechanism in section 5\.  
4. **Quick wins available** — count, aggregated across sites.

Below the metrics, a "your sites" preview strip (top few domains with a compact score ring each) links out to the full User Audits list. Nothing else at launch — no industry benchmarking, no issue-category breakdowns — until real usage data shows what people actually look at.

### 3.2 User Audits (`user-audits.html`)

Flat list, **grouped by domain** (one row per site, not per audit), sorted by most-recent activity. Columns: domain, latest score, latest status, audit count for that domain, last run date, and a link into the **Site page**.

#### 3.2.1 Showing in-progress audits (locked)

An active audit (`queued`/`processing`) is shown **inline in its row**, not via a separate banner:

- The score column shows a live progress bar \+ running page count (e.g. "12 of 22 pages") instead of a score, since the score isn't known yet.  
- The status column shows a `processing`/`queued` badge — same visual language as `progress.html`'s badges, just applied at row scale.  
- The last-run column reads "running now" instead of a date.  
- The row's action link reads "view progress" (→ `progress.html`) instead of "view site" while active.

**Why inline over a banner:** a Pro account can have several sites mid-audit simultaneously. A single banner doesn't scale past one — it either stacks awkwardly or hides all but one active audit. Row-level status reuses the existing badge/progress-bar patterns already established in `progress.html`, so this introduces no new visual vocabulary, just applies it at list scale. An in-progress row naturally sorts to the top, since it's definitionally the most recent activity for that site — no separate sort logic needed.

### 3.3 Site page (`site.html`, replaces `waiting.html`/lobby as a route)

Per-domain view. Composition:

- **Current-audit card** — same mini state machine as v1's lobby card (see section 4.2): status badge, queue position or progress, cancel button, "view progress" link.  
- **Score trend chart** — line chart across that domain's audit history only (not aggregate).  
- **Open-issues snapshot** — stat pair (critical count, quick-wins count) plus the oldest-open-issue age for this domain, same issue-age mechanism as the Dashboard's aggregate count (section 5).  
- **Audit history table** — same table as v1's lobby history, filtered to this domain.  
- **"Run new audit" CTA** — disabled with a `title` tooltip and inline caption (e.g. "next scan available in 14h") when the free-tier re-scan cap is active, rather than hidden or silently grayed out — consistent with the style guide's "explain what happened and what to do next" rule for constrained states.

This page fully replaces the lobby route — there's no separate global lobby. If an account has multiple sites mid-audit simultaneously, each is tracked on its own Site page; **User Audits** is the cross-site index (with the inline live-status treatment from section 3.2.1).

## 4\. State machines

### 4.1 Progress page (`progress.html`)

Unchanged in structure — `waiting` → `processing` → `complete`/`cancelled`/`failed`, complete shown in place via a revealed report CTA rather than a separate screen.

- **"Back to lobby" becomes "back to Site page"** — always rendered now (every audit belongs to an account with a Site page to return to).  
- Driven by the same Redis Stream events as v1 (`audit.started`, `audit.progress`/`audit.page.completed`, `audit.completed`, `audit.failed`); queue position still comes from Horizon/BullMQ's queue depth for that job.

### 4.2 Site page current-audit card

Same lifecycle-in-miniature as v1's lobby card: `queued` → `processing` → `complete`/`cancelled`/`failed`. Compact summary (status, queue position/progress bar, one action row) — "view progress" is still the link to the full `progress.html` experience. Cancelling jumps straight to the `cancelled` terminal state without navigating away.

## 5\. Business logic

### Fix-time estimate

Unchanged: hardcoded `axe rule ID → effort tier` lookup table (quick win / structural), maintained by hand. Drives quick-wins-first sort per `style-guide` section 7\.

### Issue-age tracking

Each `audit_violations` row gets a `first_seen_at` timestamp — the date a given violation (matched by rule \+ DOM fingerprint) was first detected on that domain, carried forward across re-audits rather than reset each scan. Surfaced as "open N days" on the Dashboard's open-critical-issues metric and the Site page's open-issues snapshot. This is the mechanism agreed on in place of any lawsuit/legal-risk scoring — see `style-guide` section 1\.

## 6\. Data model

- `audits.user_id` — **required (not nullable)**. Every audit belongs to an account.  
- `sites` concept — derived from distinct domains in an account's `audits`; no new table required for MVP unless per-site settings are needed later.  
- `users` table has real Fortify auth columns (password hash, remember token, etc.).  
- `users.plan` — free/pro flag, drives site cap, page cap, crawl-depth cap, re-scan-frequency cap, history retention, and queue priority (see `monetization`).  
- `audit_violations.first_seen_at` — supports issue-age tracking (section 5).

## 7\. Engineering notes carried forward from v1 mockups

1. **Isolate independent features** into separate script blocks/React components so one feature's failure can't silently disable unrelated ones.  
2. **Guard all `localStorage` access** through small helpers that catch and no-op on failure.  
3. The `type="url"` input fix (`type="text" inputmode="url"` \+ JS normalization) still applies to the URL field on `index.html`.

The email-capture modal these were originally found in is now the login/register modal — same principles apply to whichever modal ships.

## 8\. Implementation note for Claude Code

- The login/register modal replaces the email-capture modal as the submit-triggered overlay.  
- Guest-vs-logged-in conditional rendering (`auth.user` shared-prop checks from v1) can be **removed** — there's no guest state anymore.  
- New React pages, now with built mockups to translate directly: `dashboard.html` → Dashboard, `user-audits.html` → User Audits (grouped-by-domain list with inline live-status rows per section 3.2.1), `site.html` → Site page.  
- `progress.html`'s state machine (section 4.1) becomes React state driven by the real Soketi/Redis Stream subscription, not demo `setTimeout`/`setInterval` logic.  
- The inline live-status row in User Audits needs the same Soketi/Redis Stream subscription as `progress.html` — each row subscribes to its own audit's channel while active, not a polling loop.  
- Plan-limit checks (site cap, page cap, crawl depth, re-scan frequency) belong in the audit-creation request handler, reading `users.plan` — see `monetization` for the specific limit values.

## 9\. Related docs

- `style-guide` — brand identity, color/type tokens, component patterns (including the inline live-status row pattern), locked UX design principles, and the explicit no-legal-risk-framing rule (section 1).  
- `monetization` — free/Pro plan limits, combined queue-priority \+ access-scope model.  
- `CLAUDE.md` should reference this doc, `style-guide`, and `monetization`.

