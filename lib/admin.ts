import { supabase } from "@/lib/supabase";

export type AdminProduct = { id: string; name: string; price: number; stock_quantity: number; status: "draft" | "published" | "archived"; sku: string | null; shops: { name: string | null } | null };
export type AdminOrder = { id: string; order_number: string; total: number; status: string; payment_status: string; created_at: string; profiles: { display_name: string | null; phone: string | null } | null };

export async function isCurrentUserAdmin(userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function getAdminDashboard() {
  const [productResult, orderResult] = await Promise.all([
    supabase.from("products").select("id,name,price,stock_quantity,status,sku,shops(name)").order("updated_at", { ascending: false }).limit(50),
    supabase.from("orders").select("id,order_number,total,status,payment_status,created_at,profiles(display_name,phone)").order("created_at", { ascending: false }).limit(50),
  ]);
  if (productResult.error) throw productResult.error;
  if (orderResult.error) throw orderResult.error;
  const products = (productResult.data ?? []).map((product) => ({
    ...product,
    shops: Array.isArray(product.shops) ? product.shops[0] ?? null : product.shops,
  })) as unknown as AdminProduct[];
  const orders = (orderResult.data ?? []).map((order) => ({
    ...order,
    profiles: Array.isArray(order.profiles) ? order.profiles[0] ?? null : order.profiles,
  })) as unknown as AdminOrder[];
  return { products, orders };
}

export async function getAdminProduct(id: string) {
  const { data, error } = await supabase.from("products").select("id,name,price,stock_quantity,status,sku,description,origin,category_id").eq("id", id).single();
  if (error || !data) throw error ?? new Error("ไม่พบสินค้า");
  return data as { id: string; name: string; price: number; stock_quantity: number; status: "draft" | "published" | "archived"; sku: string | null; description: string | null; origin: string | null; category_id: string | null };
}

export async function updateAdminProduct(id: string, payload: { price: number; stock_quantity: number; status: "draft" | "published" | "archived"; description?: string | null }) {
  const { error } = await supabase.from("products").update(payload).eq("id", id);
  if (error) throw error;
}

export async function updateAdminOrderStatus(id: string, status: "confirmed" | "processing" | "shipped" | "delivered" | "cancelled") {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}
