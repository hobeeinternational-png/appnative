# HOBEE Mobile — Release Candidate Checklist

เอกสารนี้ระบุงานที่ต้องทำก่อนทดสอบ release candidate และก่อนเปิดใช้งานการรับชำระเงินจริง โดยแยกสิ่งที่ตรวจสอบได้จาก source code แล้วออกจากการตั้งค่าที่ต้องทำใน dashboard ของผู้ให้บริการ

## ผลการตรวจสอบในโค้ดและฐานข้อมูล

| รายการ | สถานะ | หลักฐาน |
|---|---:|---|
| TypeScript | ผ่าน | `pnpm exec tsc --noEmit` ผ่านเมื่อ 11 ส.ค. 2026 |
| Unit/integration tests | ผ่าน | 15 passed, 1 skipped (`auth.logout.test.ts`) |
| Live catalogue | ผ่าน | ทดสอบกับ Supabase HOBEE PLATFORM1 สำเร็จ |
| Supabase Security Advisor | ผ่าน | ไม่พบ security lints หลังจำกัด `payment_webhook_events` ให้ใช้ได้เฉพาะ `service_role` |
| Webhook signature | ผ่าน | HMAC ทดสอบทั้ง payload ที่ถูกต้องและ payload ที่ถูกแก้ไข |
| Payment payload integrity | ผ่าน | Order API ไม่รับราคา client; webhook ตรวจยอดเงิน; card flow รับเฉพาะ provider token |
| Replay protection | พร้อมใน backend | บันทึก `event_id` ใน `payment_webhook_events` และคืนผล duplicate โดยไม่ปรับสถานะซ้ำ |

## การตั้งค่าที่ต้องดำเนินการก่อน native authentication

1. ใน **Supabase Dashboard → Authentication → URL Configuration** เพิ่ม Redirect URL ต่อไปนี้:

   ```text
   manushobeemobile://auth/callback
   ```

2. สร้าง development build บน iOS และ Android แล้วทดสอบ Magic Link จากอุปกรณ์จริง เพราะ Expo Go ไม่รองรับ custom-scheme callback ที่คงที่สำหรับ flow นี้

3. ทดสอบการ register push token, deep link ของ notification และ permission บนทั้ง iOS และ Android โดยใช้ development build

## การตั้งค่า Vercel backend ก่อนทดสอบ checkout จริง

Vercel team `team_NDlLRcFbnWLRyIlIuf1a2doi` ยังไม่มี project ที่ connector มองเห็น จึงยังไม่มี deployment ที่ตรวจ health endpoint ได้ ให้สร้างหรือเชื่อม project ของ `vercel-backend/` แล้วกำหนด Environment Variables ใน Vercel เท่านั้น

| ตัวแปร | สถานะที่ต้องการ | หมายเหตุ |
|---|---|---|
| `SUPABASE_URL` | จำเป็น | URL ของ HOBEE PLATFORM1 |
| `SUPABASE_PUBLISHABLE_KEY` | จำเป็น | ใช้ยืนยัน bearer token ของผู้ใช้ |
| `SUPABASE_SERVICE_ROLE_KEY` | จำเป็น | server-only; ห้ามอยู่ใน Expo app หรือ git |
| `PAYMENT_WEBHOOK_SECRET` | จำเป็น | ค่าลับสุ่มเฉพาะสำหรับ HMAC webhook |
| `OPN_SECRET_KEY` | ก่อนทดสอบ Opn | ใช้ sandbox key ก่อนเสมอ |
| `PAYMENT_RETURN_URL` | ก่อนทดสอบ payment redirect | ใช้ deep link ของ HOBEE development/release build |
| `SHIPPOP_API_KEY` | ไม่บังคับ | กำหนดเมื่อเปิดใช้ provider จัดส่งจริง |

หลัง deployment ให้กำหนด URL ที่ได้ในค่าคอนฟิกฝั่ง mobile สำหรับ API base URL แล้วทดสอบตามลำดับ: create order → payment intent → provider callback/webhook → order status → push notification

## ขั้นตอนก่อนเปิดรับเงินจริง

1. ได้รับและตั้งค่า Opn sandbox credential บน Vercel
2. ทดสอบ PromptPay QR และบัตรที่ tokenized บน sandbox โดยไม่ส่งข้อมูลบัตรผ่าน HOBEE API
3. ยืนยัน Opn webhook endpoint กับ provider และทดสอบ duplicate event กับยอดเงินที่ไม่ตรง
4. ทดสอบ checkout, callback, order history และ push notification ใน development build บน iOS และ Android
5. เปิดใช้ production key หลังจาก checklist ข้างต้นผ่านทั้งหมดและมีการอนุมัติแยกต่างหาก
