import { requireAdminUser } from "../../../lib/auth.js";
import { getServerConfig } from "../../../lib/env.js";
import { ApiError, parseJson, sendApiError, sendJson } from "../../../lib/http.js";
import { createAdminProductSchema, parseSchema } from "../../../lib/schemas.js";

function getBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  return parseJson(typeof request.body === "string" ? request.body : "");
}

export default async function handler(request, response) {
  try {
    const config = getServerConfig();
    const { service } = await requireAdminUser(request, config);

    if (request.method === "GET") {
      const { data, error } = await service
        .from("products")
        .select("id,name,price,stock_quantity,status,sku,updated_at,shops(name)")
        .order("updated_at", { ascending: false })
        .limit(100);
      if (error) throw new ApiError(500, "products_read_failed", "ไม่สามารถอ่านรายการสินค้าได้");
      return sendJson(response, 200, { items: data ?? [] });
    }

    if (request.method !== "POST") throw new ApiError(405, "method_not_allowed", "รองรับเฉพาะ GET และ POST");
    const input = parseSchema(createAdminProductSchema, getBody(request));
    const { data, error } = await service
      .from("products")
      .insert({
        shop_id: input.shopId,
        category_id: input.categoryId ?? null,
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        price: input.price,
        stock_quantity: input.stockQuantity,
        sku: input.sku ?? null,
        origin: input.origin ?? null,
        status: input.status,
      })
      .select("id")
      .single();
    if (error || !data) {
      const duplicate = error?.code === "23505";
      throw new ApiError(duplicate ? 409 : 500, duplicate ? "product_slug_conflict" : "product_create_failed", duplicate ? "slug สินค้านี้ถูกใช้งานแล้ว" : "ไม่สามารถสร้างสินค้าได้");
    }
    return sendJson(response, 201, { product: data });
  } catch (error) {
    return sendApiError(response, error);
  }
}
