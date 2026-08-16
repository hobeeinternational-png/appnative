export type WorkspaceRole =
  | "organization"
  | "seller"
  | "hotel"
  | "tour"
  | "creator"
  | "affiliate"
  | "teacher"
  | "guide"
  | "service"
  | "employee";

export type WorkspaceScreenMode =
  | "dashboard"
  | "list"
  | "detail"
  | "form"
  | "calendar"
  | "analytics"
  | "settings"
  | "directory";

export interface WorkspaceScreenContract {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  mode: WorkspaceScreenMode;
  primaryAction?: string;
  emptyTitle: string;
  emptyDescription: string;
  integrationNote?: string;
}

export interface WorkspaceRoleContract {
  id: WorkspaceRole;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  color: "gold" | "green" | "blue" | "peach" | "violet";
  screens: WorkspaceScreenContract[];
}

const screen = (
  id: string,
  title: string,
  icon: string,
  mode: WorkspaceScreenMode,
  subtitle: string,
  primaryAction?: string,
): WorkspaceScreenContract => ({
  id,
  title,
  subtitle,
  icon,
  mode,
  primaryAction,
  emptyTitle: `ยังไม่มี${title}`,
  emptyDescription: "เมื่อเชื่อมข้อมูลของคุณ หน้าจอนี้จะแสดงรายการและการทำงานที่เกี่ยวข้องอย่างปลอดภัย",
  integrationNote: "Presentation contract พร้อมเชื่อม Supabase/API ใน Phase ถัดไป",
});

