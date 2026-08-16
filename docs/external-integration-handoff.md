# HOBEE Mobile — External Integration Handoff

## 1. Reconnect the correct Vercel account

The currently connected Vercel integration exposes only team `sulkiflee-mateh`. The owner-confirmed team is `hobeeinternational-5067` under `hobeeinternational@gmail.com`. Reconnect the Vercel integration using the owner account, then verify that the team slug and intended backend project appear before granting any environment access.

## 2. Create or select backend project

Create/import the backend project from the HOBEE repository. Set the Vercel **Root Directory** to `vercel-backend`. The project must be able to deploy Node serverless functions and scheduled worker routes from `vercel.json`.

Before enabling production traffic, record the project name, deployment URL, production branch, preview policy and rollback method. Confirm `GET /api/health` returns HTTP 200 after deployment.

## 3. Configure server-only Vercel variables

Copy names from `vercel-backend/.env.example` into Vercel **Project Settings → Environment Variables**. Enter actual values only in Vercel for Preview/Production according to the owner policy. Never place these values in Expo environment variables, repository files or chat:

| Variable group | Required value source |
|---|---|
| Supabase trusted access | Project URL, publishable key and server-side service role key |
| Payment | Opn secret key, signed webhook secret and HOBEE payment return URL |
| Worker | Cron authorization secret |
| Shipping | SHIPPOP merchant values only after provider approval |

Set mobile `EXPO_PUBLIC_HOBEE_API_BASE_URL` only after the Vercel HTTPS deployment URL is live. This is a public endpoint base, not a secret.

## 4. Configure provider callbacks

| Provider | Required configuration | Verification evidence |
|---|---|---|
| Opn sandbox | HTTPS webhook endpoint for signed payment event; sandbox API key; callback URL | PromptPay and card success/failure/retry plus invalid/duplicate webhook logs |
| Refund | Provider refund permission and callback/event support | Full and partial refund idempotency, failed/refused refund, case audit trail |
| Expo push | Worker cron path/authorization and real device tokens | Outbox queued/sent/failed/suppressed/retry lifecycle on iOS and Android |
| SHIPPOP | Merchant credential and shipment endpoint contract | Create label/tracking/void/error evidence; until then use manual tracking fallback |

## 5. Provision controlled E2E personas

Use controlled, non-production or carefully isolated accounts:

| Persona | Minimum setup |
|---|---|
| Customer A and B | Separate email/password accounts and orders/cases for isolation checks |
| Seller Fulfilment | Active organization membership linked to test shop with `VIEW_ORDERS`, `MANAGE_ORDERS` and approved claim actions as required |
| Support | Claim queue and internal-note permission only |
| Finance/Admin | Refund authorization and admin review rights; no daily customer browsing account |

Do not create broad production roles merely to bypass a failed test. Keep entity IDs and evidence references in the E2E pack.

## 6. Device and Supabase actions

Enable Supabase Leaked Password Protection. Enable Phone Auth only after an SMS provider is ready. Configure recovery and verification redirects for the HOBEE scheme, then distribute iOS and Android development builds and execute `docs/real-device-validation-checklist.md`.

## Return trigger

When the Vercel integration is connected to `hobeeinternational-5067`, backend project access is confirmed and Opn sandbox details are configured in Vercel, reply **“Vercel พร้อมแล้ว”**. The next work will verify deployment health, run payment/refund sandbox tests, validate push outbox delivery, complete device evidence, and update the final release gate.
