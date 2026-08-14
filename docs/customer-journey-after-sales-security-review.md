# Customer Journey & After-Sales — Security Review

## Validation results

| Area | Result |
|---|---|
| TypeScript | ผ่านหลังหยุด development watch ชั่วคราวเพื่อลด memory pressure |
| Regression suite | 81 passed, 1 skipped |
| After-sales RLS | เปิด RLS ครบสำหรับ cases, events, messages, evidence, refunds, return/replacement shipments, policies และ lifecycle events |
| Customer isolation | protected RPC ตรวจ `auth.uid()` เทียบกับ order buyer/case owner และ RLS จำกัดการอ่านตาม case access |
| Seller isolation | organization-shop links และ `MANAGE_ORDERS`/`VIEW_ORDERS` เป็นเงื่อนไขเข้าถึง case ที่ผูก shop |
| Financial limits | refund RPC ตรวจ paid amount, reserved refund amount, line allocation, quantity และไม่รับ client amount เป็น source of truth |
| Event idempotency | order lifecycle, case events และ notifications ใช้ source keys; active case unique index ป้องกันคำร้องซ้ำตาม scope |
| Deep links | allow-list จำกัด `/orders/*`, `/my-hobee/*`, `/claims/*` และ `/admin/after-sales` |

## Security Advisor posture

Supabase Security Advisor รายงาน `WARN` สำหรับ RPC แบบ `SECURITY DEFINER` ที่เรียกโดย signed-in users. ฟังก์ชัน after-sales เหล่านี้ตั้งใจให้เรียกจาก mobile client แต่แต่ละฟังก์ชันตรวจ authentication, ownership, membership/permission หรือ platform-admin ภายใน และ revoke สิทธิ์จาก `anon`/`PUBLIC` แล้ว จึงไม่ควรเปลี่ยนเป็น direct table writes หรือเปิด policy write ให้ client เพื่อเพียงปิด warning.

> **Owner action ก่อน production:** เปิด **Leaked Password Protection** ใน Supabase Auth Dashboard ตาม Security Advisor. การตั้งค่านี้เป็นระดับ project และไม่สามารถเปิดผ่าน mobile app ได้อย่างปลอดภัย.
