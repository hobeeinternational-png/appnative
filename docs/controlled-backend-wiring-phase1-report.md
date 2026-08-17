# HOBEE Mobile — Controlled Backend Wiring Phase 1 Report

## Executive summary

Controlled Backend Wiring Phase 1 is prepared on **Baseline B**, the current source at checkpoint `7e3856f3`. The originally requested Final UI Audit source (`fab34c50`) could not be recovered through the managed restore path because the remote rejected the rollback push; this is documented as a recovery boundary rather than being hidden. No production rows, production transaction, payment credential, service-role credential, or Vercel deployment was changed.

The QA environment is the disposable Supabase development branch **`hobee-qa-identity`** with project reference **`islisdlzuadwvxsocozj`**. Its branch health is active, its parent is `tfqrykzqvdqxjnhzevvn`, and it starts without production Auth data. Controlled test personas, organizations, memberships, role profiles, a pending role application, and permission grants are prepared as guarded idempotent SQL. They remain unexecuted until the disposable QA Auth identities are provisioned.

| Workstream | Result | Evidence |
|---|---|---|
| Production isolation | Complete | QA branch is separate, has no production Auth rows, and seed/reset scripts carry a session guard |
| Personas and memberships | Prepared | `docs/test-personas.md`, `supabase/qa/seed_identity_qa.sql` |
| Permission contract | Mapped to existing schema only | `docs/permission-matrix.md` |
| RLS/RPC verification | Matrix prepared; live execution blocked on QA Auth identities | `docs/rls-verification-matrix.md` |
| Profile source wiring | Complete on Baseline B | Shared identity repository powers Account and My HOBEE profile display |
| Admin session hardening | Complete on Baseline B | Admin cache clears on logout, denied refresh, or authorization error |
| UI modules from Final UI Audit | Not recovered | `docs/recovery-gap-register.md` |

## Validation record

| Check | Result | Notes |
|---|---|---|
| TypeScript | Passed | `pnpm exec tsc --noEmit` completed successfully on Baseline B |
| Lint | Passed with 0 errors / 29 warnings | Warnings are pre-existing style/hook/dead-import debt and are not auto-fixed in this wiring phase |
| Full regression | 93 passed / 1 skipped | This is the transparent Baseline B count, not the unrecoverable Final UI Audit count |
| Controlled artifact regression | 9 passed | Covers seed guard, no Auth/password provisioning in source, RLS matrix, profile mapping, UI wiring, and admin cache clearing |

## Security and architecture boundary

The application retains email/phone plus password as its primary authentication architecture. Magic Link is not reintroduced. Profile display prefers `profiles` data when it exists, then falls back to Auth metadata only for display. Authorization remains server-side: RLS and protected RPC functions evaluate database membership/permission records; hidden UI is not treated as a security boundary. A service-role query cannot validate RLS behavior, so the live matrix must be run with actual QA user sessions after provisioning.[1]

> The QA seed intentionally does not insert into `auth.users`, store a password, or run under production. Disposable branch identities must be created by an owner through the QA branch’s Auth administration interface.

## Owner action register

| Priority | Owner action | Reason | Unblocks |
|---|---|---|---|
| P0 | Provision the 20 `qa.hobee.invalid` Auth identities in `hobee-qa-identity` | Seed refuses to run until every disposable identity exists; it never creates Auth users directly | Seed execution, actual login/session/RLS tests |
| P0 | Configure local-only QA branch URL and publishable key for a device/test build | Keeps production app configuration unchanged while enabling real QA sign-in | Native session restore and organization-switcher tests |
| P1 | Enable Supabase Phone Auth and configure its provider | Phone/password screen is prepared but provider state was not altered by this phase | Phone login acceptance tests |
| P1 | Enable leaked password protection | Security advisor exposed this as an unresolved Auth setting | Production authentication hardening |
| P1 | Recover Final UI Audit artifacts when available | Baseline B lacks Local Stores, Travel, Food, Learning, Community, and the Final UI Audit source/tests | Restoration of higher UI baseline |
| P2 | Reconnect the intended Vercel team and set server-only secrets | Required later for payment/webhook backend, not this identity phase | Payment sandbox and webhook integration |

## Next controlled execution sequence

Once P0 is complete, run the guarded seed only against `islisdlzuadwvxsocozj`, authenticate personas one at a time, and execute `docs/rls-verification-matrix.md`. Verify customer isolation, suspended membership denial, cross-organization switching, role approval, admin revocation, session restore, and logout. Capture outcomes without storing credentials in code, logs, or test fixtures, then reset the branch data or discard the non-persistent branch.

## References

[1]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase Row Level Security guide"
