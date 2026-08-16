# HOBEE Mobile — Production Integration Audit

**Audit baseline:** checkpoint `7e3856f3`  
**Assessment rule:** source-complete, sandbox-verified, real-device verified และ production-verified เป็นคนละระดับหลักฐาน จึงไม่ใช้คำว่า production ready จนกว่าจะมี evidence ครบ critical path

| Domain | Code | Configuration | Sandbox | Device | Production | Current evidence / blocker |
|---|---|---|---|---|---|---|
| Mobile UI / commerce journey | Complete | Ready | Automated regressions passed at checkpoint | Not verified | Not verified | Customer, seller, admin และ after-sales workflows มีใน source แล้ว |
| Supabase project | Complete | Active | Schema/RLS migrations applied | N/A | Partially verified | `tfqrykzqvdqxjnhzevvn` สถานะ `ACTIVE_HEALTHY`; Auth setting และ provider QA ยังไม่เสร็จ |
| Orders | Complete | Requires backend URL | Unit-tested | Not verified | Blocked | Mobile ต้องมี `EXPO_PUBLIC_HOBEE_API_BASE_URL` เป็น HTTPS; Vercel backend ยังไม่มี accessible project |
| Payment intent / webhook | Complete | Requires secrets | Static/unit-tested only | Not verified | Blocked | PromptPay/card abstraction, HMAC, amount/transition/idempotency มีใน source แต่ไม่มี deployed runtime หรือ Opn sandbox credentials |
| Refund / partial refund | Foundation complete | Requires provider integration | Financial guards/RLS verified | Not verified | Blocked | After-sales refund state machine มีแล้ว แต่ไม่มี provider refund endpoint/callback ที่ deployed และทดสอบจริง |
| Shipping | Manual fulfilment complete | SHIPPOP optional | Static only | Not verified | Blocked for provider | Manual tracking ทำงานตาม source; SHIPPOP ถูก reject โดยเจตนาจนกว่าจะมี merchant credential |
| Push notifications | Client/outbox foundation complete | Requires delivery worker + device token | Static routing only | Not verified | Blocked | Mobile registers token และ deep link allow-list; Vercel push worker/runtime ยังไม่ deployed |
| Auth | Email/phone-password code complete | Phone provider and leaked-password setting unverified | Static only | Not verified | Blocked | Email/phone login, registration, reset, session restore, logout อยู่ใน source; Supabase Advisor ยืนยัน leaked password protection ยังปิด |
| Admin / organization permissions | Complete | Supabase role data required | RLS/procedure tests passed at checkpoint | Not verified | Not verified | Admin/role approval/after-sales และ exact org permissions อยู่ใน source; ต้องทดสอบผู้ใช้จริงแยก roles |
| Deep links | Complete | Redirect/associated config needs device validation | Route tests passed at checkpoint | Not verified | Not verified | Scheme and safe route validator อยู่ใน app; callback/notification cold start ต้องทดสอบจริง |
| iOS / Android builds | Configuration ready | Requires Apple/Android signing | Config validated at checkpoint | Blocked | N/A | Native permission/config plugins อยู่ใน source; ยังไม่มี development-build/device evidence |
| Security | Code safeguards complete | Owner action required | Advisor reviewed | Not verified | Not verified | Signed-in SECURITY DEFINER RPC warnings เป็น design ที่มี authorization ภายใน; Leaked Password Protection ต้องเปิด |

## Vercel audit

Vercel connector เปิดใช้งานและเข้าถึงทีม `sulkiflee mateh` ได้ แต่ `list_projects` ให้ผลเป็น **0 projects**. จึงไม่สามารถ deploy, set environment, inspect runtime logs หรือ health-check endpoint ได้ในขณะนี้.

Backend source มี `GET /api/health`, orders, payment intent, signed payment webhook และ manual shipment endpoints. Runtime configuration ปัจจุบันบังคับ `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PAYMENT_WEBHOOK_SECRET`; รองรับ `OPN_SECRET_KEY` และ `PAYMENT_RETURN_URL`. ยังต้องเติม deployed refund provider callback, push outbox worker และ SHIPPOP runtime integration ก่อนเรียกว่า sandbox-verified.

Static secret scan ไม่พบ production service-role, Opn หรือ payment secret ที่ฝังใน source/mobile bundle. ผลที่พบเพียง `sb_secret_test` ใน test fixture ซึ่งไม่ใช่ credential จริง. เพิ่ม `vercel-backend/.env.example` เป็นชื่อ variables เท่านั้น เพื่อให้ตั้งค่าใน Vercel Project Settings โดยไม่ส่งค่า secret ผ่าน repository หรือ Expo public environment.

## Supabase security audit

Security Advisor ล่าสุดพบ warning หลักสองกลุ่ม. กลุ่มแรกคือ RPC แบบ `SECURITY DEFINER` ที่เปิดให้ `authenticated` เรียก ซึ่งเป็น intentional boundary สำหรับ order, case, refund, organization และ work actions; ทุก procedure ต้องคง authorization ภายในและไม่ควรเปลี่ยนเป็น direct client write เพื่อปิด warning เพียงอย่างเดียว. กลุ่มที่สองคือ **Leaked Password Protection Disabled** ซึ่งเป็น owner action ที่ต้องเปิดผ่าน Supabase Auth Dashboard ก่อน production.

## Critical production blockers

1. ไม่มี Vercel project ที่ connector เข้าถึงได้ จึงไม่มี runtime/health endpoint หรือที่เก็บ server-only secrets.
2. ไม่มี Opn sandbox credentials, payment webhook secret และ deployed callback URL จึงยังยืนยัน PromptPay/card/refund จริงไม่ได้.
3. Push outbox worker ยังไม่มี runtime และยังไม่มี physical-device token/delivery evidence.
4. Phone Auth provider, Supabase redirect settings และ Leaked Password Protection ยังไม่มีหลักฐานการตั้งค่าจริง.
5. ยังไม่มี iOS/Android development build, signing หรือ evidence จากอุปกรณ์จริง.
