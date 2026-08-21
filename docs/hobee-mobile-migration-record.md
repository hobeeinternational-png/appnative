# HOBEE Mobile — Migration Record

**Status:** Discovery and readiness preparation only. **No cutover, production deployment, data migration, secret change, or DNS change has been performed.**

| Field | Current record | Status |
|---|---|---|
| System | HOBEE Mobile | Confirmed |
| System scope | Expo mobile client; Supabase-backed commerce, My HOBEE, after-sales, Admin Portal surface, and server-only payment/webhook source | Confirmed from source inventory |
| Current source repository | `github.com/hobeeinternational-png/appnative` | Confirmed by prior GitHub sync; required to remain private |
| Current managed preview/deployment | `hobeemob-a9fpxawt.manus.space` and managed preview URLs | Not a production target |
| Current database | Supabase project `tfqrykzqvdqxjnhzevvn` | Existing runtime; schema isolation plan pending |
| Existing QA database | Supabase branch `hobee-qa-identity` / `islisdlzuadwvxsocozj` | Active, disposable QA environment |
| Existing Vercel backend source | `vercel-backend/` | Source ready; deployment not yet proven |
| Current Vercel connector visibility | Team `sulkiflee-mateh` only | Does not demonstrate access to the intended HOBEE owner team |
| Desired Vercel project | Dedicated HOBEE Mobile project, separate from other systems | Pending owner/team confirmation |
| Desired production domain | Not supplied | Pending domain owner decision |
| Data owner | Not supplied | Pending |
| Cutover/DNS owner | Not supplied | Pending |
| Rollback point | GitHub `main`, checkpoint `5f344616`, and current managed URL | Confirmed recovery references |

## Current runtime inventory

| Area | Present implementation | Migration assessment |
|---|---|---|
| Mobile client data/auth | `@supabase/supabase-js` with public URL/key, persisted native session storage, and password auth | **Provider-direct ready**; retain public credentials only in the client |
| Server-only commerce boundary | `vercel-backend/` contains order, payment intent, generic webhook, and Opn webhook paths | **Target-ready source**; needs a dedicated Vercel project and server-only variables |
| Core app server | `server/_core/` uses Manus OAuth, Forge data API, storage, image/voice services, and heartbeat/task handling | **Migration gap**; must be retired or replaced before declaring Manus-independent production |
| Client OAuth glue | `constants/oauth.ts` and parts of `app/_layout.tsx` retain Manus OAuth/preview-derived API behavior | **Migration gap**; replace with Supabase session/provider-direct routing or remove if unused |
| Storage | Manus storage helpers remain under `server/storage.ts`; Supabase Storage is already used by product/admin flows | **Partial gap**; migrate any remaining server storage path to bucket-specific Supabase Storage |
| AI and voice | Manus Forge image/voice helpers remain in `server/_core/` | **Pending**; use direct OpenAI only if these features are intentionally retained |
| Scheduler | Manus heartbeat/task integration remains in `server/_core/heartbeat.ts` | **Pending**; migrate only active jobs to Vercel Cron with `CRON_SECRET` |
| Notifications/email | Existing push path and Vercel source exist; Resend is not configured | **Pending**; enable only when verified sender/domain and business requirement exist |
| Maps | Native Google Maps capability is present in app dependencies | **Review required**; use direct provider configuration or explicitly disable unsupported paths |

## Non-negotiable migration boundaries

The mobile app must never contain a Supabase service-role key, payment secret, webhook secret, OpenAI key, Resend key, or cron secret. Production database changes must be isolated by a documented schema/ownership plan and applied only after a migration validation gate. The managed Manus preview URL is not to be described as the future production URL.

## Intake decisions still required from owner

1. Confirm the dedicated Vercel owner team and project name for HOBEE Mobile.
2. Provide the intended canonical production domain and identify the DNS/cutover owner.
3. Confirm whether the existing Supabase project is the approved HOBEE CAMPANY target and whether HOBEE Mobile must move to a dedicated schema before production cutover.
4. Confirm which optional integrations are in scope for the first independent release: OpenAI, Resend, Vercel Cron, Google Maps, and server-side file storage.
