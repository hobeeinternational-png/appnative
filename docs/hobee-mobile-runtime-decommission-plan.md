# HOBEE Mobile — Manus Runtime Decommission Plan

## Purpose

This plan prevents a partial migration from silently retaining managed-runtime fallbacks in production. It is a **sequenced replacement plan**, not authorization to delete current runtime code before provider-direct replacements have passed validation.

| Current source area | Current dependency | Production target | Removal condition |
|---|---|---|---|
| `constants/oauth.ts` | Manus OAuth portal, preview-derived API URL, `manus-runtime-user-info` cache key | Supabase password/session client and explicit API base URL | Login, logout, protected-route and password-reset tests pass on Preview/native build |
| `server/_core/sdk.ts` | Manus OAuth user hydration and task identity | Supabase JWT verification or remove unused server auth layer | Vercel API verifies Supabase bearer session server-side for all protected endpoints |
| `server/_core/heartbeat.ts` | Manus task scheduler | Vercel Cron endpoints with `CRON_SECRET` | Every active job is idempotent, authorized, and tested by Vercel invocation |
| `server/storage.ts`, `_core/storageProxy.ts` | Manus Forge storage URLs | Supabase Storage buckets with scoped access | Each active caller has bucket/key ownership policy and upload/retrieve test |
| `_core/imageGeneration.ts` | Manus Forge image service | Direct OpenAI image API or disabled feature | Server-only direct provider call/error state validated; otherwise remove UI entry |
| `_core/voiceTranscription.ts` | Manus Forge audio endpoint | Direct OpenAI transcription API or disabled feature | Server-only direct provider call/error state validated; otherwise remove UI entry |
| `_core/dataApi.ts` | Manus Data API | Direct documented third-party API or disabled feature | Provider auth, request/error behavior, and owner-approved scope validated |
| `scripts/load-env.js`, `_core/env.ts` | Manus-specific environment mapping | Explicit Vercel/Expo environment contracts | No production config reads Forge, OAuth portal, or managed preview variables |
| `app.config.ts` | Manus storage logo URL and Manus-shaped deep-link naming/comments | Bundled app assets and approved production scheme | Native build/deep-link/payment callback checks pass |

## Release sequence

1. Keep Supabase-backed mobile paths and Vercel backend source operating separately while the correct Vercel owner team/project is provisioned.
2. Deploy Vercel Preview with server-only variables, then validate `/api/health`, Supabase session verification, order/payment sandbox paths, and webhook idempotency.
3. Replace one managed runtime boundary at a time, with a focused regression test and an explicit disabled state for unavailable provider features.
4. Remove old Manus OAuth, scheduler, Forge storage, AI, voice, data, and preview URL dependencies only after the replacement gate passes.
5. Complete production mobile build, domain, monitoring, and rollback checks before any DNS or public production announcement.

## Explicit non-goals for this preparation phase

This phase does not create a Vercel project, set a secret, deploy a Preview, alter Supabase schema/data, enable a payment provider, register a domain, or change DNS. Those actions require the intended owner team, provider credentials, and a confirmed cutover plan.
