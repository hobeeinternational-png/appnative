export type MyHobeeRoleType = "creator" | "affiliate" | "seller" | "teacher" | "tour_operator" | "hotel" | "guide" | "service_provider" | "partner" | "employee";
export type MyHobeeLegacyRole = "admin";
export type MyHobeeAnyRoleType = MyHobeeRoleType | MyHobeeLegacyRole;
export type MyHobeeWorkItemType = "ORDER" | "BOOKING" | "CREATOR_JOB" | "TEACHING" | "SERVICE_JOB" | "EMPLOYEE_TASK" | "MESSAGE" | "APPROVAL";

export type MyHobeeRoleDefinition = { roleType: MyHobeeRoleType; label: string; shortLabel: string; description: string; icon: string; color: string };
export type MyHobeeTodaySummary = { activeCustomerOrders: number; unreadWorkItems: number; urgentWorkItems: number; activeCoupons: number; favoriteCount: number };
export type MyHobeeSummaryOrder = { status: string; [key: string]: unknown };
export type MyHobeeSummaryWorkItem = { is_read: boolean; urgency_level: "normal" | "urgent"; [key: string]: unknown };
export type MyHobeeSummaryCoupon = { used_at: string | null; [key: string]: unknown };

export const MY_HOBEE_ROLE_DEFINITIONS: MyHobeeRoleDefinition[] = [
  { roleType: "creator", label: "Creator", shortLabel: "ครีเอเตอร์", description: "สร้างคอนเทนต์และโอกาสร่วมงานกับชุมชน HOBEE", icon: "auto-awesome", color: "#7059B8" },
  { roleType: "affiliate", label: "Affiliate / Reseller", shortLabel: "พาร์ทเนอร์ขาย", description: "แนะนำสินค้าและรับรายได้ตามผลงาน", icon: "share", color: "#D17835" },
  { roleType: "seller", label: "Seller", shortLabel: "ผู้ขาย", description: "เปิดร้าน ดูออเดอร์ และดูแลสินค้าของคุณ", icon: "storefront", color: "#2D7F72" },
  { roleType: "teacher", label: "Teacher", shortLabel: "ผู้สอน", description: "ออกแบบประสบการณ์การเรียนรู้สำหรับชุมชน", icon: "school", color: "#4B79B8" },
  { roleType: "tour_operator", label: "Tour Operator", shortLabel: "ผู้จัดทริป", description: "ดูแลทริป กิจกรรม และนักเดินทาง", icon: "map", color: "#47856A" },
  { roleType: "hotel", label: "Hotel", shortLabel: "ที่พัก", description: "จัดการห้องพักและการจองของที่พัก", icon: "hotel", color: "#8D648D" },
  { roleType: "guide", label: "Guide", shortLabel: "ไกด์", description: "ให้บริการนำเที่ยวและประสบการณ์ท้องถิ่น", icon: "assistant-direction", color: "#2D7398" },
  { roleType: "service_provider", label: "Service Provider", shortLabel: "ผู้ให้บริการ", description: "เสนอและรับงานบริการผ่าน HOBEE", icon: "handyman", color: "#6D7550" },
  { roleType: "partner", label: "Partner", shortLabel: "พาร์ทเนอร์", description: "ร่วมสร้างโอกาสทางธุรกิจและชุมชน", icon: "handshake", color: "#A46939" },
  { roleType: "employee", label: "HOBEE Employee", shortLabel: "ทีม HOBEE", description: "ทำงานภายในองค์กร HOBEE ตามสิทธิ์ที่ได้รับ", icon: "badge", color: "#3E4A65" },
];

export function getMyHobeeRoleDefinition(roleType: MyHobeeAnyRoleType) {
  if (roleType === "admin") return { roleType: "admin" as const, label: "HOBEE Admin", shortLabel: "ผู้ดูแล", description: "จัดการสิทธิ์และการดำเนินงานของแพลตฟอร์ม", icon: "admin-panel-settings", color: "#25211E" };
  return MY_HOBEE_ROLE_DEFINITIONS.find((item) => item.roleType === roleType) ?? null;
}

export function roleStatusLabel(status: string) {
  return ({ pending: "รอพิจารณา", reviewing: "กำลังพิจารณา", approved: "พร้อมใช้งาน", rejected: "ไม่ผ่านการพิจารณา", suspended: "ระงับชั่วคราว", withdrawn: "ถอนคำขอแล้ว" } as Record<string, string>)[status] ?? status;
}

export function workItemTypeLabel(itemType: MyHobeeWorkItemType) {
  return ({ ORDER: "ออเดอร์", BOOKING: "การจอง", CREATOR_JOB: "งานครีเอเตอร์", TEACHING: "งานสอน", SERVICE_JOB: "งานบริการ", EMPLOYEE_TASK: "ภารกิจทีม", MESSAGE: "ข้อความ", APPROVAL: "รออนุมัติ" } as Record<MyHobeeWorkItemType, string>)[itemType];
}

export function buildMyHobeeTodaySummary(orders: MyHobeeSummaryOrder[], inbox: MyHobeeSummaryWorkItem[], rewards: { coupons: MyHobeeSummaryCoupon[] }, favoriteCount: number): MyHobeeTodaySummary {
  return {
    activeCustomerOrders: orders.filter((order) => ["pending", "confirmed", "processing", "shipped"].includes(order.status)).length,
    unreadWorkItems: inbox.filter((item) => !item.is_read).length,
    urgentWorkItems: inbox.filter((item) => item.urgency_level === "urgent" && !item.is_read).length,
    activeCoupons: rewards.coupons.filter((coupon) => !coupon.used_at).length,
    favoriteCount,
  };
}
