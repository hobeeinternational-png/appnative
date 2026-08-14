import { describe, expect, it } from "vitest";
import { afterSalesQueueRank, canPostInternalNote, caseQueueLabel, getAfterSalesSlaState } from "../lib/after-sales-operations-summary";

describe("after-sales operations helpers", () => {
  it("prioritizes breached urgent cases before normal cases", () => {
    const now = Date.parse("2026-08-14T00:00:00.000Z");
    expect(getAfterSalesSlaState("2026-08-13T23:59:59.000Z", now)).toBe("breached");
    expect(afterSalesQueueRank({ priority: "urgent", slaState: "breached", updatedAt: "2026-08-14T00:00:00.000Z" })).toBeGreaterThan(afterSalesQueueRank({ priority: "normal", slaState: "normal", updatedAt: "2026-08-14T00:00:00.000Z" }));
  });

  it("derives return/refund/replacement queues without duplicating case status", () => {
    expect(caseQueueLabel({ status: "in_progress", requestedResolution: "return_and_refund", returnStatus: "shipped" })).toBe("รอคืนสินค้า");
    expect(caseQueueLabel({ status: "in_progress", requestedResolution: "refund", refundStatus: "processing" })).toBe("รอคืนเงิน");
    expect(caseQueueLabel({ status: "approved", requestedResolution: "replacement", replacementStatus: "preparing" })).toBe("รอเปลี่ยนสินค้า");
  });

  it("keeps internal notes private without the explicit permission", () => {
    expect(canPostInternalNote([], false)).toBe(false);
    expect(canPostInternalNote(["VIEW_INTERNAL_NOTES"], false)).toBe(true);
    expect(canPostInternalNote([], true)).toBe(true);
  });
});
