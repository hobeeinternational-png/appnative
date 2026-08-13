# QA — Admin Travel Management

ตรวจเมื่อ 13 สิงหาคม 2026 หลัง migration `admin_travel_management` และ `admin_travel_trip_modes`

| เส้นทาง | ผลตรวจ | หมายเหตุ |
|---|---|---|
| `/admin/travel` (ไม่มี session) | ผ่าน | แสดงข้อความปฏิเสธการเข้าถึง Admin Portal ตาม role gate และไม่เปิดเผยข้อมูลจัดการ |
| `/travel` | ผ่าน | Travel Hub render ปกติและโหลดรายการ Supabase ที่เผยแพร่: หลีเป๊ะ, เบตง การ์เดน โฮมสเตย์ และพหุวัฒนธรรมปัตตานี |

การตรวจ workspace แบบ authenticated ต้องใช้บัญชี Supabase ที่มี `admin` role ใน web preview ของผู้ดูแล เนื่องจาก browser QA ไม่มี session เดียวกับบัญชีผู้ดูแลของเจ้าของระบบ
