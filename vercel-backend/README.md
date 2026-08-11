# HOBEE Vercel Backend

This project is the server-only boundary for HOBEE operations that must not run in the mobile client: payment-provider calls, webhook validation, privileged order updates, and operations requiring a Supabase secret key.

The source includes `POST /api/orders`, `POST /api/payments/intent`, and `POST /api/payments/webhook`. The generic webhook template verifies `x-hobee-webhook-signature` as an HMAC SHA-256 of the raw request body. The Opn-specific endpoint (`POST /api/payments/opn-webhook`) retrieves the referenced charge through the server-side Opn API before applying a status update. It intentionally does not include database credentials. Before deployment, server-only environment variables must be configured in Vercel; no `sb_secret_*`, payment secret, or webhook signing secret may be placed in the mobile app.

Required Vercel-only environment variables:

```text
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
PAYMENT_WEBHOOK_SECRET=<unique HMAC secret>
OPN_SECRET_KEY=skey_test_...
PAYMENT_RETURN_URL=manushobeemobile://payment/callback
```
