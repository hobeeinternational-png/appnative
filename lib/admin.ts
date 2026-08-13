import { supabase } from "@/lib/supabase";
import { hobeeApi } from "@/lib/hobee-api";
import { slugifyProductName, validateAdminProductInput } from "./admin-product-validation";

export { slugifyProductName, validateAdminProductInput } from "./admin-product-validation";

export type AdminProduct = { id: string; name: string; price: number; stock_quantity: number; status: "draft" | "published" | "archived"; sku: string | null; shops: { name: string | null } | null };
export type AdminOrder = { id: string; order_number: string; total: number; status: string; payment_status: string; created_at: string; profiles: { display_name: string | null; phone: string | null } | null };
export const PRODUCT_IMAGE_BUCKET = "product-images";
export type AdminProductCreateInput = { shop_id: string; category_id?: string | null; name: string; slug: string; description?: string | null; price: number; stock_quantity: number; sku?: string | null; origin?: string | null; status: "draft" | "published" | "archived" };
export type AdminImageCandidate = { uri: string; fileName?: string | null; mimeType?: string | null; fileSize?: number | null; altText?: string | null };
export type AdminProductFormOptions = { shops: { id: string; name: string }[]; categories: { id: string; name: string }[] };
export type AdminStoredImage = { id: string; storage_path: string; alt_text: string | null; sort_order: number; url: string };
export type AdminProductUpdateInput = Partial<Pick<AdminProductCreateInput, "shop_id" | "category_id" | "name" | "slug" | "description" | "price" | "stock_quantity" | "sku" | "origin" | "status">>;

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
  validateImages(images, "สินค้า");
  const viaApi = hobeeApi.isConfigured();
  const product = viaApi
    ? (await hobeeApi.createAdminProduct({ shopId: input.shop_id, categoryId: input.category_id || null, name: input.name, slug: input.slug, description: input.description || null, price: input.price, stockQuantity: input.stock_quantity, sku: input.sku || null, origin: input.origin || null, status: input.status })).product
    : await (async () => {
      const { data, error } = await supabase.from("products").insert({ ...input, category_id: input.category_id || null, description: input.description || null, sku: input.sku || null, origin: input.origin || null }).select("id").single();
      if (error || !data) throw error ?? new Error("สร้างสินค้าไม่สำเร็จ");
      return data;
    })();
  await uploadAdminProductImages(product.id, images, input.name);
  return product;
}

export async function getAdminProduct(id: string) {
  const { data, error } = await supabase.from("products").select("id,shop_id,name,slug,price,stock_quantity,status,sku,description,origin,category_id").eq("id", id).single();
  if (error || !data) throw error ?? new Error("ไม่พบสินค้า");
  return data as { id: string; shop_id: string; name: string; slug: string; price: number; stock_quantity: number; status: "draft" | "published" | "archived"; sku: string | null; description: string | null; origin: string | null; category_id: string | null };
}

export async function updateAdminProduct(id: string, payload: AdminProductUpdateInput) {
  const hasOnlyApiFields = Object.keys(payload).every((key) => ["price", "stock_quantity", "status", "description"].includes(key));
  if (hobeeApi.isConfigured() && hasOnlyApiFields && payload.price !== undefined && payload.stock_quantity !== undefined && payload.status !== undefined) {
    await hobeeApi.updateAdminProduct(id, { price: payload.price, stockQuantity: payload.stock_quantity, status: payload.status, ...(payload.description !== undefined ? { description: payload.description } : {}) });
    return;
  }
  const { error } = await supabase.from("products").update(payload).eq("id", id);
  if (error) throw error;
}

export async function getAdminProductImages(productId: string): Promise<AdminStoredImage[]> {
  const { data, error } = await supabase.from("product_images").select("id,storage_path,alt_text,sort_order").eq("product_id", productId).order("sort_order");
  if (error) throw error;
  return (data ?? []).map((image) => ({ ...image, url: supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(image.storage_path).data.publicUrl }));
}

export async function uploadAdminProductImages(productId: string, images: AdminImageCandidate[], defaultAltText: string) {
  if (!images.length) return;
  validateImages(images, "สินค้า");
  const existing = await getAdminProductImages(productId);
  if (existing.length + images.length > 5) throw new Error("สินค้าแต่ละรายการมีรูปภาพได้สูงสุด 5 รูป");
  const records: { product_id: string; storage_path: string; alt_text: string | null; sort_order: number }[] = [];
  for (const [index, image] of images.entries()) {
    const storagePath = await uploadImage(PRODUCT_IMAGE_BUCKET, `products/${productId}`, image, index);
    records.push({ product_id: productId, storage_path: storagePath, alt_text: image.altText ?? defaultAltText, sort_order: existing.length + index });
  }
  const { error } = await supabase.from("product_images").insert(records);
  if (error) throw error;
}

export async function replaceAdminProductImage(image: AdminStoredImage, productId: string, candidate: AdminImageCandidate, altText: string) {
  validateImages([candidate], "สินค้า");
  const storagePath = await uploadImage(PRODUCT_IMAGE_BUCKET, `products/${productId}`, candidate, image.sort_order);
  const { error } = await supabase.from("product_images").update({ storage_path: storagePath, alt_text: candidate.altText ?? altText }).eq("id", image.id);
  if (error) throw error;
  await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([image.storage_path]);
}

export async function deleteAdminProductImage(image: AdminStoredImage) {
  const { error } = await supabase.from("product_images").delete().eq("id", image.id);
  if (error) throw error;
  await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([image.storage_path]);
}

export async function deleteAdminProduct(productId: string) {
  const images = await getAdminProductImages(productId);
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw error;
  if (images.length) await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove(images.map((image) => image.storage_path));
}

function validateImages(images: AdminImageCandidate[], entityLabel: string) {
  if (images.length > 5) throw new Error(`อัปโหลดรูป${entityLabel}ได้สูงสุด 5 รูป`);
  for (const image of images) {
    if (image.fileSize && image.fileSize > 5 * 1024 * 1024) throw new Error("รูปภาพแต่ละรูปต้องมีขนาดไม่เกิน 5 MB");
    if (image.mimeType && !["image/jpeg", "image/png", "image/webp"].includes(image.mimeType)) throw new Error("รองรับเฉพาะ JPG, PNG และ WebP");
  }
}

async function uploadImage(bucket: string, folder: string, image: AdminImageCandidate, index: number) {
  const response = await fetch(image.uri);
  const blob = await response.blob();
  const extension = image.fileName?.split(".").pop()?.toLowerCase() || image.mimeType?.split("/").pop() || "jpg";
  const path = `${folder}/${Date.now()}-${index}.${extension}`;
  const { data, error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: image.mimeType ?? blob.type ?? "image/jpeg", upsert: false });
  if (error || !data) throw error ?? new Error("อัปโหลดรูปภาพไม่สำเร็จ");
  return data.path;
}

export async function updateAdminOrderStatus(id: string, status: "confirmed" | "processing" | "shipped" | "delivered" | "cancelled") {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}
