import { describe, expect, it } from "vitest";
import { isAfterSalesNotificationRoute, isHobeeNotificationRoute } from "../lib/deep-links";

describe("after-sales notification routes", () => {
  it("allows only claim details and the controlled admin workspace", () => {
    expect(isAfterSalesNotificationRoute("/claims")).toBe(true);
    expect(isAfterSalesNotificationRoute("/claims/case_123")).toBe(true);
    expect(isAfterSalesNotificationRoute("/admin/after-sales")).toBe(true);
    expect(isHobeeNotificationRoute("/claims/case_123")).toBe(true);
  });

  it("rejects arbitrary or nested routes supplied by untrusted notifications", () => {
    expect(isAfterSalesNotificationRoute("/claims/case_123/delete")).toBe(false);
    expect(isAfterSalesNotificationRoute("https://malicious.example/claims")).toBe(false);
    expect(isHobeeNotificationRoute("/admin/users")).toBe(false);
  });
});
