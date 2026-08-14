# HOBEE Customer Commerce Journey — Operating Model

## Lifecycle mapping

HOBEE จะคง `orders.status`, `payments.status` และ `shipments.status` เดิมไว้ โดยใช้ **derived customer lifecycle** ที่รวม source จริงหลายตัวแทนการเพิ่มสถานะที่อาจทำลาย API contract

| Customer-facing state | Source of truth | หมายเหตุ |
|---|---|---|
| Awaiting payment | `orders.payment_status = pending` | แสดง payment retry/cancel ตามกติกาเดิม |
| Paid / confirmed | `payment_status = paid` และ `orders.status` | คง provider payment state เดิม |
| Preparing | `orders.status = processing` | มาจาก operation ที่ seller มีสิทธิ์ทำ |
| Ready to ship | operation event `READY` | ไม่เพิ่ม order status ใหม่ |
| Shipped / in transit / out for delivery | `shipments.status` | map เป็น timeline การขนส่ง |
| Delivered | `shipments.delivered_at` หรือ shipment status `delivered` | **ไม่เท่ากับ** customer received |
| Completed | `orders.customer_received_at` หรือ future auto-complete receipt event | derived completion โดยไม่เขียน order status ใหม่ |
| Cancelled / refunded | status เดิม + refund record | partial refund แสดงจาก refund records |
| Returned / replacement | return/replacement records ใน after-sales case | แยก shipment จากพัสดุเดิม |

## Customer receipt and auto-completion policy

เพิ่ม `orders.customer_received_at` แบบ additive เพื่อแยก customer confirmation จาก `shipments.delivered_at` โดยสร้าง immutable lifecycle event ทุกครั้งที่ยืนยันรับสินค้า. Policy เก็บใน `after_sales_policies` และ default `auto_complete_enabled = false`; ไม่มี cron หรือจำนวนวัน hard-code ใน Phase นี้. เมื่อเปิด auto completion ภายหลัง ต้องเช็กว่าไม่มี case ที่เปิดอยู่ก่อนสร้าง receipt event.

## After-sales model

```text
Order / Order item / Shipment
   └─ After-sales case
        ├─ Case event audit timeline
        ├─ Messages (customer / seller / HOBEE / internal)
        ├─ Evidence (private storage)
        ├─ Refund request + refund line allocation
        ├─ Return shipment
        └─ Replacement shipment
```

| Entity | Responsibility |
|---|---|
| `after_sales_cases` | Customer issue, requested resolution, status, assignee and timestamps |
| `after_sales_case_events` | Append-only workflow/audit timeline |
| `after_sales_case_messages` | Lightweight communication; `internal` entries remain admin-only |
| `after_sales_evidence` | Storage metadata only; object lives in private Supabase bucket |
| `after_sales_refunds` / `after_sales_refund_items` | Server-authorized refund decisions and per-line allocation; never client amount source |
| `return_shipments` | Customer return tracking and receipt/inspection progress |
| `replacement_shipments` | Separate tracking for replacement fulfilment |
| `order_lifecycle_events` | Immutable customer receipt, cancellation and future auto-complete events |

## Case workflow

| Customer action | Case type | Allowed requested resolution |
|---|---|---|
| สินค้าเสียหาย / รั่ว / คุณภาพผิดปกติ | `damaged`, `quality_issue` | refund, partial refund, replacement, return and refund |
| สินค้าไม่ครบ / ได้สินค้าผิด | `missing_item`, `wrong_item` | partial refund, reship, replacement |
| พัสดุไม่ถึง / tracking ผิดปกติ | `delivery_missing`, `tracking_issue` | refund, replacement, reship |
| ต้องการคืนสินค้า / คืนเงิน | `return_request`, `refund_request` | return and refund, refund, store credit |
| อื่น ๆ | `other` | other, selected policy options |

Customer may create a draft or submit a case. Authorized seller/admin moves it through `submitted → under_review → need_more_info → approved/rejected → in_progress → resolved → closed`. The customer cannot approve a case or decide financial amounts. A partial unique index prevents duplicate active cases for the same customer, order, item and type.

## Authorization

| Actor | Allowed operations |
|---|---|
| Customer | Read own order/case/evidence, create own case/evidence, confirm receipt, submit return tracking, read own refund/replacement status |
| Seller staff | Read/manage cases only for linked shops when they have `MANAGE_ORDERS`; cannot set refund amount directly |
| Platform admin | Review all cases, add internal notes, authorize decisions through protected RPC |
| Client application | Cannot approve claim, update refund amount/status, create internal note or access evidence outside its case |

## Financial and idempotency safeguards

Refund calculation always starts from paid `payments.amount`, subtracts completed/processing authorized refund allocations, and validates order item quantity plus amount before any transition. The schema records `provider_reference` but does not call a provider from mobile. Each lifecycle, refund, return and notification event carries a unique source key to make retries idempotent.
