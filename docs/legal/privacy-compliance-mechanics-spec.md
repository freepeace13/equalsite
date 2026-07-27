# Spec: Cookie Consent, Sub-processor Disclosure & Data Deletion Mechanics

These three items all *operationalize* promises made in the Privacy Policy
(`docs/legal/core-legal-pages-spec.md` §3, Privacy Policy outline) rather than being standalone
documents — grouped here because they share the same audience (a regulator or a security-conscious B2B
customer checking whether the Privacy Policy's claims are actually true) and because building any one
in isolation from the others tends to produce a Privacy Policy that overpromises.

## 1. Cookie consent

### Current state

No cookie banner, no consent-management code found anywhere in `resources/js`. Laravel's session
cookie and Fortify's auth cookies are "strictly necessary" and don't legally require consent under
GDPR — but if any analytics/marketing cookie is added later (nothing currently is), that changes.

### What's actually needed now vs. later

- **Now**: nothing functionally required yet, *if* the only cookies in use are the Laravel session
  cookie and auth-related ones. Add one paragraph to the Privacy Policy's cookies section stating
  exactly this ("we use only strictly-necessary session cookies; no tracking/analytics cookies are set
  today") — this is true, checkable, and requires no UI work.
- **Later, when analytics is added** (Plausible, PostHog, GA, etc. — none present today per repo
  search): that's the trigger to build an actual consent banner. Spec that at the time, not now —
  building consent UI for cookies that don't exist yet is speculative work with nothing to test against.

### If/when a banner is needed

- A `packages/ui` molecule (`CookieConsent` or similar) rendered globally, gating any non-essential
  script tag behind consent state stored in a first-party cookie (not the thing being consented to).
- EU/UK visitors need "accept/reject" as equally weighted options, not just "accept" — a common
  compliance mistake worth avoiding from the start if this gets built.

## 2. Sub-processor / DPA disclosure

### Why this matters here specifically

Equalsite's sub-processor list is unusually short and already fully known from the codebase:

- **Paddle** — payment processing, Merchant of Record (`docs/monetization.md` §4)
- **Hosting provider** — wherever the app and crawler infra are actually deployed (not yet documented
  in this repo — confirm before publishing, since "we don't know where the servers are" is a bad look
  in a sub-processor list)
- Any mail provider used for transactional email (password reset, the new contact-form Mailable from
  `docs/legal/faq-and-support-spec.md`)

No analytics vendor exists today, so the list is genuinely short — resist the urge to pad it with
hypothetical future vendors.

### What to build

- A static sub-processor list, either as its own `/sub-processors` page or as a subsection of the
  Privacy Policy page — a subsection is simpler and avoids yet another route for a list with ~2-3
  entries. Prefer folding it into `resources/js/pages/legal/privacy.tsx` as a named section, unless a
  B2B customer specifically requests a standalone, linkable page (some procurement teams want that
  specifically — revisit if it comes up).
- Paddle already provides a DPA for its own processing — link to Paddle's published DPA rather than
  drafting Equalsite's own from scratch for that relationship. Equalsite only needs its own DPA
  template for direct sub-processors it contracts with directly (hosting, mail).

## 3. Data retention & deletion mechanics

### Current state (verified in codebase)

- **Account deletion already exists**: `resources/js/components/delete-user.tsx`, wired through
  Fortify's profile settings, deletes the user's account and (per its own copy) "all of its resources."
- **What "all of its resources" actually cascades to needs verification** — check whether deleting a
  `User` cascades to `audits` / `audit_violations` rows and Crawlee artifact files, or just orphans
  them. This is the one open engineering question this spec surfaces rather than resolves: the Privacy
  Policy (core-legal-pages-spec.md §3) cannot truthfully state "deleting your account deletes your
  data" until this cascade is confirmed or fixed.
- **No user-triggered data export** exists yet, distinct from the audit-specific
  `ExportMarkdownController` (which exports one audit's remediation report, not a GDPR-style personal
  data export).

### What's needed

1. **Verify/fix the account-deletion cascade** (engineering task, not a docs task) — confirm
   `audits`/`audit_violations` and any stored Crawlee zip artifacts are actually removed, not orphaned,
   when a user deletes their account. This should happen before the Privacy Policy is finalized,
   since the policy's deletion claims depend on it.
2. **A data export mechanism**, minimum viable version: a Settings page action that emails the user a
   JSON dump of their account + audit records (name, email, audit history, violation summaries) —
   satisfies GDPR Article 20 / CCPA "right to access" without needing a polished self-serve download
   UI on day one. Model this after the existing `GenerateRemediationMarkdown` action's shape (an
   Action class producing a file, triggered from a controller) rather than inventing a new pattern.
3. **A retention statement that matches reality**: `docs/monetization.md` describes free-tier history
   as *display*-limited (last 5 audits shown) but not *deletion* — old audits aren't destroyed. The
   Privacy Policy needs to state the real retention period for underlying data, not just what's shown
   in the UI. Pick an actual number (e.g., "audit data is retained for 24 months after your last scan
   of that site, or until account deletion, whichever is sooner") and, if it's not enforced today, file
   that as a follow-up engineering task rather than publishing a policy the system doesn't actually
   honor.

## 4. Build order

1. Engineering: verify/fix account-deletion cascade (blocks Privacy Policy finalization).
2. Engineering: decide and implement (or explicitly defer, with a stated policy) a real retention
   period for audit data.
3. Add the "no tracking cookies today" line to the Privacy Policy; skip building a consent banner
   until an actual analytics vendor is chosen.
4. Add the sub-processor subsection to the Privacy Policy page (Paddle + hosting + mail, linking
   Paddle's own DPA).
5. Build the minimal JSON data-export action once the above are settled, so it exports something
   whose retention promise it can actually stand behind.
