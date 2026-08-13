import { describe, expect, it } from "vitest";
import { isOrderNotificationRoute, parsePaymentReturn } from "../lib/deep-links";

describe("HOBEE native callbacks", () => {
  it("parses a supported payment callback without trusting unrecognised status", () => {
    expect(parsePaymentReturn("manushobeemobile://payment/callback?order_id=ord_1&status=success")).toEqual({ orderId: "ord_1", status: "success" });
    expect(parsePaymentReturn("manushobeemobile://payment/callback?status=unverified")).toEqual({ orderId: null, status: "unknown" });
    expect(parsePaymentReturn("manushobeemobile://auth/callback")).toBeNull();
  });

  it("allows notification navigation only to order routes", () => {
    expect(isOrderNotificationRoute("/orders")).toBe(true);
    expect(isOrderNotificationRoute("/orders/ord_123")).toBe(true);
    expect(isOrderNotificationRoute("/admin")).toBe(false);
    expect(isOrderNotificationRoute("https://untrusted.example")).toBe(false);
  });
});
