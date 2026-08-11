import { randomUUID } from "node:crypto";

import { ApiError } from "../http.js";
import { PaymentMethod, toSubunits } from "./provider.js";

/**
 * Deterministic sandbox adapter. It never contacts a processor and is intended
 * only for local/API contract testing. The app must surface the test marker.
 */
export function createMockPaymentProvider() {
  return {
    name: "mock",
    async createIntent(input) {
      const amount = toSubunits(input.amount, input.currency);
      if (![PaymentMethod.MOCK_PROMPTPAY, PaymentMethod.MOCK_CARD].includes(input.method)) {
        throw new ApiError(400, "unsupported_payment_method", "Mock provider ไม่รองรับช่องทางนี้");
      }
      const reference = `mock_${randomUUID()}`;
      if (input.method === PaymentMethod.MOCK_PROMPTPAY) {
        return {
          provider: "mock",
          providerReference: reference,
          status: "pending",
          action: {
            type: "promptpay_qr",
            qrPayload: `0002010102123058HOBEE-SANDBOX|${reference}|${amount}`,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            testMode: true,
          },
        };
      }
      return {
        provider: "mock",
        providerReference: reference,
        status: "pending",
        action: {
          type: "card_token_required",
          testMode: true,
          message: "Sandbox: ส่ง provider card token เท่านั้น ห้ามส่งเลขบัตรมายัง HOBEE API",
        },
      };
    },
  };
}

