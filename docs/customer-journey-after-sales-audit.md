# HOBEE Customer Commerce Journey — Audit

## Schema ที่ใช้ซ้ำได้

| Domain | Existing source of truth | การต่อยอด |
|---|---|---|
| Order | `orders`, `order_items` | คง status เดิม `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`; เพิ่ม customer-facing lifecycle/event แยกแทนการแตก order status contract |
| Payment | `payments`, `orders.payment_status` | คงยอดและสถานะจาก provider; after-sales financial outcomes ต้องผ่าน protected procedure เท่านั้น |
| Delivery | `shipments` | ใช้ tracking provider, number, URL, status และ delivered timestamp เดิม; carrier delivered แยกจาก customer received event ใหม่ |
| Review | `product_reviews` | ใช้ moderation schema เดิมและผูก review invitation กับ completed order items |
| Notifications | `user_notifications`, `work_inbox_items` | ใช้ source key/idempotency และ deep-link route allow-list เดิม |
| Organization access | MY HOBEE `organization_*` tables | ใช้เพื่อ seller/admin isolation ของ case ที่ผูก shop เดิม |

## Constraints ที่ต้องรักษา

1. `orders.status` ไม่รองรับ `completed`, `ready_to_ship`, `in_transit`, `out_for_delivery`, `returned` หรือ `partially_refunded`; UI จะใช้ derived lifecycle state จาก shipment, customer received event และ after-sales records แทนการแก้ contract เดิม
2. `payments.status` รองรับ `pending`, `authorized`, `paid`, `failed`, `refunded`; partial refund ต้องมี record แยกและยอดรวมต้องไม่เกิน paid amount
3. `shipments.status` รองรับ `label_created`, `pickup_scheduled`, `in_transit`, `out_for_delivery`, `delivered`, `failed`, `returned`; จึงนำมา map กับ timeline delivery ได้โดยตรง
4. `product_reviews` มี moderation และ foreign key order อยู่แล้ว; ไม่สร้าง review table ใหม่
5. ยังไม่มี claim/case, evidence, return, refund, replacement, customer received confirmation หรือ policy tables จึงต้องเพิ่มใหม่

## Existing events

| Table | Trigger | Implication |
|---|---|---|
| `orders` | `on_order_status_changed_emit_events` | ใช้ต่อยอด notification/work event โดยไม่สร้าง order-status trigger ซ้ำ |
| `payments` | `on_payment_paid_create_earnings` | รักษา earnings event เดิม และไม่ใช้ ledger เป็น refund source of truth |
| `shipments` | `set_updated_at` | ต้องเพิ่ม dedicated shipment-after-sales trigger สำหรับ delivery events |

## Scope decisions

- Auto-completion จะเพิ่มเฉพาะ policy foundation ที่ default disabled; ไม่มี hard-coded number of days หรือ background job ใหม่ใน Phase นี้
- Refund/replacement execution จริงของ payment provider จะไม่ถูกจำลอง; ระบบจะมี server-authorized request/decision/ledger foundation เพื่อรอ Vercel provider integration
- Evidence ใช้ Supabase Storage private bucket พร้อม RLS; customer, seller ของ shop ที่เกี่ยวข้อง และ admin เท่านั้นที่เข้าถึงได้
