import { ApiError } from "./http.js";

export async function requireAdminUser(service, userId) {
  const { data, error } = await service.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error || !data) throw new ApiError(403, "admin_required", "การดำเนินการนี้สำหรับผู้ดูแลระบบเท่านั้น");
}
