import { supabase } from "@/lib/supabase";

export type UserCoupon = { id: string; code: string; name: string; description: string | null; discount_type: "fixed" | "percentage"; discount_value: number; minimum_subtotal: number; ends_at: string | null; used_at: string | null };

export async function listFavoriteIds(userId: string) {
  const { data, error } = await supabase.from("favorites").select("product_id").eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((item) => item.product_id));
}

export async function setFavorite(userId: string, productId: string, favorite: boolean) {
  if (favorite) {
    const { error } = await supabase.from("favorites").upsert({ user_id: userId, product_id: productId }, { onConflict: "user_id,product_id" });
    if (error) throw error;
  } else {
    const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("product_id", productId);
    if (error) throw error;
  }
}

export async function loadRewards(userId: string) {
  const [couponResult, pointsResult] = await Promise.all([
    supabase.from("user_coupons").select("used_at,coupons(id,code,name,description,discount_type,discount_value,minimum_subtotal,ends_at)").eq("user_id", userId).is("used_at", null),
    supabase.from("loyalty_transactions").select("points").eq("user_id", userId),
  ]);
  if (couponResult.error) throw couponResult.error;
  if (pointsResult.error) throw pointsResult.error;
  const coupons = (couponResult.data ?? []).flatMap((entry) => {
    const raw = entry.coupons; const coupon = Array.isArray(raw) ? raw[0] : raw;
    return coupon ? [{ ...coupon, used_at: entry.used_at }] : [];
  }) as UserCoupon[];
  return { coupons, points: (pointsResult.data ?? []).reduce((sum, item) => sum + Number(item.points), 0) };
}

