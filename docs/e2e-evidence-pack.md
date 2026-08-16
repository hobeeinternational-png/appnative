# HOBEE Mobile — E2E Evidence Pack

ใช้เอกสารนี้เป็นแบบฟอร์มหลักฐานก่อนเปิด production. ห้ามทำเครื่องหมายผ่านด้วยการตรวจ source หรือ screenshot เพียงอย่างเดียวเมื่อกรณีนั้นต้องอาศัย runtime จริง.

## Run identification

| Field | Value |
|---|---|
| Run ID | `YYYY-MM-DD-platform-build` |
| Tester |  |
| Environment | Supabase project / Vercel deployment / Opn sandbox or production |
| Mobile build | iOS/Android build identifier |
| Device and OS |  |
| Test accounts | Customer A, Customer B, Seller Staff, Admin; ระบุ UUID/alias ที่ไม่เผยรหัสผ่าน |
| Result | PASS / FAIL / BLOCKED |

## Customer commerce evidence

| Test | Preconditions | Expected result | Evidence reference | Result |
|---|---|---|---|---|
| Email registration and login | Fresh email account | Account creates, session restores after relaunch |  |  |
| Phone login | Phone provider enabled | Thai phone normalize, success and invalid number error |  |  |
| Password reset | Configured redirect URL | Email link opens reset screen in cold start and resets password |  |  |
| Add cart and checkout | Published product with stock | Current price/stock used, no stale order value |  |  |
| PromptPay | Opn sandbox and backend deployed | Intent, signed webhook, paid order and receipt notification |  |  |
| Card | Opn sandbox and backend deployed | Token-only card flow; raw card data absent from app/backend logs |  |  |
| Payment retry/cancel | Pending payment | Retry/cancel state cannot create duplicate payment/order |  |  |
| Buy Again | Previous order | Catalog current price/stock resolves; unavailable item handled safely |  |  |
| Delivery and receipt | Shipped test order | Tracking timeline opens; customer receipt is separate from carrier delivered |  |  |
| Review | Received/completed eligible item | Review opens for eligible purchased item and moderation status is correct |  |  |

## Customer after-sales evidence

| Test | Preconditions | Expected result | Evidence reference | Result |
|---|---|---|---|---|
| Claim create | Eligible paid/delivered order | Reason, resolution, item quantity and evidence validate |  |  |
| Private evidence | Customer A case | Customer A can view upload; Customer B cannot access object or metadata |  |  |
| Case message | Submitted claim | Customer sees customer/seller messages only, never internal notes |  |  |
| Return tracking | Approved return | Tracking update applies only to own case and legal status transition |  |  |
| Refund status | Approved refund | Shows truthful provider state; no fictitious completed refund |  |  |
| Replacement | Approved replacement | Replacement tracking is distinct from original shipment |  |  |

## Seller, admin and organization evidence

| Test | Preconditions | Expected result | Evidence reference | Result |
|---|---|---|---|---|
| Seller queue access | Active linked organization membership | Seller sees only linked-shop orders/cases |  |  |
| Permission denial | No `MANAGE_ORDERS` / claim permission | Operation is denied and no mutation/audit event is created |  |  |
| Internal notes | Support member with permission | Internal note is visible only to permitted staff/admin |  |  |
| Assignment and SLA | Managed case | Assignment, SLA risk and queue priority show real timestamps |  |  |
| Refund authorization | Finance/admin controlled account | Amount/quantity guard, provider request and callback are auditable |  |  |
| Admin session | Admin account | Reload, revoke/logout and route guard preserve authorization boundary |  |  |

## Notification and security evidence

| Test | Preconditions | Expected result | Evidence reference | Result |
|---|---|---|---|---|
| iOS notification | Physical iPhone with token | Foreground/background/cold start opens allow-listed entity only |  |  |
| Android notification | Android 13+ with token | Permission/channel and cold start routing are correct |  |  |
| Outbox retry | Controlled delivery failure | Source transaction remains committed, delivery retry is bounded/idempotent |  |  |
| Webhook signature | Provider fixture | Invalid signature/amount/order transition is rejected and logged |  |  |
| Duplicate webhook | Replayed webhook | One payment/refund state change and one audit chain only |  |  |
| Cross-account data isolation | Customer A/B | RLS rejects B access to A order, claim, evidence and notification |  |  |

## Exit criteria

The release owner signs off only when each critical row is PASS with an evidence reference. A BLOCKED row must include an owner, required external action and a retest date. Any FAIL in payment, authentication, case isolation, webhook verification or evidence privacy blocks production release.
