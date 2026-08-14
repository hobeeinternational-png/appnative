# After-Sales Operations Center — Security Review

## Validation results

| Area | Result |
|---|---|
| TypeScript | ผ่านด้วย `pnpm exec tsc --noEmit` หลังหยุด development stack ชั่วคราวเพื่อลด memory pressure |
| Regression suite | 84 passed, 1 skipped |
| RLS | case, evidence, refunds, returns, replacement, domain events, SLA, preferences และ delivery outbox ยังคงเปิด RLS |
| Case isolation | customer read/write ได้เฉพาะ case ของตน; seller ต้องผ่าน shop-organization link และ exact permission; admin เป็น global review scope |
| Work/event idempotency | `event_key`, Work Inbox source key และ notification source key ใช้ `ON CONFLICT` เพื่อป้องกัน duplicate จาก retry |
| Financial control | refund status transition จำเป็นต้องเป็น platform admin; action ไม่รับ amount ใหม่และไม่เรียก provider จาก mobile |
| Internal notes | RPC ตรวจ `VIEW_INTERNAL_NOTES` หรือ platform admin และ customer RLS ไม่มีสิทธิ์อ่าน |
| Push delivery | outbox เป็น best-effort; push failure ไม่ rollback case, return, refund หรือ replacement transaction |

## Security Advisor

Security Advisor รายงานระดับ **WARN** สำหรับ `SECURITY DEFINER` RPC ที่ signed-in users เรียกได้ รวมถึง after-sales procedures. การเปิดสิทธิ์นี้เป็น **เจตนา** เพราะ client ต้องเรียก protected business procedures แทน direct table write. ทุก procedure ตรวจ `auth.uid()`, customer ownership, organization permission หรือ platform-admin ภายใน และ revoke จาก `anon`/`PUBLIC` แล้ว. จึงไม่ควรเปิด RLS write policy กว้างหรือเปลี่ยนเป็น direct client update เพียงเพื่อปิด warning.

> **Owner action ก่อน production:** เปิด **Leaked Password Protection** ใน Supabase Auth Dashboard. เป็น setting ระดับ project จึงไม่เปิดจาก mobile client.
