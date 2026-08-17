import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { getBackRule } from "../lib/back-navigation";
import { isHobeeNotificationRoute, isStoreNotificationRoute, isTravelNotificationRoute } from "../lib/deep-links";

const root = resolve(__dirname, "..");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("Final UI Audit route hardening", () => {
  it("connects visible Account help and notification actions to navigable destinations", () => {
    const account = source("app/(tabs)/account.tsx");
    expect(account).toContain('protectedRoute("/my-hobee/notifications")');
    expect(account).toContain('router.push("/support")');
    expect(account).not.toContain('showToast("ศูนย์ช่วยเหลือพร้อมเชื่อมช่องทางสนับสนุน"');
  });

  it("keeps every Support topic on an existing destination family", () => {
    const support = source("app/support/index.tsx");
    expect(support).toContain('route: "/(tabs)/account"');
    expect(support).not.toContain('route: "/account"');
  });

  it("uses module-local safe-back fallbacks for audited deep routes", () => {
    expect(getBackRule("support").fallback).toBe("/(tabs)/account");
    expect(getBackRule("notification/[id]").fallback).toBe("/my-hobee/notifications");
    expect(getBackRule("travel/restaurant/[id]").fallback).toBe("/travel/food");
    expect(getBackRule("travel/food/orders/[reference]").fallback).toBe("/travel/food/orders");
    expect(getBackRule("travel/food/reservation/success/[id]").fallback).toBe("/travel/food/reservations");
    expect(getBackRule("admin/product/new").fallback).toBe("/admin/products");
    expect(getBackRule("admin/after-sales/[id]").fallback).toBe("/admin/after-sales");
  });

  it("allows only recognised Store and Travel notification destinations", () => {
    for (const route of ["/stores", "/stores/saved", "/stores/orders/local-order-01", "/travel", "/travel/my-trips", "/travel/bookings/trip-booking-01"]) {
      expect(isHobeeNotificationRoute(route)).toBe(true);
    }
    expect(isStoreNotificationRoute("/stores/orders/local-order-01/review")).toBe(false);
    expect(isTravelNotificationRoute("/travel/book/trip-01")).toBe(false);
    expect(isHobeeNotificationRoute("/travel/../../admin")).toBe(false);
  });

  it("renders unavailable QR and Learning resource actions as disabled presentation controls", () => {
    const header = source("components/hobee/my-hobee-ui.tsx");
    const learning = source("components/hobee/learning-course-extension.tsx");
    expect(header).toContain('accessibilityLabel="สแกน QR HOBEE ยังไม่พร้อมใช้งาน"');
    expect(header).not.toContain('onPress={() => undefined}');
    expect(learning).toContain("available={false}");
    expect(learning).toContain("accessibilityState={{ disabled: !available }}");
    expect(learning).not.toContain("ResourceRow icon=\"attach-file\" title=\"เอกสารประกอบบทเรียน\" description=\"จะแสดงไฟล์จริงเมื่อเชื่อม content storage\" onPress");
  });
});
