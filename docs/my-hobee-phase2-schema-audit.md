# MY HOBEE Phase 2 — Schema Audit

## ข้อมูลเดิมที่นำกลับมาใช้

| กลุ่ม | ตาราง/กลไกเดิม | การใช้ใน Phase 2 |
|---|---|---|
| ผู้ใช้ | `profiles`, `user_roles`, `user_role_profiles`, `role_applications` | คงเป็น source of truth ของผู้ใช้และการสมัคร role; ขยาย approval state และ audit history โดยไม่เปลี่ยน ID เดิม |
| Commerce | `shops`, `orders`, `order_items`, `payments`, `shipments` | คง order/payment contracts และ mapping shop; เพิ่ม organization mapping เพื่อรองรับหลาย staff ต่อกิจการ |
| Travel | `travel_listings`, `travel_room_types`, departures, add-ons | นำมาเป็น resource catalog ของ booking foundation โดยไม่แก้ catalog schema เดิม |
| Rewards | `loyalty_transactions`, `user_coupons`, `coupons` | คงเฉพาะ loyalty; ไม่ใช้แทน ledger รายได้ |
| Notification | `device_push_tokens` และ bootstrap notification | ใช้ token registration เดิม; เพิ่ม in-app notification record และ deep-link type ที่ปลอดภัย |
| Work | `work_inbox_items` | ขยายให้มี organization/role/source/status/idempotency; event จาก database/server เป็นผู้สร้างรายการ |

## Constraints และ workflow ที่ต้องรักษา

1. `orders.status` เดิมรองรับ `pending → confirmed → processing → shipped → delivered` พร้อม `cancelled` และ `refunded` จึงจะ map UI label ใหม่ `รับออเดอร์/เริ่มเตรียม/พร้อมส่ง/จัดส่งแล้ว` ไปยัง status เดิม โดยไม่เปลี่ยน order contract หรือเพิ่ม `ready` ใน Phase 2
2. `orders.payment_status` และ `payments.status` มี contract เดิม ได้แก่ `pending`, `authorized`, `paid`, `failed`, `refunded`; financial records ของ Phase 2 จะอ่านจาก source ที่ชำระแล้วหรือ workflow ที่อนุญาตเท่านั้น
3. `shops.owner_id` เป็น ownership legacy ที่ต้องคงไว้; organization member/permission จะเพิ่มเป็นชั้นใหม่เพื่อให้ผู้ใช้หลายคนทำงานกับร้านเดียวกันได้
4. `role_applications` และ `user_role_profiles` มี trigger `private.sync_role_application_profile()` อยู่แล้ว; approval transition จะ reuse trigger นี้และเพิ่ม audit/notification รอบ transaction แทนการให้ mobile client แก้ `user_role_profiles` โดยตรง
5. ยังไม่มี booking persistence, earnings ledger, organization model, approval audit trail, notification table หรือ event trigger สำหรับ work inbox จึงต้องสร้างใหม่โดยหลีกเลี่ยงการซ้ำกับ catalog และ commerce ที่มีอยู่

## ช่องว่างที่ Phase 2 จะปิด

| ช่องว่าง | แนวทาง |
|---|---|
| Role approval ไม่มี `needs_changes`/audit | เพิ่ม decision API + audit table; profile status ใช้ค่าเดิมที่รองรับ |
| ผู้ใช้/กิจการเป็น one-owner only | เพิ่ม `organizations`, organization-memberships และ permission grants |
| Work Inbox ต้องสร้างด้วยมือถือ | เพิ่ม trusted database/server event procedure พร้อม unique source key เพื่อ idempotency |
| Booking มีเพียง preview math | เพิ่ม booking core foundation เชื่อม customer, organization และ travel catalog แบบ optional |
| Earnings view เป็น seller-only summary | เพิ่ม immutable earnings ledger ที่ trace source และเป็น write-only จาก trusted procedure |
| Push รับได้เฉพาะ order route | เพิ่ม in-app notifications และ validate routes สำหรับ My HOBEE/work/booking/earning |

## Security decisions

- Mobile client สามารถยื่นใบสมัคร, อ่านข้อมูลของตน และทำ quick operation ที่ RPC อนุญาตเท่านั้น
- Platform admin ใช้ role-review RPC; client ไม่สามารถอนุมัติหรือเขียน financial records ได้โดยตรง
- Organization access ใช้ `organization_memberships` + permission checks ใน RLS/RPC แทนการอาศัย `shops.owner_id` เพียงอย่างเดียว
- Event and earning writes ใช้ database procedures/triggers; ใช้ `source_type + source_id + recipient/context` เพื่อกันรายการซ้ำ
