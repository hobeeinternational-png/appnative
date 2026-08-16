import { requireAdminUser } from "../../../lib/auth.js";
import { getServerConfig } from "../../../lib/env.js";
import { ApiError, parseJson, requireMethod, sendApiError, sendJson } from "../../../lib/http.js";
import { createOpnPaymentProvider } from "../../../lib/payment-providers/opn.js";

function getBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  return parseJson(typeof request.body === "string" ? request.body : "");
}

function parseRefundId(input) {
  if (!input || typeof input.refundId !== "string" || !/^[0-9a-f-]{36}$/i.test(input.refundId)) {
    throw new ApiError(400, "invalid_refund_id", "ต้องระบุ refundId ที่ถูกต้อง");
  }
  return input.refundId;
}

async function markRefundFailed(service, refundId, message) {
  await service.from("after_sales_refunds")
    .update({ status: "failed", metadata: { providerError: message } })
    .eq("id", refundId)
    .eq("status", "processing");
}

export default async function handler(request, response) {
  try {
    requireMethod(request, response, "POST");
    const config = getServerConfig();
    const { service } = await requireAdminUser(request, config);
    const refundId = parseRefundId(getBody(request));

    const { data: refund, error: refundError } = await service.from("after_sales_refunds")
      .select("id,case_id,order_id,status,amount,currency,provider_reference,metadata")
      .eq("id", refundId)
      .single();
    if (refundError || !refund) throw new ApiError(404, "refund_not_found", "ไม่พบคำขอคืนเงิน");
    if (refund.status === "completed") return sendJson(response, 200, { refund, duplicate: true });
    if (refund.status !== "approved") throw new ApiError(409, "refund_not_approved", "คำขอคืนเงินยังไม่ได้รับอนุมัติ");

    const { data: payment, error: paymentError } = await service.from("payments")
      .select("id,provider,provider_reference,status,amount,currency")
      .eq("order_id", refund.order_id)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (paymentError || !payment?.provider_reference) throw new ApiError(409, "paid_provider_payment_not_found", "ไม่พบ payment provider ที่ชำระเงินสำเร็จสำหรับคำสั่งซื้อนี้");
    if (payment.provider !== "opn") throw new ApiError(409, "refund_provider_not_supported", "payment provider นี้ยังไม่รองรับการคืนเงินอัตโนมัติ");

    const { data: processingRefund, error: processingError } = await service.from("after_sales_refunds")
      .update({ status: "processing" })
      .eq("id", refund.id)
      .eq("status", "approved")
      .select("id,case_id,order_id,amount,currency")
      .maybeSingle();
    if (processingError) throw new ApiError(500, "refund_lock_failed", "ไม่สามารถล็อกคำขอคืนเงินได้");
    if (!processingRefund) {
      const { data: current } = await service.from("after_sales_refunds").select("id,status,provider_reference").eq("id", refund.id).single();
      return sendJson(response, 200, { refund: current, duplicate: true });
    }

    try {
      const opn = createOpnPaymentProvider({ secretKey: config.opnSecretKey });
      const providerRefund = await opn.createRefund({
        refundId: processingRefund.id,
        chargeId: payment.provider_reference,
        amount: processingRefund.amount,
        currency: processingRefund.currency,
      });
      const { data: completed, error: completedError } = await service.from("after_sales_refunds")
        .update({
          status: "completed",
          provider_reference: providerRefund.providerReference,
          completed_at: new Date().toISOString(),
          metadata: { provider: "opn", providerStatus: providerRefund.status, testMode: providerRefund.testMode },
        })
        .eq("id", processingRefund.id)
        .eq("status", "processing")
        .select("id,case_id,order_id,status,amount,currency,provider_reference,completed_at")
        .single();
      if (completedError || !completed) throw new ApiError(500, "refund_completion_write_failed", "ไม่สามารถบันทึกผลการคืนเงินได้");

      const { data: caseRow } = await service.from("after_sales_cases").select("id,user_id").eq("id", completed.case_id).single();
      await service.from("after_sales_case_events").insert({
        case_id: completed.case_id,
        event_type: "refund_completed",
        description: "ระบบบันทึกการคืนเงินจาก payment provider แล้ว",
        source_key: `BACKEND_REFUND_COMPLETED:${completed.id}`,
        metadata: { refund_id: completed.id, provider_reference: completed.provider_reference },
      });
      if (caseRow?.user_id) {
        await service.from("user_notifications").upsert({
          user_id: caseRow.user_id,
          notification_type: "REFUND_COMPLETED",
          title: "คืนเงินสำเร็จ",
          body: "ระบบบันทึกผลการคืนเงินของคุณแล้ว",
          route: `/claims/${completed.case_id}`,
          source_type: "AFTER_SALES_REFUND",
          source_id: completed.id,
          source_key: `BACKEND_REFUND_NOTIFICATION:${completed.id}`,
        }, { onConflict: "source_key" });
      }
      return sendJson(response, 200, { refund: completed, duplicate: false });
    } catch (providerError) {
      await markRefundFailed(service, refund.id, providerError instanceof Error ? providerError.message : "provider_refund_failed");
      throw providerError;
    }
  } catch (error) {
    return sendApiError(response, error);
  }
}
