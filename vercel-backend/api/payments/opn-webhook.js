import { createServiceSupabaseClient } from "../../lib/auth.js";
import { getServerConfig } from "../../lib/env.js";
import { ApiError, parseJson, readRawBody, requireMethod, sendApiError, sendJson } from "../../lib/http.js";
import { createOpnPaymentProvider } from "../../lib/payment-providers/opn.js";
import { sendOrderPushNotifications } from "../../lib/notifications.js";

function orderStatusForPayment(status) {
  if (status === "paid") return "confirmed";
  if (status === "failed") return "pending";
  return null;
}

export const config = { api: { bodyParser: false } };

export default async function handler(request, response) {
  try {
    requireMethod(request, response, "POST");
    const raw = await readRawBody(request);
    const event = parseJson(raw);
    if (event?.key !== "charge.complete" || !event?.data?.id || !event?.id) {
      return sendJson(response, 200, { received: true, ignored: true });
    }

    const config = getServerConfig();
    if (!config.opnSecretKey) throw new ApiError(500, "opn_not_configured", "ยังไม่ได้ตั้งค่า OPN_SECRET_KEY บน Vercel");
    const service = createServiceSupabaseClient(config);
    const { data: duplicate } = await service.from("payment_webhook_events").select("id").eq("event_id", event.id).maybeSingle();
    if (duplicate) return sendJson(response, 200, { received: true, duplicate: true });

    const { data: payment, error: paymentError } = await service
      .from("payments")
      .select("id,order_id,status,amount")
      .eq("provider", "opn")
      .eq("provider_reference", event.data.id)
      .maybeSingle();
    if (paymentError || !payment) throw new ApiError(404, "payment_not_found", "ไม่พบ Opn payment reference");

    // Do not trust the inbound webhook payload: retrieve the charge using the server secret.
    const opn = createOpnPaymentProvider({ secretKey: config.opnSecretKey });
    const verifiedCharge = await opn.retrieveCharge(event.data.id);
    if (verifiedCharge.providerReference !== event.data.id) throw new ApiError(502, "opn_charge_mismatch", "Opn charge reference ไม่ตรงกัน");

    const { error: paymentUpdateError } = await service
      .from("payments")
      .update({ status: verifiedCharge.status, metadata: { lastOpnEventId: event.id } })
      .eq("id", payment.id);
    if (paymentUpdateError) throw new ApiError(500, "payment_update_failed", "ไม่สามารถอัปเดต Opn payment ได้");

    const nextOrderStatus = orderStatusForPayment(verifiedCharge.status);
    const orderUpdate = { payment_status: verifiedCharge.status };
    if (nextOrderStatus) orderUpdate.status = nextOrderStatus;
    const { data: order, error: orderError } = await service
      .from("orders")
      .update(orderUpdate)
      .eq("id", payment.order_id)
      .select("id,buyer_id,order_number")
      .single();
    if (orderError) throw new ApiError(500, "order_update_failed", "ไม่สามารถอัปเดตคำสั่งซื้อได้");

    const { error: eventError } = await service.from("payment_webhook_events").insert({
      event_id: event.id,
      payment_id: payment.id,
      provider: "opn",
      status: verifiedCharge.status,
      raw_payload: { key: event.key, chargeId: event.data.id },
    });
    if (eventError) throw new ApiError(500, "event_record_failed", "ไม่สามารถบันทึก Opn webhook event ได้");
    if (verifiedCharge.status === "paid" && order) {
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
