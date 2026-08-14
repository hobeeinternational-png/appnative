import { describe, expect, it } from "vitest";

import { buildBuyAgainPlan, canAllocateRefund, canAutoCompleteOrder, getCustomerOrderActions, resolveCustomerLifecycle } from "../lib/customer-journey";

describe("customer commerce lifecycle", () => {
  it("keeps carrier delivered distinct from customer received confirmation", () => {
    const delivered = { orderStatus: "delivered", paymentStatus: "paid", customerReceivedAt: null, shipmentStatuses: ["delivered"], hasOpenCase: false };
    expect(resolveCustomerLifecycle(delivered)).toBe("delivered");
    expect(getCustomerOrderActions(delivered)).toContain("confirm_received");
    expect(resolveCustomerLifecycle({ ...delivered, customerReceivedAt: "2026-08-14T00:00:00Z" })).toBe("completed");
  });

  it("blocks auto completion when an after-sales case is open", () => {
    const input = { orderStatus: "delivered", paymentStatus: "paid", customerReceivedAt: null, shipmentStatuses: ["delivered"], hasOpenCase: true };
    expect(canAutoCompleteOrder(input, true)).toBe(false);
    expect(canAutoCompleteOrder({ ...input, hasOpenCase: false }, false)).toBe(false);
    expect(canAutoCompleteOrder({ ...input, hasOpenCase: false }, true)).toBe(true);
  });

  it("shows status-safe actions and preserves server-side financial limit", () => {
    expect(getCustomerOrderActions({ orderStatus: "pending", paymentStatus: "pending", customerReceivedAt: null, shipmentStatuses: [], hasOpenCase: false })).toEqual(["pay", "cancel", "get_help"]);
    expect(getCustomerOrderActions({ orderStatus: "processing", paymentStatus: "paid", customerReceivedAt: null, shipmentStatuses: [], hasOpenCase: false })).toEqual(["get_help"]);
    expect(canAllocateRefund({ paidAmount: 250, reservedRefundAmount: 60, requestedAmount: 190 })).toBe(true);
    expect(canAllocateRefund({ paidAmount: 250, reservedRefundAmount: 60, requestedAmount: 191 })).toBe(false);
  });

  it("uses current catalog stock instead of historic order price or quantity", () => {
    const plan = buildBuyAgainPlan([{ product_id: "available", product_name: "น้ำผึ้ง", quantity: 4 }, { product_id: "gone", product_name: "สินค้าเดิม", quantity: 1 }], [{ id: "available", price: 349, stock: 2 }]);
    expect(plan[0]).toMatchObject({ quantityToAdd: 2, unavailableReason: null, product: { price: 349, stock: 2 } });
    expect(plan[1]).toMatchObject({ quantityToAdd: 0, unavailableReason: "สินค้านี้ไม่ได้วางจำหน่ายแล้ว" });
  });
});
