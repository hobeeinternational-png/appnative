# Province Local Discovery — Integration Readiness

Province Local Discovery ใน mobile app ใช้ข้อมูล preview แยกจาก catalogue และ Travel booking เดิม เพื่อให้สามารถตรวจ UX ของ Map, Directory, Day Planner และ Pre-order ได้โดยไม่สร้างคำสั่งซื้อหรือข้อมูลร้านค้าจริงใน client

| Capability | สถานะใน mobile | ขอบเขตก่อนมี backend จริง |
|---|---|---|
| Map pins | พร้อมแบบ preview | แสดง canvas จำลองและเปิด external map URL จากพิกัด; ต้องใช้ Maps SDK/API key เพื่อแสดงแผนที่จริง |
| Navigation | พร้อม | เปิด Google Maps หรือ Apple Maps ผ่าน URL; ไม่เก็บ live location ใน app state |
| Save / share plan | พร้อมแบบ preview | แชร์ deep link preview; การบันทึกถาวรต้องมี `saved_day_plans` และ RLS |
| Pre-order food | พร้อมแบบ preview | คำนวณรายการและแสดง queue preview; ห้ามแจ้งร้านหรือเก็บ payment ก่อนมี server API |
| Restaurant handoff | รอ backend | Server ต้อง validate menu, price, arrival time, opening status และสร้าง queue id แบบ idempotent |
| Open-now filter | preview data | ต้องคำนวณ timezone/holiday จาก server เมื่อใช้ข้อมูลจริง |

## Server contract ที่ต้องมีในระยะถัดไป

`POST /api/local-preorders` ต้องรับเฉพาะ listing id, menu ids, quantities, dining mode และ arrival time จาก client แล้วตรวจ pricing, inventory และ merchant status ฝั่ง server ก่อนสร้าง `local_preorders` และส่ง notification ให้ operator การยืนยันสถานะและ payment ต้องใช้ webhooks/provider flow เดิม ไม่รับยอดรวมหรือสถานะชำระเงินจาก mobile client

## Privacy safeguards

แอปไม่ขอหรือส่งตำแหน่ง GPS จนกว่าผู้ใช้จะเลือกเปิดการนำทาง การเปิด Map ใช้พิกัดสาธารณะของ listing เท่านั้น ผู้ใช้ไม่ควรบันทึกเบอร์โทร หมายเหตุอาหารแพ้ หรือข้อมูลผู้ร่วมเดินทางใน preview layer; ฟิลด์เหล่านี้ต้องมี consent, retention policy และ RLS เมื่อเปิด server flow
