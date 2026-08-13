import { createClient } from "@supabase/supabase-js";

import { ApiError, getBearerToken } from "./http.js";

export function createPublicSupabaseClient(config) {
  return createClient(config.supabaseUrl, config.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createServiceSupabaseClient(config) {
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function requireAuthenticatedUser(request, config, client = createPublicSupabaseClient(config)) {
  const token = getBearerToken(request);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new ApiError(401, "unauthorized", "Supabase token ไม่ถูกต้องหรือหมดอายุ");
  return { user: data.user, token };
}

export async function requireAdminUser(request, config) {
  const { user } = await requireAuthenticatedUser(request, config);
  const service = createServiceSupabaseClient(config);
  const { data, error } = await service
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new ApiError(500, "admin_role_check_failed", "ไม่สามารถตรวจสอบสิทธิ์ผู้ดูแลได้");
  if (!data) throw new ApiError(403, "admin_required", "ต้องเป็นผู้ดูแลระบบ HOBEE เท่านั้น");
  return { user, service };
}
