# QA — Admin Travel Management

ตรวจเมื่อ 13 สิงหาคม 2026 หลัง migration `admin_travel_management` และ `admin_travel_trip_modes`

| เส้นทาง | ผลตรวจ | หมายเหตุ |
|---|---|---|
| `/admin/travel` (ไม่มี session) | ผ่าน | แสดงข้อความปฏิเสธการเข้าถึง Admin Portal ตาม role gate และไม่เปิดเผยข้อมูลจัดการ |
| `/travel` | ผ่าน | Travel Hub render ปกติและโหลดรายการ Supabase ที่เผยแพร่: หลีเป๊ะ, เบตง การ์เดน โฮมสเตย์ และพหุวัฒนธรรมปัตตานี |

## Control Center Regression — 13 สิงหาคม 2026

| เส้นทาง | ผลตรวจ | หมายเหตุ |
|---|---|---|
| `/admin` (browser QA ไม่มี session) | ผ่าน | หลังแก้ image picker route โหลดได้: state เริ่มต้นแสดง loading แล้วเข้าสู่ role guard พร้อมปุ่มเข้าสู่ระบบ ไม่พบหน้า runtime crash |

การตรวจ visual ของ dashboard ที่ authenticated ต้องใช้ session ผู้ดูแลของเจ้าของระบบ เพราะ browser QA ไม่ได้ใช้ storage/session ร่วมกับ web preview ของผู้ดูแล

การตรวจ `/admin/stores` ผ่าน browser sandbox หลัง restart ถูกตัดกลับเป็น `about:blank` ระหว่างการโหลด preview จึงไม่ใช้ผลนี้ยืนยัน route; TypeScript และ test suite ยังผ่าน และต้องตรวจผ่าน session ผู้ดูแลใน preview ของเจ้าของระบบหลัง Metro เสถียร

การตรวจ workspace แบบ authenticated ต้องใช้บัญชี Supabase ที่มี `admin` role ใน web preview ของผู้ดูแล เนื่องจาก browser QA ไม่มี session เดียวกับบัญชีผู้ดูแลของเจ้าของระบบ
