# HOBEE MOBILE — TECHNICAL DEBT BEFORE BACKEND WIRING

## P0 — Must resolve before production wiring or production release

| Item | Why it matters | Owner action |
|---|---|---|
| Controlled test personas and organization memberships | Role, organization, case isolation, and admin permission E2E evidence cannot be produced without them. | Provision minimal non-production or controlled accounts and memberships. |
| Vercel deployment and server-only secrets | Payment, webhook, refund and push-worker code must remain outside the mobile bundle. | Reconnect the correct Vercel owner/team and configure server-only variables. |
| Supabase Phone Auth and reset delivery validation | Phone login and password-reset runtime proof are externally blocked. | Enable the provider and run iOS/Android verification. |

## P1 — Recommended before production release

| Item | Current audit result | Recommended treatment |
|---|---|---|
| Keyboard coverage | Authentication forms use `KeyboardAvoidingView`; multiple checkout, claim, create, booking, review and admin forms rely on scroll layout only. | Add form-shell keyboard avoidance incrementally and validate on small iOS/Android devices. |
| Lint warnings | `pnpm lint` completes with 0 errors and 43 warnings, including hook dependency and array-type warnings. | Triage before production; prioritize hook dependency warnings that can affect stale UI. |
| Native device validation | Static/web validation is complete; camera, QR, push, maps, calendar and edge cases need development builds. | Run real-device matrix after development builds are created. |
| Metro cache warning | The dev server can fall back to full crawl after cache deserialization. | Clear cache only if preview restart symptoms recur; it is not a TypeScript or runtime application failure. |

## P2 — May be scheduled after backend stabilization

| Item | Rationale |
|---|---|
| Shared component consolidation | Header, card and formatting patterns are already usable; broad refactor is outside this hardening phase. |
| Tablet-specific polish | Current layouts should remain usable; a dedicated tablet redesign was intentionally deferred. |
| Unified saved taxonomy | Saved/favorite mechanics are intentionally domain-owned until backend ownership and privacy requirements are approved. |
| QR scanner experience | The exposed QR control is now disabled and announced as unavailable, avoiding a dead CTA until a scoped QR feature exists. |

> No P0 UI architecture blocker was found. The P0 items are external integration and controlled-test prerequisites.
