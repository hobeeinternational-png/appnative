import { describe, expect, it } from "vitest";
import { ORDER_OPERATION_DETAILS, ORGANIZATION_PERMISSION_LABELS, nextOrderOperation } from "../lib/my-hobee-phase2-summary";

describe("MY HOBEE Phase 2 operating rules", () => {
  it("maps existing order statuses to safe mobile operations without changing the order contract", () => {
    expect(nextOrderOperation("pending", false)).toBe("ACCEPTED");
    expect(nextOrderOperation("confirmed", false)).toBe("PREPARING");
    expect(nextOrderOperation("processing", false)).toBe("READY");
    expect(nextOrderOperation("processing", true)).toBe("SHIPPED");
    expect(nextOrderOperation("shipped", true)).toBe("COMPLETED");
    expect(nextOrderOperation("delivered", true)).toBeNull();
    expect(nextOrderOperation("cancelled", false)).toBeNull();
  });

  it("requires explicit confirmation only for high-impact fulfillment actions", () => {
    expect(ORDER_OPERATION_DETAILS.ACCEPTED.confirm).toBe(false);
    expect(ORDER_OPERATION_DETAILS.PREPARING.confirm).toBe(false);
    expect(ORDER_OPERATION_DETAILS.SHIPPED.confirm).toBe(true);
    expect(ORDER_OPERATION_DETAILS.COMPLETED.confirm).toBe(true);
  });

  it("keeps every organization permission user-readable", () => {
    expect(Object.keys(ORGANIZATION_PERMISSION_LABELS)).toEqual([
      "VIEW_ORDERS", "MANAGE_ORDERS", "VIEW_BOOKINGS", "MANAGE_BOOKINGS", "VIEW_EARNINGS", "MANAGE_STAFF", "MANAGE_PRODUCTS", "MANAGE_ROOMS", "APPROVE_ACTIONS",
    ]);
    expect(ORGANIZATION_PERMISSION_LABELS.MANAGE_ORDERS).toBe("จัดการคำสั่งซื้อ");
  });
});
