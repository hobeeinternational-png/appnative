# MY HOBEE Phase 2 — Operating Model

## หลักการ

Phase 2 แยกบุคคล, กิจการ, สิทธิ์, งาน และรายได้ออกจากกัน โดยคง `profiles`, `shops`, `orders`, `order_items`, `payments`, `travel_listings` และ `user_role_profiles` เป็น source of truth เดิม ระบบใหม่จะเชื่อมข้อมูลเหล่านั้นผ่าน foreign keys หรือ linking tables และไม่เปลี่ยน ID, auth หรือ payment contract ที่ใช้งานอยู่

## Organization model

```text
Profile
  └─ organization_memberships ──> Organization
                                     ├─ organization_shop_links ──> Shop
                                     └─ organization_travel_listing_links ──> Travel listing

Organization membership
  └─ organization_member_permissions
```

| Entity | บทบาท | ข้อจำกัดสำคัญ |
|---|---|---|
| `organizations` | นิติบุคคล/กิจการของ Store, Hotel, Tour Company, Service Business, Partner Company หรือ HOBEE | มี owner profile, ไม่มีการบังคับให้ user หนึ่งคนมีได้เพียงองค์กรเดียว |
| `organization_memberships` | สมาชิกกิจการและตำแหน่ง Owner/Manager/Staff/Fulfilment/Reception/Finance/Admin | ผู้ใช้หนึ่งคนอยู่หลายองค์กรได้ |
| `organization_member_permissions` | สิทธิ์ระดับสมาชิก | ใช้ exact permission เช่น `MANAGE_ORDERS` ไม่อาศัยชื่อ role เพียงอย่างเดียว |
| links | เชื่อม organization กับ shop/travel listing เดิม | รักษา `shops.owner_id` และ travel catalog เดิม |

Permission ที่รองรับใน Phase 2 ได้แก่ `VIEW_ORDERS`, `MANAGE_ORDERS`, `VIEW_BOOKINGS`, `MANAGE_BOOKINGS`, `VIEW_EARNINGS`, `MANAGE_STAFF`, `MANAGE_PRODUCTS`, `MANAGE_ROOMS`, `APPROVE_ACTIONS`

## Role approval model

| Record | หน้าที่ |
|---|---|
| `role_applications` | ใบสมัครต้นทางของผู้ใช้; ขยาย status ด้วย `needs_changes` และ `suspended` |
| `user_role_profiles` | สิทธิ์บทบาทที่ใช้ใน mobile; sync จาก application trigger เดิม |
| `role_application_audit_logs` | immutable audit trail ของ submitted, reviewing, needs_changes, approved, rejected, suspended และ reactivated |
| `review_role_application(...)` | RPC เฉพาะ platform admin ที่ตรวจ `auth.uid()` และบันทึก reviewer, decision note, audit trail, notification ใน transaction เดียว |

การอนุมัติไม่เปิดเป็น direct table update จาก mobile client. Admin Center เรียก protected RPC เท่านั้น และ role profile จะ sync ผ่าน trigger ที่มีอยู่

## Event-driven work model

`work_inbox_items` จะเพิ่ม organization, role context, source type, source id, workflow status และ source key เพื่อให้ event เดียวสร้างรายการได้เพียงครั้งเดียวต่อผู้รับ

| Source event | ผู้รับ | Work item |
|---|---|---|
| Order created/status changes | สมาชิก organization ที่มี `VIEW_ORDERS`/`MANAGE_ORDERS` | `ORDER` |
| Booking created/status changes | สมาชิก organization ที่มี `VIEW_BOOKINGS`/`MANAGE_BOOKINGS` | `BOOKING` |
| Role decision | ผู้สมัคร | `APPROVAL` + notification |
| Future creator/teacher/service/employee assignment | role target | existing item types ตาม domain |

`private.upsert_my_hobee_work_item(...)` ทำงานจาก trigger/RPC ในฐานข้อมูล, ใช้ unique source identity และไม่อนุญาตให้ client สร้าง event operational เอง

## Order operations

order schema เดิมยังคง status `pending`, `confirmed`, `processing`, `shipped`, `delivered` เพื่อไม่ทำลาย Vercel/API contract. สถานะ `READY` ที่ผู้ใช้ต้องการเก็บใน `order_operation_events` แล้วแสดงใน UI เป็นขั้น “พร้อมส่ง”

| Quick action | Preconditions | Order status ที่อัปเดต | Event |
|---|---|---|---|
| รับออเดอร์ | `pending` | `confirmed` | `ACCEPTED` |
| เริ่มเตรียม | `confirmed` | `processing` | `PREPARING` |
| พร้อมส่ง | `processing` | คง `processing` | `READY` |
| จัดส่งแล้ว | `processing` และมี `READY` | `shipped` | `SHIPPED` |
| ส่งสำเร็จ | `shipped` | `delivered` | `COMPLETED` |

`perform_my_hobee_order_operation(...)` ตรวจ organization membership + `MANAGE_ORDERS` ก่อนทุก transition, insert audit event และส่ง notification/event โดยไม่เปิด direct update ให้ client

## Booking foundation

`bookings` เป็น foundation ร่วม Hotel, Tour และ Service โดยมี customer, organization, booking type, listing/room optional, start/end, quantity, guests, amount, payment status, booking status, notes และ timestamps. Amount สำหรับ travel/hotel ใช้ source price จาก `travel_listings` หรือ `travel_room_types`; ไม่รับ financial total เป็น source of truth จาก client

## Earnings ledger

`earnings_ledger` เป็น immutable source-traceable record สำหรับ `SELLER_ORDER`, `AFFILIATE_COMMISSION`, `CREATOR_JOB`, `TEACHING`, `HOTEL_BOOKING`, `TOUR_BOOKING`, `GUIDE_JOB`, `SERVICE_JOB`, `PARTNER_SHARE` โดยมี gross, fee, commission, net, currency, status, earned/available/paid timestamps และ source identifier.

สำหรับ Phase 2 จะสร้าง seller order earning อัตโนมัติเมื่อ payment ของ order เป็น `paid`, โดยใช้ subtotal line items ของ organization ที่เกี่ยวข้องและกำหนด fee/commission เป็นศูนย์จนกว่าจะมี settlement contract จริง. ทุก row เชื่อมกลับไปยัง order และ organization ได้เสมอ

## Notification model

`user_notifications` เก็บ in-app notification, read status และ route ที่ validate ได้. Push token และ push delivery เดิมคงอยู่; ความล้มเหลวของ push ต้องไม่ rollback role/order/booking/earning transaction

## Authorization policy

1. Platform admin ใช้ `private.is_platform_admin()` สำหรับ role approval และ system oversight.
2. Organization queries ตรวจ active membership และ exact permission ผ่าน `private.organization_has_permission(...)`.
3. Customer อ่าน booking/order/notification/earning ของตัวเองเท่านั้น.
4. Ledger and audit logs ไม่มี RLS policy สำหรับ client insert/update/delete.
5. Database triggers/RPC เป็นผู้สร้าง events, work items, notifications และ earning records; direct client writes ถูกปิดตามหลัก least privilege.
