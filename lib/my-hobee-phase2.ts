import type { HobeeOrder } from "./orders";
import { supabase } from "./supabase";

export type MyHobeeApplicationStatus = "pending" | "reviewing" | "needs_changes" | "approved" | "rejected" | "suspended" | "withdrawn";
export type OrganizationType = "store" | "hotel" | "tour_company" | "service_business" | "partner_company" | "hobee";
export type OrganizationMemberRole = "owner" | "manager" | "staff" | "fulfilment" | "reception" | "finance" | "admin";
export type OrganizationPermission = "VIEW_ORDERS" | "MANAGE_ORDERS" | "VIEW_BOOKINGS" | "MANAGE_BOOKINGS" | "VIEW_EARNINGS" | "MANAGE_STAFF" | "MANAGE_PRODUCTS" | "MANAGE_ROOMS" | "APPROVE_ACTIONS";
export type MyHobeeOrderOperation = "ACCEPTED" | "PREPARING" | "READY" | "SHIPPED" | "COMPLETED";
export type BookingType = "hotel" | "tour" | "service";
export type BookingStatus = "requested" | "confirmed" | "in_progress" | "completed" | "cancelled";

export type MyHobeeRoleApplicationAdmin = {
  id: string; user_id: string; role_type: string; status: MyHobeeApplicationStatus; application_data: Record<string, unknown>; reviewer_id: string | null; decision_note: string | null; submitted_at: string; reviewed_at: string | null;
  profiles?: { display_name: string | null; phone: string | null } | null;
};
export type MyHobeeRoleAuditLog = { id: string; application_id: string; actor_id: string | null; previous_status: string | null; next_status: MyHobeeApplicationStatus; decision_note: string | null; metadata: Record<string, unknown>; created_at: string };
export type MyHobeeOrganization = { id: string; owner_id: string | null; organization_type: OrganizationType; name: string; slug: string; description: string | null; status: "active" | "suspended" | "archived"; metadata: Record<string, unknown>; created_at: string };
export type MyHobeeOrganizationMembership = { id: string; organization_id: string; user_id: string; member_role: OrganizationMemberRole; status: "active" | "suspended" | "left"; title: string | null; joined_at: string; organizations: MyHobeeOrganization | null; organization_member_permissions: Array<{ permission: OrganizationPermission }> };
export type MyHobeeNotification = { id: string; notification_type: string; title: string; body: string | null; route: string | null; source_type: string | null; source_id: string | null; is_read: boolean; created_at: string };
export type MyHobeeBooking = { id: string; booking_number: string; customer_id: string; organization_id: string; booking_type: BookingType; listing_id: string | null; room_type_id: string | null; start_at: string; end_at: string | null; quantity: number; guest_count: number; amount: number; currency: string; payment_status: string; status: BookingStatus; notes: string | null; created_at: string };
export type MyHobeeEarning = { id: string; user_id: string; organization_id: string | null; role_type: string; source_type: string; source_id: string; gross_amount: number; platform_fee: number; commission_amount: number; net_amount: number; currency: string; status: "pending" | "available" | "paid" | "cancelled" | "reversed"; earned_at: string; available_at: string | null; paid_at: string | null; metadata: Record<string, unknown> };
export type MyHobeeOperationOrder = HobeeOrder & { organization_id: string; has_ready_event: boolean };

const organizationFields = "id,owner_id,organization_type,name,slug,description,status,metadata,created_at";
const orderFields = "id,order_number,subtotal,shipping_fee,discount_amount,total,currency,status,payment_status,created_at";

function mapNumber<T extends Record<string, unknown>>(row: T, keys: Array<keyof T>): T {
  const next = { ...row };
  for (const key of keys) { const value = row[key]; (next as Record<string, unknown>)[key as string] = typeof value === "number" ? value : Number(value ?? 0); }
  return next;
}

