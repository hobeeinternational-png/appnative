import { randomUUID } from "node:crypto";

import { requireAuthenticatedUser, createServiceSupabaseClient } from "../../lib/auth.js";
import { getServerConfig } from "../../lib/env.js";
import { ApiError, parseJson, requireMethod, sendApiError, sendJson } from "../../lib/http.js";
import { createPaymentIntentSchema, parseSchema } from "../../lib/schemas.js";
import { getPaymentProvider } from "../../lib/payment-providers/index.js";

function getBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  return parseJson(typeof request.body === "string" ? request.body : "");
}

export default async function handler(request, response) {
  try {
    requireMethod(request, response, "POST");
    const config = getServerConfig();
    const { user } = await requireAuthenticatedUser(request, config);
    const input = parseSchema(createPaymentIntentSchema, getBody(request));
    const service = createServiceSupabaseClient(config);

    const { data: order, error: orderError } = await service
      .from("orders")
      .select("id,order_number,total,currency,status,payment_status")
      .eq("id", input.orderId)
      .eq("buyer_id", user.id)
      .single();
    if (orderError || !order) throw new ApiError(404, "order_not_found", "ไม่พบคำสั่งซื้อของคุณ");
    if (order.status !== "pending" || order.payment_status !== "pending") {
      throw new ApiError(409, "order_not_payable", "คำสั่งซื้อนี้ไม่อยู่ในสถานะที่ชำระเงินได้");
    }

    const providerReference = `hbpay_${randomUUID()}`;
    const providerName = input.method.startsWith("opn_") ? "opn" : "mock";
    const { data: payment, error: paymentError } = await service
      .from("payments")
      .insert({
        order_id: order.id,
        provider: providerName,
        provider_reference: providerReference,
        amount: order.total,
        currency: order.currency,
        status: "pending",
        metadata: { method: input.method, state: "provider_intent_pending" },
      })
      .select("id,provider,provider_reference,amount,currency,status,created_at")
      .single();
    if (paymentError || !payment) throw new ApiError(500, "payment_intent_failed", "ไม่สามารถเริ่มต้นรายการชำระเงินได้");

    try {
      const adapter = getPaymentProvider(input.method, config);
      const intent = await adapter.createIntent({
        method: input.method,
        paymentId: payment.id,
        orderId: order.id,
        orderNumber: order.order_number,
        amount: order.total,
        currency: order.currency,
        cardToken: input.cardToken,
        returnUrl: config.paymentReturnUrl || undefined,
      });
      const { data: updatedPayment, error: updateError } = await service
        .from("payments")
        .update({
          provider_reference: intent.providerReference,
          status: intent.status,
          metadata: { method: input.method, action: intent.action },
        })
        .eq("id", payment.id)
        .select("id,provider,provider_reference,amount,currency,status,created_at")
        .single();
      if (updateError || !updatedPayment) throw new ApiError(500, "payment_update_failed", "ไม่สามารถบันทึก payment intent ได้");

      if (intent.status === "paid") {
        await service.from("orders").update({ status: "confirmed", payment_status: "paid" }).eq("id", order.id);
      }
      return sendJson(response, 201, { payment: updatedPayment, action: intent.action });
    } catch (providerError) {
      await service.from("payments").update({ status: "failed", metadata: { method: input.method, error: "provider_intent_failed" } }).eq("id", payment.id);
      throw providerError;
    }
  } catch (error) {
    return sendApiError(response, error);
  }
}
