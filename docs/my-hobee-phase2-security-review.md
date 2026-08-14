# MY HOBEE Phase 2 — Security Review

## Validation completed

| Area | Result |
|---|---|
| TypeScript | ผ่านด้วย `pnpm exec tsc --noEmit` |
| Regression suite | 75 passed, 1 skipped |
| RLS | ตาราง Phase 2 เปิด RLS และ query รวม organization ตรวจ membership/permission |
| Event idempotency | work items ใช้ source key, earnings ledger ใช้ unique source identity, operational events ใช้ unique `(order_id, action)` |
| Mobile operations | feed อ่านได้เฉพาะ `MANAGE_ORDERS`; write actionsต้องผ่าน RPC พร้อม transition validation |
| Tracking | shipping RPC บังคับ carrier และ tracking number และเรียก transition validator กลาง |
| Deep links | notification route จำกัดเฉพาะ `/orders/*` และ `/my-hobee/*` ที่ allow-listed |

## Security Advisor

เปลี่ยน `list_my_hobee_operation_orders()` เป็น **SECURITY INVOKER** แล้ว เนื่องจากเป็น read-only query ที่ RLS รองรับครบ ทำให้ไม่เหลือ warning สำหรับ feed นี้

warning ที่เหลือเป็น `SECURITY DEFINER` RPC ที่ตั้งใจให้ signed-in user เรียกได้ และมีเงื่อนไข authorization ภายในทุก function พร้อม revoke จาก `anon` และ `PUBLIC` ได้แก่:

- การอนุมัติ role ตรวจ `private.is_platform_admin()`
- การจัดการ organization member ตรวจ owner/admin/permission
- การดำเนินการ order และ shipping ตรวจ `MANAGE_ORDERS` และ state transition
- การอ่าน notification/work item update ได้เฉพาะ `auth.uid()` ของเจ้าของรายการ
- การสร้าง booking ตรวจ listing link และคำนวณราคาในฐานข้อมูลจาก catalog จริง

> Warning **Leaked Password Protection Disabled** เป็นการตั้งค่า Supabase Auth ระดับ project ที่เจ้าของระบบควรเปิดใน Supabase Dashboard ก่อน production launch. ไม่สามารถเปิดผ่าน mobile client ได้อย่างปลอดภัย