export const WORKSPACE_ROLES: WorkspaceRoleContract[] = [
  {
    id: "organization",
    title: "องค์กรและทีมงาน",
    shortTitle: "องค์กร",
    description: "จัดการกิจการ สถานะเจ้าของ ทีม สิทธิ์ และกิจกรรมขององค์กร",
    icon: "domain",
    color: "green",
    screens: [
      screen("overview", "ภาพรวมองค์กร", "domain", "dashboard", "สถานะกิจการ ทีม และงานสำคัญในวันนี้"),
      screen("switcher", "สลับองค์กร", "swap-horiz", "directory", "เลือกบริบทองค์กรที่กำลังจัดการ"),
      screen("team", "สมาชิกทีม", "groups", "directory", "รายชื่อบทบาท สถานะ และความรับผิดชอบ", "เชิญสมาชิก"),
      screen("invite", "เชิญพนักงาน", "person-add", "form", "ส่งคำเชิญและกำหนดบทบาทเริ่มต้น", "ส่งคำเชิญ"),
      screen("invitations", "คำเชิญที่รอดำเนินการ", "mark-email-unread", "list", "ติดตามคำเชิญและดำเนินการต่อ"),
      screen("member-detail", "รายละเอียดสมาชิก", "badge", "detail", "บทบาท สิทธิ์ สถานะ และประวัติกิจกรรม"),
      screen("roles", "บทบาทและสิทธิ์", "admin-panel-settings", "directory", "กำหนดขอบเขต Orders, Products, Claims, Earnings และ Settings"),
      screen("activity", "กิจกรรมทีม", "history", "list", "ติดตามการเปลี่ยนแปลงสำคัญของทีม"),
      screen("settings", "ตั้งค่าองค์กร", "settings", "settings", "ข้อมูลกิจการ สถานะ Owner/Manager และค่าตั้งต้น"),
    ],
  },
  {
    id: "seller",
    title: "ผู้ขาย",
    shortTitle: "ผู้ขาย",
    description: "จัดการร้านค้า สินค้า คำสั่งซื้อ ลูกค้า และการขายประจำวันบนมือถือ",
    icon: "storefront",
    color: "gold",
    screens: [
      screen("dashboard", "Seller Dashboard", "storefront", "dashboard", "ยอดงานประจำวัน รายการต้องทำ และทางลัดร้านค้า"),
      screen("orders", "คำสั่งซื้อ", "receipt-long", "list", "คิวคำสั่งซื้อและสถานะการจัดส่ง"),
      screen("order-detail", "รายละเอียดคำสั่งซื้อ", "description", "detail", "สินค้า ลูกค้า การจัดส่ง และการดำเนินการ"),
      screen("products", "สินค้า", "inventory-2", "list", "แค็ตตาล็อกร้านและสถานะเผยแพร่", "เพิ่มสินค้า"),
      screen("product-form", "เพิ่มหรือแก้ไขสินค้า", "edit-note", "form", "ข้อมูลสินค้า ราคา รูปภาพ และรายละเอียด", "บันทึกร่าง"),
      screen("inventory", "คลังสินค้า", "warehouse", "list", "ดูจำนวนคงเหลือและรายการต้องตรวจ"),
      screen("stock-adjustment", "ปรับสต็อก", "tune", "form", "บันทึกการปรับสต็อกพร้อมเหตุผล", "บันทึกการปรับ"),
      screen("customers", "ลูกค้า", "people", "directory", "รายชื่อลูกค้าและประวัติการซื้อ"),
      screen("customer-detail", "รายละเอียดลูกค้า", "person", "detail", "ข้อมูลการติดต่อและประวัติรายการ"),
      screen("promotions", "โปรโมชัน", "campaign", "list", "จัดการข้อเสนอและแคมเปญ", "สร้างโปรโมชัน"),
      screen("coupons", "คูปอง", "confirmation-number", "list", "สร้างและติดตามคูปองร้านค้า", "สร้างคูปอง"),
      screen("claims", "เคสหลังการขาย", "support-agent", "list", "คิวเคลม คืนสินค้า คืนเงิน และสินค้าทดแทน"),
      screen("earnings", "รายได้ร้านค้า", "account-balance-wallet", "analytics", "สรุปรายได้และข้อมูลพร้อมเชื่อม ledger"),
      screen("team", "ทีมร้านค้า", "groups", "directory", "สมาชิกและสิทธิ์ของร้าน"),
      screen("store-profile", "โปรไฟล์ร้านค้า", "store", "detail", "ภาพลักษณ์ ข้อมูลติดต่อ และช่องทางขาย"),
      screen("settings", "ตั้งค่าร้านค้า", "settings", "settings", "นโยบายการขาย การจัดส่ง และการแจ้งเตือน"),
      screen("notifications", "การแจ้งเตือนร้านค้า", "notifications", "list", "คำสั่งซื้อ เคส และรายการต้องดำเนินการ"),
    ],
  },
  {
    id: "hotel",
    title: "โรงแรมและที่พัก",
    shortTitle: "โรงแรม",
    description: "บริหารการจอง ห้องพัก ราคา แขก และงานบริการหน้าที่พัก",
    icon: "hotel",
    color: "blue",
    screens: [
      screen("dashboard", "Hotel Dashboard", "hotel", "dashboard", "ภาพรวมการเข้าพักและงานวันนี้"),
      screen("booking-inbox", "Booking Inbox", "inbox", "list", "คำขอจองใหม่และรายการต้องตอบกลับ"),
      screen("bookings", "รายการจอง", "event-note", "list", "รายการจองตามสถานะและช่วงเวลา"),
      screen("booking-detail", "รายละเอียดการจอง", "article", "detail", "ข้อมูลแขก ห้องพัก และคำขอพิเศษ"),
      screen("calendar", "ปฏิทินห้องพัก", "calendar-month", "calendar", "ภาพรวมการเข้าพักและห้องว่าง"),
      screen("rooms", "ห้องพัก", "bed", "list", "ประเภทห้องและสถานะการขาย", "เพิ่มห้องพัก"),
      screen("room-detail", "รายละเอียดห้องพัก", "meeting-room", "detail", "รูปภาพ สิ่งอำนวยความสะดวก และเงื่อนไข"),
      screen("room-form", "เพิ่มหรือแก้ไขห้องพัก", "edit", "form", "จัดการข้อมูลห้องพักและราคา", "บันทึกร่าง"),
      screen("availability", "ห้องว่าง", "event-available", "calendar", "จัดการวันขายและห้องที่เปิดรับจอง"),
      screen("pricing", "ราคา", "sell", "form", "กำหนดราคาและข้อเสนอรายช่วงเวลา", "บันทึกแผนราคา"),
      screen("check-in", "เช็กอิน", "login", "form", "ยืนยันการเข้าพักและข้อมูลผู้เข้าพัก", "ยืนยันเช็กอิน"),
      screen("check-out", "เช็กเอาต์", "logout", "form", "สรุปการเข้าพักและสถานะห้อง", "ยืนยันเช็กเอาต์"),
      screen("guests", "ผู้เข้าพัก", "groups", "directory", "รายชื่อแขกและประวัติการเข้าพัก"),
      screen("reviews", "รีวิว", "rate-review", "list", "คำติชมและรายการที่ต้องตอบกลับ"),
      screen("earnings", "รายได้ที่พัก", "account-balance-wallet", "analytics", "ข้อมูลพร้อมเชื่อม booking ledger"),
      screen("staff", "ทีมโรงแรม", "badge", "directory", "เวรทีมและสิทธิ์การใช้งาน"),
      screen("profile", "โปรไฟล์ที่พัก", "business", "detail", "ข้อมูลสาธารณะของที่พัก"),
      screen("settings", "ตั้งค่าโรงแรม", "settings", "settings", "นโยบายและค่าตั้งต้น"),
    ],
  },
  {
    id: "tour",
    title: "บริษัททัวร์",
    shortTitle: "ทัวร์",
    description: "จัดการแพ็กเกจ รอบเดินทาง ผู้โดยสาร จุดนัดพบ และงานนำเที่ยว",
    icon: "luggage",
    color: "green",
    screens: [
      screen("dashboard", "Tour Dashboard", "luggage", "dashboard", "ภาพรวมรอบเดินทางและงานสำคัญ"),
      screen("packages", "แพ็กเกจทัวร์", "map", "list", "รายการแพ็กเกจและสถานะเผยแพร่", "สร้างแพ็กเกจ"),
      screen("package-detail", "รายละเอียดแพ็กเกจ", "description", "detail", "กำหนดการ ราคา และข้อมูลประกอบ"),
      screen("package-form", "สร้างหรือแก้ไขแพ็กเกจ", "edit-note", "form", "จัดการข้อมูลทัวร์และ itinerary", "บันทึกร่าง"),
      screen("departures", "รอบเดินทาง", "event", "calendar", "ตารางออกเดินทางและจำนวนที่นั่ง"),
      screen("bookings", "รายการจอง", "event-note", "list", "จองตามแพ็กเกจและรอบเดินทาง"),
      screen("booking-detail", "รายละเอียดการจอง", "article", "detail", "ผู้โดยสาร การชำระเงิน และคำขอพิเศษ"),
      screen("passengers", "ผู้โดยสาร", "groups", "directory", "รายชื่อผู้ร่วมเดินทาง"),
      screen("check-in", "เช็กอินผู้โดยสาร", "how-to-reg", "form", "ยืนยันการมาถึงก่อนออกเดินทาง", "ยืนยันเช็กอิน"),
      screen("meeting-point", "จุดนัดพบ", "place", "detail", "รายละเอียดเวลา สถานที่ และคำแนะนำ"),
      screen("trip-status", "สถานะทริป", "route", "detail", "ติดตามความคืบหน้าของรอบเดินทาง"),
      screen("customers", "ลูกค้า", "people", "directory", "ประวัติการจองและข้อมูลผู้โดยสาร"),
      screen("reviews", "รีวิว", "rate-review", "list", "คำติชมของผู้เดินทาง"),
      screen("earnings", "รายได้ทัวร์", "account-balance-wallet", "analytics", "ข้อมูลพร้อมเชื่อม ledger"),
      screen("staff", "ทีมทัวร์", "badge", "directory", "บทบาทของทีมปฏิบัติการ"),
      screen("profile", "โปรไฟล์บริษัท", "business", "detail", "ข้อมูลสาธารณะและช่องทางติดต่อ"),
      screen("settings", "ตั้งค่าบริษัท", "settings", "settings", "นโยบายและการแจ้งเตือน"),
    ],
  },
  {
    id: "creator",
    title: "ครีเอเตอร์",
    shortTitle: "ครีเอเตอร์",
    description: "รับงานคอนเทนต์ จัดการ brief ส่งงาน แก้ไข Portfolio และติดตามผลงาน",
    icon: "auto-awesome",
    color: "peach",
    screens: [
      screen("dashboard", "Creator Dashboard", "auto-awesome", "dashboard", "งานใหม่ เดดไลน์ และสถานะผลงาน"),
      screen("jobs", "งานของฉัน", "work-outline", "list", "งานที่กำลังดำเนินการและงานเสร็จแล้ว"),
      screen("job-offers", "ข้อเสนองาน", "mark-email-unread", "list", "ข้อเสนอที่รอรับหรือปฏิเสธ"),
      screen("job-detail", "รายละเอียดงาน", "description", "detail", "ขอบเขตงาน กำหนดส่ง และผลตอบแทนแบบ contract"),
      screen("brief", "รายละเอียดบรีฟ", "assignment", "detail", "แนวทางแบรนด์และไฟล์ประกอบ"),
      screen("work-progress", "งานระหว่างทำ", "pending-actions", "list", "ติดตามขั้นตอนการสร้างผลงาน"),
      screen("upload", "อัปโหลดผลงาน", "upload-file", "form", "เพิ่มไฟล์และรายละเอียดก่อนส่ง", "เลือกไฟล์"),
      screen("submit", "ส่งงาน", "send", "form", "ยืนยันเวอร์ชันที่ส่งให้ผู้ว่าจ้าง", "ส่งงาน"),
      screen("revisions", "แก้ไขงาน", "restart-alt", "list", "รายการแก้ไขและความคิดเห็น"),
      screen("approved", "ผลงานที่อนุมัติ", "verified", "list", "งานที่ได้รับอนุมัติแล้ว"),
      screen("portfolio", "Portfolio", "collections", "list", "จัดแสดงผลงานและรายละเอียด", "เพิ่มผลงาน"),
      screen("analytics", "Analytics", "insights", "analytics", "สรุปผลงานและ engagement แบบ presentation"),
      screen("earnings", "รายได้ครีเอเตอร์", "account-balance-wallet", "analytics", "ข้อมูลพร้อมเชื่อม ledger"),
      screen("profile", "โปรไฟล์สาธารณะ", "person", "detail", "ภาพลักษณ์ ความเชี่ยวชาญ และช่องทางติดต่อ"),
      screen("settings", "ตั้งค่าครีเอเตอร์", "settings", "settings", "การแจ้งเตือนและความเป็นส่วนตัว"),
    ],
  },
  {
    id: "affiliate",
    title: "Affiliate และ Reseller",
    shortTitle: "Affiliate",
    description: "เลือกสินค้า สร้างลิงก์หรือโค้ด แชร์แคมเปญ และติดตาม performance",
    icon: "share",
    color: "violet",
    screens: [
      screen("dashboard", "Affiliate Dashboard", "share", "dashboard", "ภาพรวมแคมเปญ งานแชร์ และ commission contract"),
      screen("products", "สินค้าที่โปรโมตได้", "inventory-2", "list", "สินค้าและเงื่อนไขการโปรโมต"),
      screen("product-detail", "รายละเอียดสินค้าเพื่อโปรโมต", "description", "detail", "ข้อความและสื่อสำหรับการแชร์"),
      screen("generate-link", "สร้างลิงก์", "link", "form", "สร้างลิงก์ติดตามผลแบบ presentation", "สร้างลิงก์"),
      screen("generate-code", "สร้างโค้ด", "qr-code", "form", "สร้างโค้ดหรือรหัสโปรโมต", "สร้างโค้ด"),
      screen("share-center", "ศูนย์การแชร์", "ios-share", "directory", "สื่อ แคปชัน และช่องทางการแชร์"),
      screen("clicks", "Clicks", "ads-click", "analytics", "ข้อมูลพร้อมเชื่อม analytics"),
      screen("orders", "คำสั่งซื้อจากแคมเปญ", "receipt-long", "list", "สถานะ conversion และออเดอร์"),
      screen("commission", "Commission", "account-balance-wallet", "analytics", "สถานะ commission แบบ contract"),
      screen("campaigns", "แคมเปญ", "campaign", "list", "แคมเปญที่กำลังดำเนินการ", "สร้างแคมเปญ"),
      screen("performance", "Performance", "insights", "analytics", "ภาพรวม click conversion และการมีส่วนร่วม"),
      screen("profile", "โปรไฟล์ Affiliate", "person", "detail", "ข้อมูลสาธารณะและช่องทางแชร์"),
    ],
  },
  {
    id: "teacher",
    title: "ผู้สอน",
    shortTitle: "ผู้สอน",
    description: "จัดการคอร์ส บทเรียน ผู้เรียน คลาส งานมอบหมาย และความก้าวหน้า",
    icon: "school",
    color: "blue",
    screens: [
      screen("dashboard", "Teacher Dashboard", "school", "dashboard", "คอร์ส งานสอน และสิ่งที่ต้องทำวันนี้"),
      screen("courses", "คอร์ส", "menu-book", "list", "รายการคอร์สและสถานะเผยแพร่", "สร้างคอร์ส"),
      screen("course-detail", "รายละเอียดคอร์ส", "article", "detail", "โครงสร้างคอร์สและข้อมูลผู้เรียน"),
      screen("course-form", "สร้างหรือแก้ไขคอร์ส", "edit-note", "form", "ข้อมูลคอร์ส ภาพปก และคำอธิบาย", "บันทึกร่าง"),
      screen("lessons", "บทเรียน", "auto-stories", "list", "จัดลำดับและเนื้อหาบทเรียน"),
      screen("students", "ผู้เรียน", "groups", "directory", "รายชื่อผู้เรียนและความก้าวหน้า"),
      screen("enrollment", "การลงทะเบียน", "how-to-reg", "list", "คำขอและสถานะการลงทะเบียน"),
      screen("schedule", "ตารางสอน", "calendar-month", "calendar", "คลาสและช่วงเวลาสอน"),
      screen("class-detail", "รายละเอียดคลาส", "event-note", "detail", "ข้อมูลคลาส ผู้เรียน และเอกสาร"),
      screen("attendance", "เช็กชื่อ", "fact-check", "form", "บันทึกการเข้าร่วมของผู้เรียน", "บันทึกการเช็กชื่อ"),
      screen("assignments", "งานมอบหมาย", "assignment", "list", "ติดตามงานและการส่งงาน"),
      screen("progress", "ความก้าวหน้าผู้เรียน", "trending-up", "analytics", "ข้อมูลการเรียนและการมีส่วนร่วม"),
      screen("reviews", "รีวิว", "rate-review", "list", "คำติชมของผู้เรียน"),
      screen("earnings", "รายได้ผู้สอน", "account-balance-wallet", "analytics", "ข้อมูลพร้อมเชื่อม ledger"),
      screen("profile", "โปรไฟล์ผู้สอน", "person", "detail", "ข้อมูลสาธารณะและความเชี่ยวชาญ"),
      screen("settings", "ตั้งค่าผู้สอน", "settings", "settings", "การแจ้งเตือนและการสื่อสาร"),
    ],
  },
  {
    id: "guide",
    title: "ไกด์",
    shortTitle: "ไกด์",
    description: "รับงานนำเที่ยว จัดการจุดนัดพบ ผู้เดินทาง ปฏิทิน และหลักฐานการจบงาน",
    icon: "explore",
    color: "green",
    screens: [
      screen("dashboard", "Guide Dashboard", "explore", "dashboard", "งานใหม่ ทริปวันนี้ และการนัดหมาย"),
      screen("requests", "คำของานใหม่", "inbox", "list", "คำขอที่รับหรือปฏิเสธได้"),
      screen("bookings", "การจอง", "event-note", "list", "การจองและภารกิจที่ได้รับมอบหมาย"),
      screen("booking-detail", "รายละเอียดการจอง", "article", "detail", "ข้อมูลลูกค้า ทริป และข้อกำหนดงาน"),
      screen("calendar", "ปฏิทิน", "calendar-month", "calendar", "ตารางงานและความพร้อม"),
      screen("availability", "ความพร้อม", "event-available", "form", "กำหนดช่วงเวลาที่รับงาน", "บันทึกความพร้อม"),
      screen("customers", "ลูกค้า", "people", "directory", "ผู้เดินทางและข้อมูลติดต่อที่จำเป็น"),
      screen("job-progress", "เริ่มและจบงาน", "play-circle-outline", "detail", "เริ่มงาน ระหว่างทำ และหลักฐานการจบงาน", "เริ่มงาน"),
      screen("evidence", "หลักฐานการทำงาน", "photo-camera", "form", "แนบหลักฐานการส่งมอบงาน", "เพิ่มหลักฐาน"),
      screen("meeting-point", "จุดนัดพบ", "place", "detail", "ตำแหน่งและคำแนะนำการพบกัน"),
      screen("passengers", "ผู้ร่วมทริป", "groups", "directory", "รายชื่อผู้เดินทางในงาน"),
      screen("reviews", "รีวิว", "rate-review", "list", "คำติชมหลังให้บริการ"),
      screen("earnings", "รายได้ไกด์", "account-balance-wallet", "analytics", "ข้อมูลพร้อมเชื่อม ledger"),
      screen("profile", "โปรไฟล์ไกด์", "person", "detail", "ข้อมูลสาธารณะ ความเชี่ยวชาญ และภาษา"),
      screen("settings", "ตั้งค่าไกด์", "settings", "settings", "การแจ้งเตือนและความพร้อม"),
    ],
  },
  {
    id: "service",
    title: "ผู้ให้บริการ",
    shortTitle: "บริการ",
    description: "รับงานบริการ จัดตารางนัดหมาย ลูกค้า ราคา สถานที่ และหลักฐานการส่งมอบ",
    icon: "handyman",
    color: "peach",
    screens: [
      screen("dashboard", "Service Dashboard", "handyman", "dashboard", "คำขอใหม่ นัดหมาย และงานที่กำลังดำเนินการ"),
      screen("requests", "คำของานใหม่", "inbox", "list", "คำขอรับบริการที่รับหรือปฏิเสธได้"),
      screen("bookings", "การนัดหมาย", "event-note", "list", "รายการนัดหมายและสถานะการให้บริการ"),
      screen("booking-detail", "รายละเอียดนัดหมาย", "article", "detail", "ลูกค้า บริการ สถานที่ และข้อกำหนดงาน"),
      screen("calendar", "ปฏิทิน", "calendar-month", "calendar", "ตารางนัดหมายและช่วงว่าง"),
      screen("availability", "ความพร้อม", "event-available", "form", "กำหนดวันและช่วงเวลาที่รับงาน", "บันทึกความพร้อม"),
      screen("customers", "ลูกค้า", "people", "directory", "ข้อมูลลูกค้าและประวัติบริการ"),
      screen("job-progress", "เริ่มและจบงาน", "play-circle-outline", "detail", "เริ่มงาน ระหว่างทำ และยืนยันการส่งมอบ", "เริ่มงาน"),
      screen("evidence", "หลักฐานการให้บริการ", "photo-camera", "form", "แนบหลักฐานก่อนปิดงาน", "เพิ่มหลักฐาน"),
      screen("service-profile", "ประเภทบริการและราคา", "sell", "detail", "ขอบเขตบริการ ราคา และพื้นที่ให้บริการ"),
      screen("location", "พื้นที่ให้บริการ", "place", "form", "กำหนดพื้นที่และรายละเอียดสถานที่", "บันทึกพื้นที่"),
      screen("reviews", "รีวิว", "rate-review", "list", "คำติชมของลูกค้า"),
      screen("earnings", "รายได้บริการ", "account-balance-wallet", "analytics", "ข้อมูลพร้อมเชื่อม ledger"),
      screen("profile", "โปรไฟล์ผู้ให้บริการ", "person", "detail", "ข้อมูลสาธารณะและความเชี่ยวชาญ"),
      screen("settings", "ตั้งค่าบริการ", "settings", "settings", "การแจ้งเตือนและค่าตั้งต้น"),
    ],
  },
  {
    id: "employee",
    title: "พนักงาน HOBEE",
    shortTitle: "พนักงาน",
    description: "พื้นที่ทำงานสำหรับเวลาเข้าออก งาน โครงการ การลา ค่าใช้จ่าย และการพัฒนา",
    icon: "badge",
    color: "violet",
    screens: [
      screen("home", "Employee Home", "badge", "dashboard", "วันนี้ เวร งาน และประกาศสำคัญ"),
      screen("attendance", "เวลาเข้างาน", "schedule", "form", "Clock in, Clock out, QR attendance และพัก", "Clock In"),
      screen("shifts", "กะและตารางงาน", "calendar-month", "calendar", "ตารางเวรและการสลับกะ"),
      screen("tasks", "งาน", "task-alt", "list", "งานวันนี้และงานที่ได้รับมอบหมาย"),
      screen("task-detail", "รายละเอียดงาน", "assignment", "detail", "รายละเอียดงาน สถานะ และหลักฐาน"),
      screen("projects", "โครงการ", "folder-open", "list", "โครงการและความรับผิดชอบ"),
      screen("project-detail", "รายละเอียดโครงการ", "topic", "detail", "กิจกรรมและเอกสารโครงการ"),
      screen("leave", "การลา", "event-busy", "form", "ลาป่วย ลากิจ และคำขอวันลา", "ส่งคำขอลา"),
      screen("overtime", "ทำงานล่วงเวลา", "more-time", "form", "คำขอ OT และสถานะอนุมัติ", "ส่งคำขอ OT"),
      screen("advance", "ขอเงินล่วงหน้า", "request-quote", "form", "คำขอเงินล่วงหน้าแบบ presentation", "ส่งคำขอ"),
      screen("expenses", "ค่าใช้จ่าย", "receipt", "list", "เบิกค่าใช้จ่ายและ reimbursement", "ส่งรายการเบิก"),
      screen("performance", "KPI และ Performance", "insights", "analytics", "เป้าหมาย ผลงาน และการพัฒนา"),
      screen("training", "การอบรม", "school", "list", "คอร์สและกิจกรรมพัฒนาทักษะ"),
      screen("announcements", "ประกาศ", "campaign", "list", "ข่าวสารและประกาศภายใน"),
      screen("documents", "เอกสาร", "folder", "list", "เอกสารสำหรับพนักงาน"),
      screen("approvals", "รายการอนุมัติ", "fact-check", "list", "งานที่รอการอนุมัติ"),
      screen("salary", "สรุปรายได้", "account-balance-wallet", "analytics", "Presentation contract เท่านั้นจนกว่าจะมี payroll data"),
      screen("profile", "โปรไฟล์พนักงาน", "person", "detail", "ข้อมูลส่วนตัวและผู้ติดต่อฉุกเฉิน"),
      screen("settings", "ตั้งค่าพนักงาน", "settings", "settings", "การแจ้งเตือนและความเป็นส่วนตัว"),
    ],
  },
];

export function getWorkspaceRole(role: string | undefined) {
  return WORKSPACE_ROLES.find((entry) => entry.id === role);
}

export function getWorkspaceScreen(role: string | undefined, screenId: string | undefined) {
  return getWorkspaceRole(role)?.screens.find((entry) => entry.id === screenId);
}
