import { describe, expect, it } from "vitest";

import { buildMyHobeeTodaySummary, getMyHobeeRoleDefinition, roleStatusLabel, workItemTypeLabel, type MyHobeeSummaryWorkItem } from "../lib/my-hobee-summary";

describe("My HOBEE data helpers", () => {
  it("summarizes live customer orders and unread work without inventing values", () => {
    const inbox: MyHobeeSummaryWorkItem[] = [
      { id: "work-1", item_type: "ORDER", reference_id: "order-1", title: "ออเดอร์ใหม่", body: null, urgency_level: "urgent", due_at: null, is_read: false, metadata: {}, created_at: "2026-08-14T00:00:00Z" },
      { id: "work-2", item_type: "MESSAGE", reference_id: null, title: "ข้อความ", body: null, urgency_level: "normal", due_at: null, is_read: true, metadata: {}, created_at: "2026-08-14T00:00:00Z" },
    ];
    const summary = buildMyHobeeTodaySummary([
      { id: "order-1", order_number: "HB-1", subtotal: 120, shipping_fee: 0, discount_amount: 0, total: 120, currency: "THB", status: "processing", payment_status: "paid", created_at: "2026-08-14T00:00:00Z" },
      { id: "order-2", order_number: "HB-2", subtotal: 80, shipping_fee: 0, discount_amount: 0, total: 80, currency: "THB", status: "delivered", payment_status: "paid", created_at: "2026-08-13T00:00:00Z" },
    ], inbox, { coupons: [{ id: "coupon-1", code: "HOBEE", name: "HOBEE", description: null, discount_type: "fixed", discount_value: 10, minimum_subtotal: 0, ends_at: null, used_at: null, claimed_at: "2026-08-14T00:00:00Z" }] }, 3);

    expect(summary).toEqual({ activeCustomerOrders: 1, unreadWorkItems: 1, urgentWorkItems: 1, activeCoupons: 1, favoriteCount: 3 });
  });

  it("maps role and inbox labels for Thai mobile UI", () => {
    expect(getMyHobeeRoleDefinition("seller")?.shortLabel).toBe("ผู้ขาย");
    expect(getMyHobeeRoleDefinition("admin")?.label).toBe("HOBEE Admin");
    expect(roleStatusLabel("reviewing")).toBe("กำลังพิจารณา");
    expect(workItemTypeLabel("CREATOR_JOB")).toBe("งานครีเอเตอร์");
  });
});
