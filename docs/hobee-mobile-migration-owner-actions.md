# HOBEE Mobile — Migration Owner Action Register

## P0 blockers

| Owner action | Evidence | Required result | Why it blocks |
|---|---|---|---|
| Make `hobeeinternational-png/appnative` private, or migrate it to a new private HOBEE Mobile repository | GitHub inspection reports `visibility: PUBLIC` | Private repository with the intended collaborators only | The Migration Playbook requires one **private** repository per system. Do not add any deployment secret until this is corrected. |
| Confirm the intended Vercel team and grant/create project access | Connector currently sees only `sulkiflee-mateh`; no HOBEE Mobile project was verified | Dedicated Vercel project under the HOBEE owner team, linked to GitHub repo with root `vercel-backend/` | Preview/production deployment must not be created under an unrelated owner team. |
| Confirm HOBEE Mobile data isolation in HOBEE CAMPANY | Supabase project `tfqrykzqvdqxjnhzevvn` / HOBEE CAMPANY is active; source currently uses historical shared scope | Approved `hobee_mobile` schema plan or documented exception with data-owner signoff | No production schema/data move should start without isolation and validation ownership. |
| Provide canonical domain and DNS cutover owner | No domain/cutover owner is recorded | Canonical URL, DNS owner, rollback record, monitoring window | Domain changes are prohibited until preview/production gates pass. |

## P1 readiness actions

| Owner action | Required result | Enables |
|---|---|---|
| Set Vercel server-only variables through the correct HOBEE project settings | `SUPABASE_URL`, publishable key, service-role key, payment webhook secret, optional Opn key/return URL; no values in Expo/client source | Preview health, authenticated API, payment sandbox/webhook tests |
| Confirm Supabase Phone Auth and leaked-password protection settings | Provider enabled only when desired; leaked-password protection enabled | Phone/password native QA and auth hardening |
| Decide first-release optional providers | OpenAI, Resend, Vercel Cron, Google Maps, Supabase Storage scope explicitly enabled or disabled | Provider-specific replacement/disabled-state work |
| Provision QA Auth identities in `hobee-qa-identity` | Disposable test identities only, then run existing guarded seed | Actual RLS, role, membership, logout and session restoration tests |

## Explicit safety boundary

Until the P0 GitHub privacy issue is resolved, do **not** commit credentials, preview deployment payloads with secrets, database exports, user data, uploads, private URLs, or any environment file to `appnative`. The current migration work remains documentation and source-hardening only.
