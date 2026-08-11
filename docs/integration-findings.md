# HOBEE — Supabase and Vercel Integration Findings

## Supabase

The active connected account provides two healthy projects in `ap-northeast-2`:

| Project | Reference | Status | Current public tables |
|---|---|---|---|
| `hobeeinternational@gmail.com's Project` | `jiuqaoqnfhsnxxqfoxgm` | `ACTIVE_HEALTHY` | Not yet inspected in this session. |
| `HOBEE PLATFORM1` | `iwzxlsweuyuoqdslkblw` | `ACTIVE_HEALTHY` | None. The `public` schema is empty. |

`HOBEE PLATFORM1` is the selected backend for HOBEE Mobile. Its schema, RLS policies, catalogue seed data, payment webhook event store, shipment records, push tokens, loyalty data, favourites and moderated product reviews have now been applied.

## Vercel

The connected Vercel team is `sulkiflee mateh` (`team_NDlLRcFbnWLRyIlIuf1a2doi`). It currently has no Vercel projects, so a backend project has not yet been created or deployed.

## Security Reference

Supabase guidance confirms that exposed tables in the `public` schema should have Row Level Security enabled. Policies should use explicit roles and ownership checks such as `(select auth.uid()) = user_id`; service keys must remain server-only and never be embedded in the app. The design will use client-safe publishable keys in the mobile app and server-only credentials in Vercel environment variables.

Source: [Supabase Row Level Security documentation](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Implemented HOBEE Backend Foundation

The initial schema migration was applied to `HOBEE PLATFORM1` (`iwzxlsweuyuoqdslkblw`). It created 14 public tables for profiles, roles, shops, product categories, products, product variants, product images, stories, addresses, carts, cart items, orders, order items, and payments. RLS is enabled on every table. The security advisor reported two executable `SECURITY DEFINER` functions after migration; execution rights were revoked and the subsequent security advisor check returned no findings.

Four published catalogue products from the supplied HOBEE web project were seeded into Supabase. The mobile client now reads `published` products from Supabase first, and retains the local catalogue only as a resilient fallback. The publishable-key connectivity test and live catalogue test both passed.

## Magic Link Requirement

The app uses the stable scheme derived in `app.config.ts`. Before testing Supabase Magic Link on a development or release build, add the following Redirect URL in **Supabase Dashboard → Authentication → URL Configuration**:

```text
manushobeemobile://auth/callback
```

Expo Go does not support a stable custom-scheme callback. Test Magic Link in a development build or release build instead.

## Vercel Status

The source for a minimal `GET /api/health` Vercel backend is available under `vercel-backend/`. A preview deployment request returned a Vercel URL, but the connector could not subsequently locate the project or deployment, so the runtime cannot yet be verified. No server credential or payment secret has been configured or placed in the mobile project.

## Security Verification — 11 August 2026

The mobile code and Vercel backend passed TypeScript validation and 15 automated tests (with 1 intentional skip). The live Supabase catalogue check passed. Supabase Security Advisor was rerun after a service-role-only policy was added to `payment_webhook_events`; the final advisor response contained no security findings. The release checklist, including the remaining dashboard-only setup, is recorded in [release-candidate-checklist.md](./release-candidate-checklist.md).
