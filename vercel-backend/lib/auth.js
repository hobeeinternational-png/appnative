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

