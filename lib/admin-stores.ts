import { supabase } from "@/lib/supabase";

export type AdminStore = { id: string; name: string; slug: string; description: string | null; logo_url: string | null; status: "pending" | "active" | "suspended"; created_at: string; product_count: number };

export async function getAdminStores(): Promise<AdminStore[]> {
  const [shopsResult, productsResult] = await Promise.all([
    supabase.from("shops").select("id,name,slug,description,logo_url,status,created_at").order("created_at", { ascending: false }).limit(200),
    supabase.from("products").select("id,shop_id").limit(1000),
  ]);
  if (shopsResult.error) throw shopsResult.error;
  if (productsResult.error) throw productsResult.error;
  const counts = new Map<string, number>();
  for (const product of productsResult.data ?? []) counts.set(product.shop_id, (counts.get(product.shop_id) ?? 0) + 1);
  return (shopsResult.data ?? []).map((shop) => ({ ...shop, status: shop.status as AdminStore["status"], product_count: counts.get(shop.id) ?? 0 }));
}

export async function updateAdminStoreStatus(id: string, status: AdminStore["status"]) {
  const { error } = await supabase.from("shops").update({ status }).eq("id", id);
  if (error) throw error;
}
