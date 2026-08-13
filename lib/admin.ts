import { supabase } from "@/lib/supabase";
import { slugifyProductName, validateAdminProductInput } from "./admin-product-validation";

export { slugifyProductName, validateAdminProductInput } from "./admin-product-validation";

export type AdminProduct = { id: string; name: string; price: number; stock_quantity: number; status: "draft" | "published" | "archived"; sku: string | null; shops: { name: string | null } | null };
export type AdminOrder = { id: string; order_number: string; total: number; status: string; payment_status: string; created_at: string; profiles: { display_name: string | null; phone: string | null } | null };
export const PRODUCT_IMAGE_BUCKET = "product-images";
export type AdminProductCreateInput = { shop_id: string; category_id?: string | null; name: string; slug: string; description?: string | null; price: number; stock_quantity: number; sku?: string | null; origin?: string | null; status: "draft" | "published" | "archived" };
export type AdminImageCandidate = { uri: string; fileName?: string | null; mimeType?: string | null; fileSize?: number | null; altText?: string | null };
export type AdminProductFormOptions = { shops: { id: string; name: string }[]; categories: { id: string; name: string }[] };

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
  const products = (productResult.data ?? []).map((product) => ({ ...product, shops: Array.isArray(product.shops) ? product.shops[0] ?? null : product.shops })) as unknown as AdminProduct[];
  const orders = (orderResult.data ?? []).map((order) => ({ ...order, profiles: Array.isArray(order.profiles) ? order.profiles[0] ?? null : order.profiles })) as unknown as AdminOrder[];
  return { products, orders };
}

export async function getAdminProductFormOptions(): Promise<AdminProductFormOptions> {
  const [shopsResult, categoriesResult] = await Promise.all([
    supabase.from("shops").select("id,name").eq("status", "active").order("name").limit(100),
    supabase.from("product_categories").select("id,name").eq("is_visible", true).order("sort_order").limit(100),
  ]);
  if (shopsResult.error) throw shopsResult.error;
  if (categoriesResult.error) throw categoriesResult.error;
  return { shops: (shopsResult.data ?? []) as { id: string; name: string }[], categories: (categoriesResult.data ?? []) as { id: string; name: string }[] };
}

export async function createAdminProduct(input: AdminProductCreateInput, images: AdminImageCandidate[] = []) {
  const validation = validateAdminProductInput(input);
  if (validation) throw new Error(validation);
  if (images.length > 5) throw new Error("อัปโหลดรูปสินค้าได้สูงสุด 5 รูป");
  for (const image of images) {
    if (image.fileSize && image.fileSize > 5 * 1024 * 1024) throw new Error("รูปภาพแต่ละรูปต้องมีขนาดไม่เกิน 5 MB");
    if (image.mimeType && !["image/jpeg", "image/png", "image/webp"].includes(image.mimeType)) throw new Error("รองรับเฉพาะ JPG, PNG และ WebP");
  }
  const { data: product, error: productError } = await supabase.from("products").insert({ ...input, category_id: input.category_id || null, description: input.description || null, sku: input.sku || null, origin: input.origin || null }).select("id").single();
  if (productError || !product) throw productError ?? new Error("สร้างสินค้าไม่สำเร็จ");
  const records: { product_id: string; storage_path: string; alt_text: string | null; sort_order: number }[] = [];
  for (const [index, image] of images.entries()) {
    const response = await fetch(image.uri);
    const blob = await response.blob();
    const extension = image.fileName?.split(".").pop()?.toLowerCase() || image.mimeType?.split("/").pop() || "jpg";
    const path = `products/${product.id}/${Date.now()}-${index}.${extension}`;
    const { data: uploaded, error: uploadError } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, blob, { contentType: image.mimeType ?? blob.type ?? "image/jpeg", upsert: false });
    if (uploadError || !uploaded) throw uploadError ?? new Error("อัปโหลดรูปสินค้าไม่สำเร็จ");
    records.push({ product_id: product.id, storage_path: uploaded.path, alt_text: image.altText ?? input.name, sort_order: index });
  }
  if (records.length) {
    const { error: imageError } = await supabase.from("product_images").insert(records);
    if (imageError) throw imageError;
  }
  return product;
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
