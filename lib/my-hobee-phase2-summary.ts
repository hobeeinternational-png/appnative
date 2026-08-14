import type { MyHobeeOrderOperation, OrganizationPermission } from "./my-hobee-phase2";

export const ORGANIZATION_PERMISSION_LABELS: Record<OrganizationPermission, string> = {
  VIEW_ORDERS: "ดูคำสั่งซื้อ", MANAGE_ORDERS: "จัดการคำสั่งซื้อ", VIEW_BOOKINGS: "ดูรายการจอง", MANAGE_BOOKINGS: "จัดการการจอง", VIEW_EARNINGS: "ดูรายได้", MANAGE_STAFF: "จัดการทีม", MANAGE_PRODUCTS: "จัดการสินค้า", MANAGE_ROOMS: "จัดการห้องพัก", APPROVE_ACTIONS: "อนุมัติรายการ",
};

export const ORDER_OPERATION_DETAILS: Record<MyHobeeOrderOperation, { label: string; success: string; confirm: boolean }> = {
  ACCEPTED: { label: "รับออเดอร์", success: "รับออเดอร์แล้ว", confirm: false }, PREPARING: { label: "เริ่มเตรียม", success: "เริ่มเตรียมออเดอร์แล้ว", confirm: false }, READY: { label: "พร้อมส่ง", success: "ออเดอร์พร้อมส่งแล้ว", confirm: false }, SHIPPED: { label: "จัดส่งแล้ว", success: "อัปเดตว่าได้จัดส่งแล้ว", confirm: true }, COMPLETED: { label: "ส่งสำเร็จ", success: "ปิดงานออเดอร์แล้ว", confirm: true },
};

export function nextOrderOperation(status: string, hasReadyEvent: boolean): MyHobeeOrderOperation | null {
  if (status === "pending") return "ACCEPTED";
  if (status === "confirmed") return "PREPARING";
  if (status === "processing") return hasReadyEvent ? "SHIPPED" : "READY";
  if (status === "shipped") return "COMPLETED";
  return null;
}
