import { supabase } from "@/lib/supabase";

export type UserCoupon = { id: string; code: string; name: string; description: string | null; discount_type: "fixed" | "percentage"; discount_value: number; minimum_subtotal: number; ends_at: string | null; used_at: string | null; claimed_at: string | null };
export type LoyaltyTransaction = { id: string; points: number; type: "earn" | "redeem" | "adjust" | "expire"; note: string | null; created_at: string; order_id: string | null };

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
    supabase.from("user_coupons").select("used_at,claimed_at,coupons(id,code,name,description,discount_type,discount_value,minimum_subtotal,ends_at)").eq("user_id", userId).order("claimed_at", { ascending: false }),
    supabase.from("loyalty_transactions").select("id,points,type,note,created_at,order_id").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);
  if (couponResult.error) throw couponResult.error;
  if (pointsResult.error) throw pointsResult.error;
  const coupons = (couponResult.data ?? []).flatMap((entry) => {
    const raw = entry.coupons; const coupon = Array.isArray(raw) ? raw[0] : raw;
    return coupon ? [{ ...coupon, used_at: entry.used_at, claimed_at: entry.claimed_at }] : [];
  }) as UserCoupon[];
  const transactions = (pointsResult.data ?? []) as LoyaltyTransaction[];
  return { coupons, transactions, points: transactions.reduce((sum, item) => sum + Number(item.points), 0) };
}
