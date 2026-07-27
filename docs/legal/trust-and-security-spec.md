# Spec: Acceptable Use Enforcement & Security Disclosure

The two remaining items are grouped here because they're both "trust signals aimed at a technical
audience" rather than consumer-facing legal text — the people who check for these (security
researchers, engineering leads evaluating the tool for their org) are a different audience than who
reads the Privacy Policy.

## 1. Acceptable use — crawl authorization

### Why this is specific to Equalsite, not boilerplate

`docs/legal/core-legal-pages-spec.md` §3 already puts an "only scan URLs you're authorized to audit"
clause in the Terms of Service. This spec covers the *enforcement* side — what happens when someone
submits a URL they don't control — since a clause with no enforcement is just decoration.

### Current state (verified in codebase)

- No `robots.txt` handling found in `services/playwright-spider/src` — the crawler does not appear to
  check or respect the target site's own `robots.txt` before crawling it.
- No rate-limiting of *outbound* requests to the target site (distinct from the *inbound*
  `throttle:audit-submission` middleware on Equalsite's own `/audit` route, which protects Equalsite's
  queue, not the site being scanned).
- No mechanism to flag/block a domain after abuse reports.

### What's worth building, roughly in priority order

1. **Respect `robots.txt` on the crawled target** — both a good-citizen practice and a concrete,
   checkable claim the Terms of Service / FAQ can make ("we respect robots.txt"). Crawlee (already in
   use per `docs/architecture.md`) has built-in robots.txt support in its crawler classes — this is
   likely a configuration change, not new infrastructure. Verify current Crawlee crawler config in
   `services/playwright-spider/src` before assuming it needs to be added from scratch.
2. **A simple domain block-list** — a config-level or DB-level list of domains Equalsite refuses to
   crawl (e.g., after receiving an abuse complaint), checked at audit-creation time in
   `Actions\Audit\CreateAudit`, alongside the existing plan-limit checks it already performs
   (`docs/monetization.md` §2). This is a small addition to an existing enforcement point, not a new
   subsystem.
3. **An explicit self-certification checkbox at audit-submission time** ("I confirm I'm authorized to
   audit this URL") on the audit-creation form — cheap to build, and it's the thing that actually
   shifts liability toward the user per the ToS clause, rather than the clause doing that work alone
   buried in a legal document nobody reads before submitting a URL.

None of this needs to be perfect at launch — even just the self-certification checkbox plus a
documented (not necessarily automated) abuse-complaint process is a defensible starting position.
Automated `robots.txt` respect is the one item worth prioritizing since it's likely cheap (Crawlee
config) and directly backs a claim you can put in the FAQ.

## 2. Security vulnerability disclosure

### Current state

No `security.txt`, no `/security` page, no documented reporting path. `apps/web/public/` has a
`robots.txt` but nothing under `.well-known/`.

### What to build

- **`public/.well-known/security.txt`** (RFC 9116 format) — the standard machine-readable location
  security researchers and scanners check first:

  ```
  Contact: mailto:security@equalsite.app
  Expires: 2027-07-26T00:00:00.000Z
  Preferred-Languages: en
  ```

  Reuse the same `SUPPORT_EMAIL`-style env var pattern from
  `docs/legal/faq-and-support-spec.md`, or a dedicated `security@` alias if you want reports triaged
  separately from general support — reasonable either way at this scale, but pick one and keep
  `security.txt` and the FAQ's "report a security issue" answer pointing at the same address.

- **A short human-readable `/security` page** (optional but recommended, since Equalsite is itself an
  accessibility/security-adjacent tool and a segment of its audience — developers, agencies — will
  specifically look for this): states that responsible disclosure is welcome, gives the same contact,
  and sets expectations (e.g., "we aim to acknowledge reports within 3 business days"). No bug-bounty
  program implied unless you actually intend to run one — don't promise payouts you haven't budgeted.

### Not needed yet

A formal bug-bounty program (HackerOne/Bugcrowd) — that's a scale/maturity step past a
`security.txt` file and a stated contact, and shouldn't block anything else in this spec series.

## 3. Build order

1. `public/.well-known/security.txt` + `/security` page — pure content, no engineering dependencies,
   can ship independently of everything else in this spec series.
2. Verify current Crawlee crawler config for `robots.txt` handling; enable/configure it if not already
   respected.
3. Self-certification checkbox on the audit-submission form.
4. Domain block-list check added to `Actions\Audit\CreateAudit`, alongside existing plan-limit
   assertions — lowest priority here since it's reactive (needs an actual abuse report to matter) and
   least likely to block a first real customer.
