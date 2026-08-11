import { createServiceSupabaseClient, requireAuthenticatedUser } from "../../lib/auth.js";
import { requireAdminUser } from "../../lib/admin-auth.js";
import { getServerConfig } from "../../lib/env.js";
import { ApiError, parseJson, requireMethod, sendApiError, sendJson } from "../../lib/http.js";
import { z } from "zod";
import { sendOrderPushNotifications } from "../../lib/notifications.js";

const createShipmentSchema = z.object({ orderId: z.string().uuid(), provider: z.enum(["manual", "shippop"]), trackingNumber: z.string().trim().min(4).max(120), trackingUrl: z.string().url().max(500).optional() }).strict();

export default async function handler(request, response) {
  try {
    requireMethod(request, response, "POST");
    const config = getServerConfig(); const { user } = await requireAuthenticatedUser(request, config); const service = createServiceSupabaseClient(config);
    await requireAdminUser(service, user.id);
    const body = typeof request.body === "object" && request.body ? request.body : parseJson(typeof request.body === "string" ? request.body : "");
    const parsed = createShipmentSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(400, "validation_error", "ข้อมูลการจัดส่งไม่ถูกต้อง", parsed.error.issues);
    if (parsed.data.provider === "shippop") throw new ApiError(409, "shipping_provider_pending", "SHIPPOP จะเปิดใช้หลังตั้งค่า merchant credentials บน Vercel");
    const { data: order, error: orderError } = await service.from("orders").select("id,buyer_id,order_number,status").eq("id", parsed.data.orderId).single();
    if (orderError || !order) throw new ApiError(404, "order_not_found", "ไม่พบคำสั่งซื้อ");
    const { data: shipment, error: shipmentError } = await service.from("shipments").insert({ order_id: order.id, provider: parsed.data.provider, tracking_number: parsed.data.trackingNumber, tracking_url: parsed.data.trackingUrl ?? null, status: "in_transit", shipped_at: new Date().toISOString() }).select("id,provider,tracking_number,tracking_url,status,shipped_at").single();
    if (shipmentError || !shipment) throw new ApiError(500, "shipment_create_failed", "ไม่สามารถบันทึกการจัดส่งได้");
    const { error: updateError } = await service.from("orders").update({ status: "shipped" }).eq("id", order.id);
    if (updateError) throw new ApiError(500, "order_update_failed", "ไม่สามารถอัปเดตสถานะคำสั่งซื้อได้");
    void sendOrderPushNotifications(service, order.buyer_id, { title: "สินค้าของคุณถูกจัดส่งแล้ว", body: `คำสั่งซื้อ ${order.order_number} กำลังอยู่ระหว่างการจัดส่ง`, orderId: order.id });
    return sendJson(response, 201, { shipment });
  } catch (error) { return sendApiError(response, error); }
}
