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
| Push | **NOT TESTED ON DEVICE** | Native permission, token storage and Android channel exist; notification tap now permits only validated order routes and still needs device build. |
| Magic Link | **NOT TESTED ON DEVICE** | The callback now rejects non-HOBEE callback URLs; Supabase redirect and device cold-start/foreground tests remain. |
| Security | **PASS** | No source credential literal in last secret scan; server-only env contract, RLS and webhook safeguards reviewed. |
| iOS build | **READY BUT REQUIRES CREDENTIAL** | `expo-dev-client`, config plugins และ EAS profile พร้อม; ต้องใช้ EAS/Apple signing และอุปกรณ์จริง. |
| Android build | **READY BUT REQUIRES CREDENTIAL** | `expo-dev-client`, config plugins และ EAS profile พร้อม; ต้องใช้ EAS/Android signing และอุปกรณ์จริง. |

The root React Navigation packages are intentionally excluded from Expo's automatic version replacement because the installed versions are peer-compatible with the Expo Router dependency tree; this prevents duplicate native modules during build validation.

## Final source validation

| Check | Result |
|---|---|
| TypeScript | Passed: `pnpm exec tsc --noEmit` |
| Automated tests | Passed: 20 tests; 1 intentional skip |
| Supabase live catalogue test | Passed in the automated suite |
| Expo public config | Passed: `npx expo config --type public --json` |
| Expo dependency health | Passed: `npx expo-doctor` returned 18/18 checks |
| Secret-pattern scan | Passed: no credential literal found in mobile or backend source |
| Deep-link validation | Passed: tests cover allowed Magic Link scheme, payment return parsing and notification route allow-list |
| Physical device / provider sandbox | Not performed; see owner actions and device QA playbook |

## Exact owner actions

1. Create or grant access to the Vercel backend project, then set the variables in [environment-variables.md](../vercel-backend/docs/environment-variables.md).
2. Add `manushobeemobile://auth/callback` in Supabase Authentication URL Configuration.
3. Provide/configure Opn sandbox credential on Vercel and complete webhook sandbox tests.
4. Provide SHIPPOP merchant credential only if live carrier automation is needed; otherwise keep manual fulfilment.
5. Build and install iOS/Android development clients, then test Magic Link, denied/allowed push permission, notification tap, keyboard, safe areas and checkout flow.

> The source is **code complete with configuration-ready flows**. It is **not production verified** until Vercel runtime, provider sandbox and physical-device QA have passed.
