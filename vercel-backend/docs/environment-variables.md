# HOBEE Vercel Backend — Environment Variables

ตั้งค่าใน **Vercel Project Settings → Environment Variables** เท่านั้น ห้ามบันทึกค่าจริงใน Expo app, repository หรือแชต

| Variable | Required | Purpose |
|---|---:|---|
| `SUPABASE_URL` | Yes | URL ของ HOBEE PLATFORM1 |
| `SUPABASE_PUBLISHABLE_KEY` | Yes | ตรวจ bearer token ของผู้ใช้ |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | สิทธิ์ server-only สำหรับ order/payment/webhook |
| `PAYMENT_WEBHOOK_SECRET` | Yes | HMAC secret สำหรับ trusted sender |
| `OPN_SECRET_KEY` | For Opn | ใช้ sandbox ก่อน production |
| `PAYMENT_RETURN_URL` | For redirects | `manushobeemobile://payment/callback` |
| `SHIPPOP_API_KEY` | Optional | เปิด integration หลัง merchant approval |
| `SHIPPOP_API_BASE_URL` | Optional | Endpoint ที่ยืนยันจากบัญชี SHIPPOP |
