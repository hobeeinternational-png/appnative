export type AdminProductValidationInput = { shop_id: string; name: string; slug: string; price: number; stock_quantity: number };

export function slugifyProductName(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9ก-๙]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || `product-${Date.now()}`;
}

export function validateAdminProductInput(input: AdminProductValidationInput) {
  if (!input.shop_id) return "เลือกหน้าร้านสำหรับสินค้านี้";
  if (input.name.trim().length < 2) return "ชื่อสินค้าต้องมีอย่างน้อย 2 ตัวอักษร";
  if (!input.slug.trim()) return "กรุณาระบุ slug สินค้า";
  if (!Number.isFinite(input.price) || input.price < 0) return "ราคาสินค้าต้องเป็น 0 หรือมากกว่า";
  if (!Number.isInteger(input.stock_quantity) || input.stock_quantity < 0) return "สต็อกต้องเป็นจำนวนเต็ม 0 หรือมากกว่า";
  return null;
}
