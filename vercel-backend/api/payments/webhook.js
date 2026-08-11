import { createServiceSupabaseClient } from "../../lib/auth.js";
import { getServerConfig } from "../../lib/env.js";
import { ApiError, parseJson, readRawBody, requireMethod, sendApiError, sendJson } from "../../lib/http.js";
import { paymentWebhookSchema, parseSchema } from "../../lib/schemas.js";
import { verifyWebhookSignature } from "../../lib/webhook.js";
import { sendOrderPushNotifications } from "../../lib/notifications.js";

function orderStatusForPayment(status) {
  if (status === "paid") return "confirmed";
  if (status === "refunded") return "refunded";
  return null;
}

function allowedTransition(current, next) {
  if (current === next) return true;
  const allowed = {
    pending: ["authorized", "paid", "failed"],
    authorized: ["paid", "failed", "refunded"],
    paid: ["refunded"],
    failed: [],
    refunded: [],
  };
  return allowed[current]?.includes(next) ?? false;
}

export const config = { api: { bodyParser: false } };

export default async function handler(request, response) {
  try {
    requireMethod(request, response, "POST");
    const config = getServerConfig();
    const rawBody = await readRawBody(request);
    const signature = request.headers?.["x-hobee-webhook-signature"];
    if (!verifyWebhookSignature(rawBody, signature, config.paymentWebhookSecret)) {
      throw new ApiError(401, "invalid_signature", "Webhook signature ไม่ถูกต้อง");
    }

    const input = parseSchema(paymentWebhookSchema, parseJson(rawBody));
    const service = createServiceSupabaseClient(config);
    const { data: processedEvent, error: processedEventError } = await service
      .from("payment_webhook_events")
      .select("id")
      .eq("event_id", input.eventId)
      .maybeSingle();
    if (processedEventError) throw new ApiError(500, "webhook_lookup_failed", "ไม่สามารถตรวจสอบ webhook event ได้");
    if (processedEvent) return sendJson(response, 200, { received: true, duplicate: true });

    const { data: payment, error: paymentError } = await service
      .from("payments")
      .select("id,order_id,provider,status,amount")
      .eq("provider_reference", input.providerReference)
      .single();
    if (paymentError || !payment) throw new ApiError(400, "payment_not_found", "ไม่พบ payment reference");
    if (input.amount !== undefined && Number(input.amount) !== Number(payment.amount)) {
      throw new ApiError(400, "amount_mismatch", "ยอดเงินจาก webhook ไม่ตรงกับ payment record");
    }
    if (!allowedTransition(payment.status, input.status)) {
      throw new ApiError(409, "invalid_payment_transition", "ไม่อนุญาตให้เปลี่ยน payment status ด้วยลำดับนี้");
    }

    const { error: paymentUpdateError } = await service
      .from("payments")
      .update({ status: input.status, metadata: { lastWebhookEventId: input.eventId } })
      .eq("id", payment.id);
    if (paymentUpdateError) throw new ApiError(500, "payment_update_failed", "ไม่สามารถปรับสถานะ payment ได้");

    const nextOrderStatus = orderStatusForPayment(input.status);
    const orderUpdate = { payment_status: input.status };
    if (nextOrderStatus) orderUpdate.status = nextOrderStatus;
    const { data: order, error: orderUpdateError } = await service
      .from("orders")
      .update(orderUpdate)
      .eq("id", payment.order_id)
      .select("id,buyer_id,order_number")
      .single();
    if (orderUpdateError) throw new ApiError(500, "order_update_failed", "ไม่สามารถปรับสถานะคำสั่งซื้อได้");

    const { error: eventError } = await service.from("payment_webhook_events").insert({
      event_id: input.eventId,
      payment_id: payment.id,
      provider: payment.provider,
      status: input.status,
      raw_payload: input,
    });
    if (eventError) throw new ApiError(500, "event_record_failed", "ไม่สามารถบันทึก webhook event ได้");
    if (input.status === "paid" && order) {
      void sendOrderPushNotifications(service, order.buyer_id, {
        title: "ชำระเงินสำเร็จ",
        body: `คำสั่งซื้อ ${order.order_number} ได้รับการยืนยันแล้ว`,
        orderId: order.id,
      });
    }

    return sendJson(response, 200, { received: true, duplicate: false });
  } catch (error) {
    return sendApiError(response, error);
  }
}
