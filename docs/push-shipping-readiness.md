# Push, Deep Link & Shipping Readiness

## Static verification

| Area | Status | Evidence |
|---|---|---|
| Token registration | CODE COMPLETE | Native-only flow ขอ permission, สร้าง Expo token และ upsert `device_push_tokens` ตาม user/platform |
| Android channel | CODE COMPLETE | สร้าง channel `orders` ที่ importance สูงก่อน register token |
| In-app handling | CODE COMPLETE | Notification response ส่งต่อไป router เฉพาะเมื่อ route ผ่าน allow-list |
| Route validation | CODE COMPLETE | รองรับ orders, My HOBEE และ claims/admin after-sales; untrusted route ถูก ignore |
| Outbox worker | CODE COMPLETE / RUNTIME BLOCKED | Vercel worker อ่าน queued outbox, suppress เมื่อไม่มี token, retry จำกัด 3 ครั้ง และไม่ rollback origin transaction |
| Preference routing | CODE COMPLETE / RUNTIME BLOCKED | Supabase notification preference/outbox schema และ trigger foundation มีแล้ว |
| Manual shipping | CODE COMPLETE | Tracking URL/provider/number ใช้ protected order shipment flow เดิม |
| SHIPPOP | BLOCKED | Backend source intentionally rejects provider automation จนกว่าจะมี merchant key และ endpoint contract |

## Real-device evidence still required

1. iOS: grant/deny/re-enable permission, token persistence after relaunch, foreground/background/cold-start routing.
2. Android: Android 13+ permission, channel settings, token registration, foreground/background/cold-start routing.
3. Delivery: worker receives valid Vercel Cron authorization, sends Expo ticket, records sent/failed/suppressed state and safely retries.
4. Deep links: notification for order, claim, Work Inbox and after-sales opens only the expected entity belonging to the signed-in user.
5. Shipping: manual tracking renders URL and state timeline; SHIPPOP is not marked live until merchant sandbox evidence exists.
