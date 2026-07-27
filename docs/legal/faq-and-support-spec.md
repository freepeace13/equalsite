# Spec: FAQ & Support Contact Channel

Lowest-stakes pair in the legal/compliance list — these are conversion/trust tools more than legal
requirements, but every other legal doc (`docs/legal/core-legal-pages-spec.md`) references "contact us"
without a real destination today. This spec closes that gap.

## 1. Support contact channel

Every other spec in this series (Terms, Privacy, Refund Policy) points to "contact support" for
disputes, data requests, and refund requests. Right now there is no such channel anywhere in the
codebase — no support email in `.env.example`, no contact route, no ticketing integration.

### Minimum viable version

- A dedicated inbox (e.g. `support@equalsite.app` or similar), not a personal address — set as an env
  var (`SUPPORT_EMAIL`) so it's referenced consistently across ToS/Privacy/Refund pages and any contact
  form, rather than hardcoded in multiple JSX files.
- A simple `/contact` route + page (`App\Http\Controllers\Legal\ContactController` or similar,
  following the same single-action pattern as the other legal controllers) with a form that emails
  `SUPPORT_EMAIL` via a Laravel Mailable — no new infra needed, Laravel's mail stack already exists for
  Fortify's password-reset flow.
- Expected response time stated on the page (even "we aim to respond within 2 business days" is enough
  — Paddle-related refund disputes need *some* stated SLA, not necessarily a fast one).

### Not needed yet

A full helpdesk/ticketing tool (Intercom, Zendesk) — that's a scale problem, not a launch blocker.
Revisit only once support volume makes a shared inbox unmanageable.

## 2. FAQ page

### Route/page

`GET /faq` → `App\Http\Controllers\Legal\FaqController` → `resources/js/pages/legal/faq.tsx`, reusing
the shared `legal-layout.tsx` wrapper from the core legal pages spec. Link it from the same footer
locations as Terms/Privacy/Refund.

### Content outline

Group by audience concern, not alphabetically — a compliance-adjacent FAQ reads better as "things a
skeptical prospective customer would ask" than a flat list:

**About the product**
- What does an audit check? (axe-core / WCAG rules, plain-language framing)
- How long does a scan take?
- Do you store the pages you crawl? For how long? (cross-reference Privacy Policy directly rather than
  re-explaining retention here — one source of truth)

**Billing**
- What's the difference between Free and Pro? (link to pricing page/`docs/monetization.md`-derived
  copy, not the internal doc itself)
- How do I cancel? (link to Settings → Billing)
- Do you offer refunds? (link to Refund Policy, don't restate terms here — avoids the two docs
  drifting out of sync)

**Trust/legal**
- Can I scan any website, or only ones I own? (this is the FAQ's plain-language mirror of the
  Acceptable Use clause in the Terms of Service — see `docs/legal/trust-and-security-spec.md`)
- Is my data secure?
- Who can see my audit results? (only the account owner today — confirm this is still true before
  publishing, since there's no team/sharing feature yet per current data model)

**Support**
- How do I contact support? (link to `/contact`)
- I found a bug / security issue — where do I report it? (link to the security disclosure page from
  `docs/legal/trust-and-security-spec.md`)

### Content ownership caveat

Unlike Terms/Privacy/Refund, FAQ answers can be written and published without legal review — they're
descriptive, not contractual — as long as they don't contradict the actual legal docs. Worth a final
pass cross-checking FAQ claims against the published Terms/Privacy/Refund text before launch, since
FAQ answers are the ones most likely to go stale as the product changes.

## 3. Build order

1. `SUPPORT_EMAIL` env var + `/contact` route/controller/page + Mailable.
2. `/faq` route/controller/page, linked from footer and from the other legal pages where noted above.
3. Cross-check FAQ answers against Terms/Privacy/Refund copy once that's finalized (do this last, not
   first — the FAQ should describe reality, not the other way around).
