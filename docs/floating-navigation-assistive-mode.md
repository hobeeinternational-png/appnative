# HOBEE Bottom Navigation Assistive Mode

Normal mode แสดง Bottom Navigation เต็มแถบและเก็บ active route เดิมไว้ ส่วน Floating mode ลดแถบเหลือปุ่ม HOBEE เพียงปุ่มเดียวเพื่อเพิ่มพื้นที่อ่านเนื้อหา โดย mode และพิกัดถูกจัดเก็บแบบ local persistence ในอุปกรณ์ ไม่ใช้ account profile หรือ server data

| Interaction | Behavior | Safety boundary |
|---|---|---|
| Single tap | เปิด Quick Menu feedback หลังรอ double-tap window | ไม่สั่งงาน AI หรือใช้ microphone จนกว่าจะเชื่อม Assistant backend |
| Double tap | สลับ Normal/Floating mode | ไม่รีโหลด route และไม่ reset form state |
| Drag in Floating mode | ลากเกิน 8px แล้ว snap ไปขอบใกล้สุด | จำกัดพิกัดให้อยู่ใน top/bottom safe area และเว้นขอบ 16px |
| Collapse/expand | เปลี่ยน layout ด้วย native timing 390ms | รักษา active route และไม่เปลี่ยน navigation stack |

การเปิด HOBEE Assistant จริงต้องเชื่อม Quick Menu หรือ AI Voice backend แยกต่างหาก ปุ่มในรุ่นนี้ให้ feedback และ state transition เท่านั้น
