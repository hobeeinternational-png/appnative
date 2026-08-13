# Navigation & Visual Polish QA

## Browser smoke test — 13 สิงหาคม 2026

| Check | Result | Evidence |
|---|---|---|
| Home brand identity | Pass | หน้า `/` แสดง symbol `H`, คำว่า HOBEE และ `LOCAL, LIVED WELL` เหนือ search shell |
| Fixed Home shell | Pass | Search, cart, notification, category rail และ hero render โดยไม่มี runtime error |
| Deep route recovery | Pass after restart | `/product/hobee-honey` ตอบ HTTP 200 หลัง Metro restart; browser test ก่อน restart พบ preview unavailable จึงไม่ถือเป็น UI regression |
| Navigation rules | Pass | Unit tests ครอบคลุม root-tab exclusion, product/order/admin fallback และ unknown deep-link fallback |

หมายเหตุ: การตรวจ Android hardware Back จริงต้องทำบน development build หรืออุปกรณ์ Android เนื่องจาก browser preview ไม่มี hardware back event.
