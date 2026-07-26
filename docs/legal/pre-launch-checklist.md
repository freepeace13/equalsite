# Legal pages — pre-launch checklist

Status: **drafted, not reviewed.** The copy at `/terms`, `/privacy`, and `/refund-policy`
(`apps/web/resources/js/pages/legal/{terms,privacy,refund-policy}.tsx`) was written from the outline in
`docs/legal/core-legal-pages-spec.md` §3 to get real, structurally-complete, cross-linked pages shipped.
It has not been reviewed by a lawyer and should not be treated as final legal language, particularly
before Equalsite starts accepting real payments (Paddle checkout going live).

## What to do before going live with real payments

1. **Get a lawyer's review of all three pages.** Send them the rendered pages (or the JSX source) —
   Terms of Service, Privacy Policy, Refund/Cancellation Policy. This is the blocking item; everything
   else below feeds into what they review.

2. **Confirm Paddle's actual refund window** (Paddle dashboard → policies) and reconcile it with
   Refund Policy §3 in `refund-policy.tsx` — that section currently says "contact us within 14 days,"
   which is a placeholder, not something pulled from Paddle's real terms. The refund policy shouldn't
   promise something more generous than Paddle enforces at checkout, or contradict Paddle's own buyer
   terms.

3. **Confirm actual audit-artifact *storage* retention**, not just the in-product display retention.
   Privacy Policy §4 in `privacy.tsx` currently states the real *current* behavior (old audits aren't
   deleted, just hidden past the plan's history window) — if that changes, or if a real deletion policy
   gets implemented, update that section to match.

4. **Decide on a real support contact** if `support@equalsite.app` (the existing `SUPPORT_EMAIL` default
   in `apps/web/.env.example`) isn't the address you want published on legal documents specifically —
   all three pages reference it for contact/rights requests.

## Once reviewed

- Update the copy directly in the three page files.
- Bump the `lastUpdated` value in the corresponding controller (`TermsController`, `PrivacyController`,
  `RefundPolicyController` under `apps/web/app/Http/Controllers/Legal/`) to the review/publish date.
- Delete this checklist file once all four items above are resolved — it's a launch gate, not permanent
  documentation.
