import { requireAdminUser } from "../../../lib/auth.js";
import { getServerConfig } from "../../../lib/env.js";
import { ApiError, parseJson, sendApiError, sendJson } from "../../../lib/http.js";
import { parseSchema, updateAdminProductSchema } from "../../../lib/schemas.js";

function getBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  return parseJson(typeof request.body === "string" ? request.body : "");
}

export default async function handler(request, response) {
  try {
    if (request.method !== "PUT") throw new ApiError(405, "method_not_allowed", "รองรับเฉพาะ PUT");
    const id = String(request.query?.id ?? "");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      throw new ApiError(400, "invalid_product_id", "รหัสสินค้าไม่ถูกต้อง");
    }
    const config = getServerConfig();
    const { service } = await requireAdminUser(request, config);
    const input = parseSchema(updateAdminProductSchema, getBody(request));
    const { error } = await service.from("products").update({
      price: input.price,
      stock_quantity: input.stockQuantity,
      status: input.status,
      ...(input.description !== undefined ? { description: input.description } : {}),
    }).eq("id", id);
    if (error) throw new ApiError(500, "product_update_failed", "ไม่สามารถอัปเดตสินค้าได้");
    return sendJson(response, 200, { product: { id } });
  } catch (error) {
    return sendApiError(response, error);
  }
}
