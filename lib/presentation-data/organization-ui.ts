export type OrganizationTab = "overview" | "team" | "permissions" | "activity" | "settings";

export const ORGANIZATION_TABS: Array<{ id: OrganizationTab; label: string }> = [
  { id: "overview", label: "ภาพรวม" },
  { id: "team", label: "ทีม" },
  { id: "permissions", label: "สิทธิ์" },
  { id: "activity", label: "กิจกรรม" },
  { id: "settings", label: "ตั้งค่า" },
];

export const ORGANIZATION_PERMISSION_GROUPS = [
  { title: "การขาย", permissions: ["Orders", "Products", "Inventory", "Promotions"] },
  { title: "การบริการ", permissions: ["Booking", "Customers", "Claims", "Reviews"] },
  { title: "การบริหาร", permissions: ["Earnings", "Staff", "Settings", "Audit activity"] },
];

export const ORGANIZATION_PRESENTATION_MEMBERS = [
  { id: "owner", name: "Owner account", role: "Owner", status: "Active", icon: "verified-user" },
  { id: "manager", name: "Manager account", role: "Manager", status: "Active", icon: "manage-accounts" },
  { id: "staff", name: "Staff account", role: "Staff", status: "Pending setup", icon: "badge" },
];

export const ORGANIZATION_ACTIVITY = [
  { id: "role", title: "การตั้งค่าบทบาทพร้อมใช้งาน", description: "กำหนด Owner, Manager, Staff, Fulfilment, Customer Service และ Finance ได้จากศูนย์กลาง", icon: "admin-panel-settings" },
  { id: "invite", title: "คำเชิญทีมจะอยู่ในคิวเดียว", description: "เมื่อเชื่อม backend ระบบจะติดตามการส่ง ยอมรับ และหมดอายุของคำเชิญ", icon: "mark-email-unread" },
  { id: "audit", title: "กิจกรรมสำคัญจะถูกบันทึก", description: "การแก้สิทธิ์ การระงับสมาชิก และการเปลี่ยนสถานะจะมี audit trail", icon: "history" },
];
