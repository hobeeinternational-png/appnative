import { describe, expect, it } from "vitest";
import { isHobeeNotificationRoute, isMyHobeeNotificationRoute, isOrderNotificationRoute } from "../lib/deep-links";

describe("MY HOBEE notification deep links", () => {
  it("accepts supported order and My HOBEE notification destinations", () => {
    expect(isOrderNotificationRoute("/orders/abc-123")).toBe(true);
    expect(isMyHobeeNotificationRoute("/my-hobee")).toBe(true);
    expect(isMyHobeeNotificationRoute("/my-hobee/roles")).toBe(true);
    expect(isMyHobeeNotificationRoute("/my-hobee/work")).toBe(true);
    expect(isMyHobeeNotificationRoute("/my-hobee/earnings")).toBe(true);
    expect(isMyHobeeNotificationRoute("/my-hobee/notifications")).toBe(true);
    expect(isHobeeNotificationRoute("/my-hobee/work")).toBe(true);
  });

  it("rejects untrusted or unsupported notification destinations", () => {
    expect(isHobeeNotificationRoute("https://example.com")).toBe(false);
    expect(isHobeeNotificationRoute("/admin/role-approvals")).toBe(false);
    expect(isHobeeNotificationRoute("/my-hobee/earnings/export")).toBe(false);
    expect(isHobeeNotificationRoute(undefined)).toBe(false);
  });
});
