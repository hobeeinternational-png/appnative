import { listFavoriteIds, loadRewards, type UserCoupon } from "./loyalty";
import { listMyOrders, type HobeeOrder } from "./orders";
import { buildMyHobeeTodaySummary, type MyHobeeAnyRoleType, type MyHobeeLegacyRole, type MyHobeeRoleType, type MyHobeeTodaySummary, type MyHobeeWorkItemType } from "./my-hobee-summary";
import { supabase } from "./supabase";

export { buildMyHobeeTodaySummary, getMyHobeeRoleDefinition, MY_HOBEE_ROLE_DEFINITIONS, roleStatusLabel, workItemTypeLabel } from "./my-hobee-summary";
export type { MyHobeeAnyRoleType, MyHobeeLegacyRole, MyHobeeRoleDefinition, MyHobeeRoleType, MyHobeeTodaySummary, MyHobeeWorkItemType } from "./my-hobee-summary";
export type MyHobeeRoleStatus = "pending" | "reviewing" | "approved" | "rejected" | "suspended";

export type MyHobeeRole = {
  id: string;
  role_type: MyHobeeAnyRoleType;
  status: MyHobeeRoleStatus | "approved";
  application_data: Record<string, unknown>;
  approved_at: string | null;
  created_at: string;
  source: "profile" | "system";
};

export type MyHobeeRoleApplication = {
  id: string;
  role_type: MyHobeeRoleType;
  status: "pending" | "reviewing" | "approved" | "rejected" | "withdrawn";
  application_data: Record<string, unknown>;
  submitted_at: string;
  reviewed_at: string | null;
  decision_note: string | null;
};

export type MyHobeeWorkInboxItem = {
  id: string;
  item_type: MyHobeeWorkItemType;
  reference_id: string | null;
  title: string;
  body: string | null;
  urgency_level: "normal" | "urgent";
  due_at: string | null;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type MyHobeeEarningsSummary = {
  paidAmount: number;
  paidOrderCount: number;
  pendingAmount: number;
  pendingOrderCount: number;
  periodStartedAt: string | null;
};

export type MyHobeeSnapshot = {
  roles: MyHobeeRole[];
  applications: MyHobeeRoleApplication[];
  inbox: MyHobeeWorkInboxItem[];
  earnings: MyHobeeEarningsSummary;
  customer: MyHobeeTodaySummary;
  ownedShopCount: number;
  orders: HobeeOrder[];
  rewards: { points: number; coupons: UserCoupon[] };
};

const roleProfileFields = "id,role_type,status,application_data,approved_at,created_at";
const workInboxFields = "id,item_type,reference_id,title,body,urgency_level,due_at,is_read,metadata,created_at";

export async function loadMyRoles(userId: string): Promise<MyHobeeRole[]> {
  const [{ data: profiles, error: profilesError }, { data: systemRoles, error: systemRolesError }] = await Promise.all([
    supabase.from("user_role_profiles").select(roleProfileFields).eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("user_roles").select("role,created_at").eq("user_id", userId),
  ]);
  if (profilesError) throw profilesError;
  if (systemRolesError) throw systemRolesError;

  const roleMap = new Map<MyHobeeAnyRoleType, MyHobeeRole>();
  for (const row of (profiles ?? []) as Array<Omit<MyHobeeRole, "source">>) {
    roleMap.set(row.role_type, { ...row, source: "profile" });
  }
  for (const row of (systemRoles ?? []) as Array<{ role: string; created_at: string }>) {
    if (row.role === "customer" || !["seller", "admin"].includes(row.role)) continue;
    const roleType = row.role as "seller" | "admin";
    if (!roleMap.has(roleType)) {
      roleMap.set(roleType, { id: `system-${roleType}`, role_type: roleType, status: "approved", application_data: {}, approved_at: row.created_at, created_at: row.created_at, source: "system" });
    }
  }
  return [...roleMap.values()].sort((left, right) => right.created_at.localeCompare(left.created_at));
}

export async function loadRoleApplications(userId: string): Promise<MyHobeeRoleApplication[]> {
  const { data, error } = await supabase
    .from("role_applications")
    .select("id,role_type,status,application_data,submitted_at,reviewed_at,decision_note")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MyHobeeRoleApplication[];
}

export async function applyForMyHobeeRole(roleType: MyHobeeRoleType, applicationData: Record<string, unknown> = {}) {
  const { data, error } = await supabase.rpc("apply_for_hobee_role", { p_role_type: roleType, p_application_data: applicationData });
  if (error) throw error;
  return data as string;
}

export async function loadWorkInbox(userId: string): Promise<MyHobeeWorkInboxItem[]> {
  const { data, error } = await supabase
    .from("work_inbox_items")
    .select(workInboxFields)
    .eq("user_id", userId)
    .order("is_read", { ascending: true })
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as MyHobeeWorkInboxItem[];
}

export async function setWorkInboxItemRead(itemId: string, isRead = true) {
  const { error } = await supabase.rpc("mark_my_hobee_inbox_item_read", { p_item_id: itemId, p_is_read: isRead });
  if (error) throw error;
}

function asNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
}

export async function loadEarningsSummary(): Promise<MyHobeeEarningsSummary> {
  const { data, error } = await supabase.rpc("my_hobee_earnings_summary");
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : null;
  return {
    paidAmount: asNumber(row?.paid_amount),
    paidOrderCount: asNumber(row?.paid_order_count),
    pendingAmount: asNumber(row?.pending_amount),
    pendingOrderCount: asNumber(row?.pending_order_count),
    periodStartedAt: typeof row?.period_started_at === "string" ? row.period_started_at : null,
  };
}

export async function loadOwnedShopCount(userId: string) {
  const { count, error } = await supabase.from("shops").select("id", { count: "exact", head: true }).eq("owner_id", userId);
  if (error) throw error;
  return count ?? 0;
}

export async function loadMyHobeeSnapshot(userId: string): Promise<MyHobeeSnapshot> {
  const [roles, applications, inbox, earnings, orders, rewards, favoriteIds, ownedShopCount] = await Promise.all([
    loadMyRoles(userId),
    loadRoleApplications(userId),
    loadWorkInbox(userId),
    loadEarningsSummary(),
    listMyOrders(),
    loadRewards(userId),
    listFavoriteIds(userId),
    loadOwnedShopCount(userId),
  ]);
  return {
    roles,
    applications,
    inbox,
    earnings,
    customer: buildMyHobeeTodaySummary(orders, inbox, rewards, favoriteIds.size),
    ownedShopCount,
    orders,
    rewards,
  };
}
