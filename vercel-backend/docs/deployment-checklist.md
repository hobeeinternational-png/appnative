# HOBEE Vercel Backend — Deployment Checklist

Vercel connector ของทีม HOBEE ถูกเปิดใช้งาน แต่การตรวจล่าสุดพบ **0 accessible projects** จึงยัง deploy หรือ health-check runtime ไม่ได้

1. Platform Owner สร้าง Vercel project จาก `vercel-backend/` หรือ grant access ให้ทีมที่เชื่อมต่ออยู่
2. ตั้งค่า variables ตาม [environment-variables.md](./environment-variables.md) ทั้ง Preview และ Production
3. Deploy และเรียก `GET /api/health`; ต้องได้ HTTP 200 และ `service: hobee-backend`
4. ตั้ง API base URL ใน config ของ mobile โดยไม่ใส่ server-only secret
5. ทดสอบ create order, server-side stock/price rejection, payment intent, signed webhook, duplicate `event_id` และ error response
6. เพิ่ม Opn sandbox key ก่อนทดสอบ PromptPay/card; เพิ่ม SHIPPOP key เฉพาะเมื่อ merchant account พร้อม โดย manual fulfilment ยังเป็น fallback

| Endpoint | Source status | Runtime status |
|---|---|---|
| `GET /api/health` | Implemented | Blocked: no accessible Vercel project |
| `POST /api/orders` | Authenticated RPC order creation | Blocked: deployment/secrets required |
| `POST /api/payments/intent` | Provider abstraction | Blocked: deployment; Opn key for provider test |
| `POST /api/payments/webhook` | HMAC, amount, transition, idempotency | Blocked: trusted sender/deployed URL required |
| `POST /api/shipments` | Manual fulfilment | SHIPPOP blocked pending merchant key |
