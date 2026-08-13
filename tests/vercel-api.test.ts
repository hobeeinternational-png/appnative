import { describe, expect, it } from "vitest";

import { getServerConfig } from "../vercel-backend/lib/env.js";
import { ApiError } from "../vercel-backend/lib/http.js";
import { createAdminProductSchema, createOrderSchema, parseSchema } from "../vercel-backend/lib/schemas.js";
import { signWebhookPayload, verifyWebhookSignature } from "../vercel-backend/lib/webhook.js";
import { createMockPaymentProvider } from "../vercel-backend/lib/payment-providers/mock.js";
import { createOpnPaymentProvider } from "../vercel-backend/lib/payment-providers/opn.js";
import { PaymentMethod } from "../vercel-backend/lib/payment-providers/provider.js";

const addressId = "2c0eea70-3d15-4f67-aac1-d7a73c8c98c2";
const productId = "a8bbcc0e-4d42-4d9c-9f4c-d8d4e70c8f76";

describe("HOBEE Vercel API utilities", () => {
  it("accepts an order request only when product and quantity payload is valid", () => {
    const input = parseSchema(createOrderSchema, {
      addressId,
      items: [{ productId, quantity: 2 }],
    });
    expect(input.items[0].quantity).toBe(2);
  });

  it("rejects a client order payload that tries to set its own price", () => {
    try {
      parseSchema(createOrderSchema, {
        addressId,
        items: [{ productId, quantity: 1, price: 1 }],
      });
      throw new Error("expected validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).code).toBe("validation_error");
    }
  });

  it("validates an admin product payload without accepting arbitrary fields", () => {
    const input = parseSchema(createAdminProductSchema, {
      shopId: productId,
      categoryId: addressId,
      name: "สินค้าทดสอบ HOBEE",
      slug: "hobee-test-product",
      price: 199,
      stockQuantity: 12,
      status: "draft",
    });
    expect(input.slug).toBe("hobee-test-product");

    expect(() => parseSchema(createAdminProductSchema, {
      ...input,
      serviceRoleKey: "must-never-be-client-input",
    })).toThrow(ApiError);
  });

  it("verifies only an unchanged HMAC webhook payload", () => {
    const raw = JSON.stringify({ eventId: "provider-event-0001", status: "paid" });
    const secret = "test-webhook-secret";
    const signature = signWebhookPayload(raw, secret);

    expect(verifyWebhookSignature(raw, signature, secret)).toBe(true);
    expect(verifyWebhookSignature(`${raw}x`, signature, secret)).toBe(false);
  });

  it("requires server-only Supabase and webhook configuration", () => {
    expect(() => getServerConfig({})).toThrow("SUPABASE_URL");
    expect(getServerConfig({
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      SUPABASE_SERVICE_ROLE_KEY: "sb_secret_test",
      PAYMENT_WEBHOOK_SECRET: "webhook-secret",
    }).supabaseUrl).toBe("https://example.supabase.co");
  });

  it("creates a sandbox PromptPay QR action without contacting a live processor", async () => {
    const mock = createMockPaymentProvider();
    const result = await mock.createIntent({
      method: PaymentMethod.MOCK_PROMPTPAY,
      paymentId: "payment-1",
      orderId: "order-1",
      amount: "350.00",
      currency: "THB",
    });
    expect(result.action.type).toBe("promptpay_qr");
    expect(result.action.testMode).toBe(true);
  });

  it("creates an Opn PromptPay charge request using only a server secret", async () => {
    let sentBody = "";
    const provider = createOpnPaymentProvider({
      secretKey: "skey_test_example",
      fetchImpl: async (_url: RequestInfo | URL, options?: RequestInit) => {
        sentBody = String(options?.body);
        return new Response(JSON.stringify({
          id: "chrg_test_hobee",
          status: "pending",
          livemode: false,
          expires_at: "2026-08-12T00:00:00Z",
          source: { scannable_code: { image: { download_uri: "https://provider.test/qr.svg" } } },
        }), { status: 200 });
      },
    });
    const result = await provider.createIntent({
      method: PaymentMethod.OPN_PROMPTPAY,
      paymentId: "payment-1",
      orderId: "order-1",
      orderNumber: "HB-001",
      amount: "350.00",
      currency: "THB",
    });
    expect(sentBody).toContain("source%5Btype%5D=promptpay");
    expect(sentBody).toContain("amount=35000");
    expect(result.action).toMatchObject({ type: "promptpay_qr", testMode: true });
  });

  it("rejects a raw card identifier that is not a provider token", async () => {
    const provider = createOpnPaymentProvider({ secretKey: "skey_test_example", fetchImpl: fetch });
    await expect(provider.createIntent({
      method: PaymentMethod.OPN_CARD,
      paymentId: "payment-1",
      orderId: "order-1",
      amount: "350.00",
      currency: "THB",
      cardToken: "4242424242424242",
    })).rejects.toMatchObject({ code: "card_token_required" });
  });
});
