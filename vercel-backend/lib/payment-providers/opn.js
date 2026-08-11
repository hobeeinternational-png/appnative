import { ApiError } from "../http.js";
import { mapProviderStatus, PaymentMethod, toSubunits } from "./provider.js";

const OPN_CHARGES_URL = "https://api.omise.co/charges";

function basicAuthorization(secretKey) {
  return `Basic ${Buffer.from(`${secretKey}:`, "utf8").toString("base64")}`;
}

async function readProviderResponse(response) {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(502, "opn_charge_failed", body?.message ?? "Opn Payments ไม่สามารถสร้างรายการชำระเงินได้");
  }
  if (!body?.id || !body?.status) throw new ApiError(502, "opn_invalid_response", "Opn Payments ตอบกลับข้อมูลรายการชำระเงินไม่ครบถ้วน");
  return body;
}

/**
 * Uses only a Vercel server-side secret key. Card data is never accepted: the
 * client must tokenize it with the provider public-key SDK and send a one-time token.
 */
export function createOpnPaymentProvider({ secretKey, fetchImpl = fetch }) {
  if (!secretKey) throw new ApiError(500, "opn_not_configured", "ยังไม่ได้ตั้งค่า OPN_SECRET_KEY บน Vercel");

  return {
    name: "opn",
    async createIntent(input) {
      const amount = toSubunits(input.amount, input.currency);
      const form = new URLSearchParams({
        amount: String(amount),
        currency: input.currency.toLowerCase(),
        description: `HOBEE Order ${input.orderNumber ?? input.orderId}`,
        "metadata[hobee_payment_id]": input.paymentId,
        "metadata[hobee_order_id]": input.orderId,
      });

      if (input.method === PaymentMethod.OPN_PROMPTPAY) {
        form.set("source[type]", "promptpay");
      } else if (input.method === PaymentMethod.OPN_CARD) {
        if (!input.cardToken?.startsWith("tokn_")) {
          throw new ApiError(400, "card_token_required", "ต้องส่ง Opn card token ที่สร้างจาก client SDK เท่านั้น");
        }
        form.set("card", input.cardToken);
        if (input.returnUrl) form.set("return_uri", input.returnUrl);
      } else {
        throw new ApiError(400, "unsupported_payment_method", "Opn adapter ไม่รองรับช่องทางนี้");
      }

      const response = await fetchImpl(OPN_CHARGES_URL, {
        method: "POST",
        headers: {
          Authorization: basicAuthorization(secretKey),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      });
      const charge = await readProviderResponse(response);
      const status = mapProviderStatus(charge.status);

      if (input.method === PaymentMethod.OPN_PROMPTPAY) {
        const qrImageUrl = charge.source?.scannable_code?.image?.download_uri;
        if (!qrImageUrl) throw new ApiError(502, "opn_qr_missing", "Opn Payments ไม่ส่ง PromptPay QR กลับมา");
        return {
          provider: "opn",
          providerReference: charge.id,
          status,
          action: {
            type: "promptpay_qr",
            qrImageUrl,
            expiresAt: charge.expires_at ?? null,
            testMode: charge.livemode === false,
          },
        };
      }

      return {
        provider: "opn",
        providerReference: charge.id,
        status,
        action: charge.authorize_uri
          ? { type: "redirect", url: charge.authorize_uri, testMode: charge.livemode === false }
          : { type: "await_confirmation", testMode: charge.livemode === false },
      };
    },
    async retrieveCharge(providerReference) {
      const response = await fetchImpl(`${OPN_CHARGES_URL}/${encodeURIComponent(providerReference)}`, {
        headers: { Authorization: basicAuthorization(secretKey) },
      });
      const charge = await readProviderResponse(response);
      return { providerReference: charge.id, status: mapProviderStatus(charge.status), metadata: charge.metadata ?? {} };
    },
  };
}