export async function loadAdminRoleApplications(status: "all" | MyHobeeApplicationStatus = "all") {
  let query = supabase.from("role_applications").select("id,user_id,role_type,status,application_data,reviewer_id,decision_note,submitted_at,reviewed_at,profiles(display_name,phone)").order("submitted_at", { ascending: false }).limit(100);
  if (status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as MyHobeeRoleApplicationAdmin[];
}

export async function loadRoleApplicationAudit(applicationId: string) {
  const { data, error } = await supabase.from("role_application_audit_logs").select("id,application_id,actor_id,previous_status,next_status,decision_note,metadata,created_at").eq("application_id", applicationId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MyHobeeRoleAuditLog[];
}

export async function reviewMyHobeeRoleApplication(applicationId: string, nextStatus: Exclude<MyHobeeApplicationStatus, "pending" | "withdrawn">, decisionNote?: string) {
  const { error } = await supabase.rpc("review_my_hobee_role_application", { p_application_id: applicationId, p_next_status: nextStatus, p_decision_note: decisionNote?.trim() || null });
  if (error) throw error;
}

export async function loadMyOrganizations(userId: string) {
  const { data, error } = await supabase.from("organization_memberships").select(`id,organization_id,user_id,member_role,status,title,joined_at,organizations(${organizationFields}),organization_member_permissions(permission)`).eq("user_id", userId).eq("status", "active").order("joined_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as MyHobeeOrganizationMembership[];
}

export async function loadOrganizationOrders() {
  const { data, error } = await supabase.from("orders").select(orderFields).order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return (data ?? []).map((row) => mapNumber(row as Record<string, unknown>, ["subtotal", "shipping_fee", "discount_amount", "total"])) as HobeeOrder[];
}

export async function loadMyHobeeOperationOrders() {
  const { data, error } = await supabase.rpc("list_my_hobee_operation_orders");
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => mapNumber(row, ["subtotal", "shipping_fee", "discount_amount", "total"])) as MyHobeeOperationOrder[];
}

export async function performMyHobeeOrderOperation(orderId: string, action: MyHobeeOrderOperation) {
  const { error } = await supabase.rpc("perform_my_hobee_order_operation", { p_order_id: orderId, p_action: action });
  if (error) throw error;
}

export async function shipMyHobeeOrder(orderId: string, carrier: string, trackingNumber: string, trackingUrl?: string | null) {
  const { error } = await supabase.rpc("ship_my_hobee_order", { p_order_id: orderId, p_provider: carrier.trim(), p_tracking_number: trackingNumber.trim(), p_tracking_url: trackingUrl?.trim() || null });
  if (error) throw error;
}

export async function loadMyBookings() {
  const { data, error } = await supabase.from("bookings").select("id,booking_number,customer_id,organization_id,booking_type,listing_id,room_type_id,start_at,end_at,quantity,guest_count,amount,currency,payment_status,status,notes,created_at").order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return (data ?? []).map((row) => mapNumber(row as Record<string, unknown>, ["quantity", "guest_count", "amount"])) as MyHobeeBooking[];
}

export async function createMyHobeeBooking(input: { organizationId: string; bookingType: BookingType; listingId: string; roomTypeId?: string | null; startAt: string; endAt?: string | null; quantity?: number; guestCount?: number; notes?: string | null }) {
  const { data, error } = await supabase.rpc("create_my_hobee_booking", { p_organization_id: input.organizationId, p_booking_type: input.bookingType, p_listing_id: input.listingId, p_room_type_id: input.roomTypeId ?? null, p_start_at: input.startAt, p_end_at: input.endAt ?? null, p_quantity: input.quantity ?? 1, p_guest_count: input.guestCount ?? 1, p_notes: input.notes ?? null });
  if (error) throw error;
  return data as string;
}

export async function loadMyEarningsLedger() {
  const { data, error } = await supabase.from("earnings_ledger").select("id,user_id,organization_id,role_type,source_type,source_id,gross_amount,platform_fee,commission_amount,net_amount,currency,status,earned_at,available_at,paid_at,metadata").order("earned_at", { ascending: false }).limit(100);
  if (error) throw error;
  return (data ?? []).map((row) => mapNumber(row as Record<string, unknown>, ["gross_amount", "platform_fee", "commission_amount", "net_amount"])) as MyHobeeEarning[];
}

export async function loadMyNotifications(userId: string) {
  const { data, error } = await supabase.from("user_notifications").select("id,notification_type,title,body,route,source_type,source_id,is_read,created_at").eq("user_id", userId).order("is_read", { ascending: true }).order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return (data ?? []) as MyHobeeNotification[];
}

export async function markMyHobeeNotificationRead(notificationId: string, isRead = true) {
  const { error } = await supabase.rpc("mark_my_hobee_notification_read", { p_notification_id: notificationId, p_is_read: isRead });
  if (error) throw error;
}
