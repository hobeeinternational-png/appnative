import { requireAuthenticatedUser, createServiceSupabaseClient } from "../../lib/auth.js";
import { getServerConfig } from "../../lib/env.js";
import { ApiError, parseJson, requireMethod, sendApiError, sendJson } from "../../lib/http.js";
import { createOrderSchema, parseSchema } from "../../lib/schemas.js";

function getBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  return parseJson(typeof request.body === "string" ? request.body : "");
}

export default async function handler(request, response) {
  try {
    requireMethod(request, response, "POST");
    const config = getServerConfig();
    const { user } = await requireAuthenticatedUser(request, config);
    const input = parseSchema(createOrderSchema, getBody(request));
    const service = createServiceSupabaseClient(config);

    const duplicateProduct = input.items.some((item, index) => input.items.findIndex((candidate) =>
      candidate.productId === item.productId && (candidate.variantId ?? null) === (item.variantId ?? null),
    ) !== index);
    if (duplicateProduct) throw new ApiError(400, "duplicate_item", "สินค้าเดียวกันต้องรวมเป็นหนึ่งรายการ");

    const { data: orderId, error } = await service.rpc("create_order_from_items", {
      p_buyer_id: user.id,
      p_address_id: input.addressId,
      p_items: input.items,
    });
    if (error) {
      const status = /สินค้า|จำนวน|ที่อยู่|stock|published|not found/i.test(error.message) ? 400 : 500;
      throw new ApiError(status, status === 400 ? "order_rejected" : "order_creation_failed", error.message);
    }

    const { data: order, error: orderError } = await service
      .from("orders")
      .select("id,order_number,subtotal,shipping_fee,discount_amount,total,currency,status,payment_status,created_at")
      .eq("id", orderId)
      .eq("buyer_id", user.id)
      .single();
    if (orderError || !order) throw new ApiError(500, "order_read_failed", "สร้างคำสั่งซื้อแล้วแต่ไม่สามารถอ่านข้อมูลกลับได้");

    return sendJson(response, 201, { order });
  } catch (error) {
    return sendApiError(response, error);
  }
}

