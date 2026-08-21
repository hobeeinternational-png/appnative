# HOBEE Vercel Backend — Deployment Checklist

> **Migration boundary:** Deploy this backend only through a dedicated HOBEE Mobile Vercel project linked to the private GitHub repository. The currently visible connector team is not evidence that it is the intended HOBEE owner team, therefore no production deployment is authorized until the owner confirms or grants the correct access.

1. Platform Owner creates or grants access to a dedicated HOBEE Mobile Vercel project linked to `hobeeinternational-png/appnative`, with root directory `vercel-backend/`.
2. Do not reuse the removed hardcoded preview-team manifest. If the local deployment-input generator is used, provide `VERCEL_TEAM_ID` only for the intended HOBEE owner team.
3. Set variables listed in [environment-variables.md](./environment-variables.md) through Vercel's secret manager. Configure Preview and Production deliberately; never add a server-only variable to the Expo client.
4. Deploy a **Preview** environment first and call `GET /api/health`; it must return HTTP 200 and `service: hobee-backend` before a production deployment is considered.
5. Set the mobile API base URL only after Preview validation. Public mobile configuration must not contain `SUPABASE_SERVICE_ROLE_KEY`, payment provider secrets, webhook secrets, or cron secrets.
6. Test create order, server-side stock/price rejection, payment intent, signed webhook, duplicate `event_id`, and safe error response on Preview.
7. Add an Opn sandbox key before testing PromptPay/Card. Add SHIPPOP credentials only when the merchant account is ready; manual fulfilment remains the fallback.
8. Record production URL, canonical domain decision, rollback owner, and monitoring window before any DNS or production mobile configuration change.

| Endpoint | Source status | Runtime status |
|---|---|---|
| `GET /api/health` | Implemented | Blocked: no accessible Vercel project |
| `POST /api/orders` | Authenticated RPC order creation | Blocked: deployment/secrets required |
| `POST /api/payments/intent` | Provider abstraction | Blocked: deployment; Opn key for provider test |
| `POST /api/payments/webhook` | HMAC, amount, transition, idempotency | Blocked: trusted sender/deployed URL required |
| `POST /api/shipments` | Manual fulfilment | SHIPPOP blocked pending merchant key |
