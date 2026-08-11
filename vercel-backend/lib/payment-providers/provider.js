import { ApiError } from "../http.js";

export const PaymentMethod = Object.freeze({
  MOCK_PROMPTPAY: "mock_promptpay",
  MOCK_CARD: "mock_card",
  OPN_PROMPTPAY: "opn_promptpay",
  OPN_CARD: "opn_card",
});

export function assertPaymentAdapter(adapter) {
  if (!adapter || typeof adapter.createIntent !== "function") {
    throw new ApiError(500, "payment_adapter_unavailable", "Payment provider adapter ยังไม่พร้อมใช้งาน");
  }
  return adapter;
}

export function toSubunits(amount, currency) {
  if (currency !== "THB") throw new ApiError(400, "unsupported_currency", "รองรับเฉพาะ THB");
  const value = Math.round(Number(amount) * 100);
  if (!Number.isSafeInteger(value) || value < 2000 || value > 15000000) {
    throw new ApiError(400, "payment_amount_invalid", "ยอดชำระต้องอยู่ระหว่าง ฿20 และ ฿150,000");
  }
  return value;
}

export function mapProviderStatus(status) {
  if (["successful", "paid"].includes(status)) return "paid";
  if (["authorized"].includes(status)) return "authorized";
  if (["failed", "expired", "reversed"].includes(status)) return "failed";
  return "pending";
}

