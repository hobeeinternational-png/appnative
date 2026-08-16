# HOBEE MOBILE — PRODUCTION INTEGRATION & REAL DEVICE VALIDATION

**Checkpoint baseline:** `7e3856f3`  
**Current release stage:** **RC — CODE COMPLETE / CONFIGURATION & EXTERNAL VALIDATION BLOCKED**  
**Assessment standard:** ห้ามเรียกว่า Production Ready จนกว่า critical path ทุกข้อจะมีหลักฐาน runtime และอุปกรณ์จริง

| Domain | Code | Configuration | Sandbox | Device | Production | Blocker / evidence |
|---|---|---|---|---|---|---|
| UI / core flows | CODE COMPLETE | CONFIGURATION READY | Automated regression passed | DEVICE NOT VERIFIED | NOT VERIFIED | Customer, seller, admin, My HOBEE และ after-sales flows อยู่ใน checkpoint |
| Auth — Email | CODE COMPLETE | CONFIGURATION READY | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | ต้องทดสอบบัญชีจริง, verification/SMTP และ reset redirect |
| Auth — Phone | CODE COMPLETE | BLOCKED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | ต้องเปิด Phone provider ใน Supabase และตั้ง SMS provider/credentials |
| Auth — Reset / session | CODE COMPLETE | CONFIGURATION READY | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | Deep link code อยู่ใน source; ต้องตั้ง redirect URLs และทดสอบ cold start |
| Leaked Password Protection | N/A | BLOCKED | N/A | N/A | NOT VERIFIED | ต้องเปิดใน Supabase Auth Dashboard |
| Supabase schema/RLS | CODE COMPLETE | ACTIVE | SANDBOX VERIFIED | N/A | NOT VERIFIED | Project `tfqrykzqvdqxjnhzevvn` มีสถานะ `ACTIVE_HEALTHY`; ต้องยืนยัน role personas จริง |
| Orders | CODE COMPLETE | BLOCKED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | Mobile ต้องมี HTTPS API base URL; ไม่มี Vercel project ที่ connector เข้าถึงได้ |
| PromptPay | CODE COMPLETE | BLOCKED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | ต้องมี Opn sandbox key, webhook secret และ backend URL |
| Card | CODE COMPLETE | BLOCKED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | Token-only design อยู่ใน source; ต้องทดสอบ provider tokenization จริง |
| Webhook | CODE COMPLETE | BLOCKED | NOT VERIFIED | N/A | NOT VERIFIED | HMAC/amount/transition/idempotency อยู่ใน source; ต้องมี deployed callback URL และ trusted sender |
| Full / partial refund | CODE FOUNDATION COMPLETE | BLOCKED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | Financial guard อยู่ใน Supabase; provider refund execution/callback ยังไม่ deployed |
| Shipping manual fulfilment | CODE COMPLETE | CONFIGURATION READY | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | Manual tracking fallback มีใน source |
| SHIPPOP | CODE STUB ONLY | BLOCKED | NOT VERIFIED | N/A | NOT VERIFIED | ต้องมี merchant credential และ endpoint contract; ห้ามประกาศ integrated |
| Push client / deep links | CODE COMPLETE | CONFIGURATION READY | STATIC VERIFIED | DEVICE NOT VERIFIED | NOT VERIFIED | Token registration, permissions และ allow-list route อยู่ใน source; ต้องทดสอบ device delivery |
| Push outbox worker | CODE FOUNDATION COMPLETE | BLOCKED | NOT VERIFIED | N/A | NOT VERIFIED | ต้อง deploy backend worker และกำหนด delivery credentials/logging |
| Customer E2E | CODE COMPLETE | BLOCKED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | รอ sandbox payment/backend/device |
| Seller E2E | CODE COMPLETE | CONFIGURATION READY | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | รอ test user personas และ realtime web/native evidence |
| Admin E2E | CODE COMPLETE | CONFIGURATION READY | NOT VERIFIED | WEB NOT VERIFIED | NOT VERIFIED | รอ admin user/session reload/case/refund test evidence |
| Organization permissions | CODE COMPLETE | CONFIGURATION READY | Procedure/RLS verified | NOT VERIFIED | NOT VERIFIED | รอ Owner/Manager/Fulfilment/Support/Finance personas |
| iOS development build | CONFIGURATION READY | BLOCKED | N/A | NOT VERIFIED | N/A | ต้องมี Apple signing/EAS access และ iPhone จริง |
| Android development build | CONFIGURATION READY | BLOCKED | N/A | NOT VERIFIED | N/A | ต้องมี Android signing/EAS access และ Android จริง |
| Security | CODE SAFEGUARDS COMPLETE | OWNER ACTION REQUIRED | Advisor verified | DEVICE NOT VERIFIED | NOT VERIFIED | SECURITY DEFINER warnings are intentional protected RPC; enable leaked-password protection |

## Required server-only configuration

| Environment variable | Required for | Where it must exist |
|---|---|---|
| `SUPABASE_URL` | Backend database/API access | Vercel Preview + Production only |
| `SUPABASE_PUBLISHABLE_KEY` | Verify mobile bearer token | Vercel Preview + Production only |
| `SUPABASE_SERVICE_ROLE_KEY` | Order/payment/webhook trusted mutations | Vercel Preview + Production only |
| `PAYMENT_WEBHOOK_SECRET` | Verify inbound payment webhook | Vercel Preview + Production only |
| `OPN_SECRET_KEY` | Opn sandbox/production payment and refund | Vercel environment only |
| `PAYMENT_RETURN_URL` | Payment redirect callback | Vercel environment only; use HOBEE scheme |
| `SHIPPOP_API_KEY` / `SHIPPOP_API_BASE_URL` | Carrier automation only | Vercel environment only when merchant approved |
| `EXPO_PUBLIC_HOBEE_API_BASE_URL` | Mobile-to-backend HTTPS base URL | Expo public configuration; never include server secrets |

## Critical release gate

The release remains blocked until every item below is supported by recorded evidence:

- [ ] Vercel project is created or access is granted, backend deployed, `GET /api/health` returns 200, and runtime logs are clean.
- [ ] Server-only variables are configured in Vercel; static secret scan confirms no secret is in Expo/mobile source.
- [ ] PromptPay and card sandbox transactions complete through payment intent, signed webhook, amount check, order state and customer notification.
- [ ] Full and partial refund sandbox flows pass, including duplicate webhook, failed refund and safe retry.
- [ ] Push outbox delivers to real iOS and Android devices; every notification opens only the intended allow-listed entity route.
- [ ] Supabase email/password and, if enabled, phone/password flows pass with real auth configuration; leaked password protection is enabled.
- [ ] Customer, seller and admin E2E scenarios are recorded, including exact organization permissions and audit trails.
- [ ] iOS and Android development builds pass the real-device test checklist.

## Owner actions required now

1. Create a Vercel project from `vercel-backend/` in the accessible team or grant the connected Vercel account access to the existing project.
2. Provide/configure Vercel server-only values listed above through the secure settings interface; do not send service-role/payment secrets in chat or put them in Expo code.
3. Provide Opn sandbox account credentials and webhook configuration to run payment/refund verification.
4. Enable Phone Auth only if an SMS provider is ready; otherwise retain phone login as **blocked** rather than advertising it as verified.
5. Open **Leaked Password Protection** in Supabase Auth Dashboard and configure the HOBEE password recovery/verification redirect URLs.
6. Provide Apple/Android signing access and real test devices to collect actual device evidence.
