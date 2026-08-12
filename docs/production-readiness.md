# HOBEE Mobile — Production Readiness Matrix

**Source checkpoint baseline:** `86b8b86b`  
**Assessment rule:** Code completion is not production verification. Native flows require deployed runtimes and physical-device evidence.

| Domain | Status | Evidence / Boundary |
|---|---|---|
| Mobile UI | **PASS** | Shared HOBEE design system is applied across primary customer flow. |
| Favorites | **PASS** | `/favorites` uses existing authenticated Supabase favorites, ProductCard, unfavorite, refresh, loading/empty/auth states. |
| Rewards | **PASS** | Real `loyalty_transactions` and `user_coupons` drive balance/history; empty tables render true empty states. |
| Supabase | **PASS** | RLS enabled and latest Security Advisor result returned no lints. |
| Vercel | **BLOCKED** | Connector found no accessible backend project or deployment. |
| Orders | **READY BUT REQUIRES CREDENTIAL** | Server RPC owns price/stock checks once Vercel environment is configured. |
| Payment | **READY BUT REQUIRES CREDENTIAL** | HMAC, amount checking, state transitions and event idempotency exist; Opn sandbox key/deployment missing. |
| Shipping | **READY BUT REQUIRES CREDENTIAL** | Manual fulfilment works as fallback; SHIPPOP waits for merchant credentials. |
| Push | **NOT TESTED ON DEVICE** | Native permission, token storage, Android channel and deep-link code exist; needs device build. |
| Magic Link | **NOT TESTED ON DEVICE** | Scheme/callback screen exist; Supabase redirect and device cold-start/foreground tests remain. |
| Security | **PASS** | No source credential literal in last secret scan; server-only env contract, RLS and webhook safeguards reviewed. |
| iOS build | **BLOCKED** | Requires EAS/Apple signing plus real device. |
| Android build | **BLOCKED** | Requires EAS/Android signing plus real device. |

## Exact owner actions

1. Create or grant access to the Vercel backend project, then set the variables in [environment-variables.md](../vercel-backend/docs/environment-variables.md).
2. Add `manushobeemobile://auth/callback` in Supabase Authentication URL Configuration.
3. Provide/configure Opn sandbox credential on Vercel and complete webhook sandbox tests.
4. Provide SHIPPOP merchant credential only if live carrier automation is needed; otherwise keep manual fulfilment.
5. Build and install iOS/Android development clients, then test Magic Link, denied/allowed push permission, notification tap, keyboard, safe areas and checkout flow.

> The source is **code complete with configuration-ready flows**. It is **not production verified** until Vercel runtime, provider sandbox and physical-device QA have passed.
