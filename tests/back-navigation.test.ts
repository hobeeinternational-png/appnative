import { describe, expect, it } from "vitest";

import { getBackRule, shouldShowBackHeader } from "../lib/back-navigation";

describe("HOBEE BackHeader route rules", () => {
  it("keeps root tabs and authentication callbacks free of a back header", () => {
    expect(shouldShowBackHeader("(tabs)")).toBe(false);
    expect(shouldShowBackHeader("auth")).toBe(false);
    expect(shouldShowBackHeader("payment/callback")).toBe(false);
  });

  it("shows a native back header for deep customer and admin routes", () => {
    expect(shouldShowBackHeader("product/[id]")).toBe(true);
    expect(shouldShowBackHeader("orders/[id]")).toBe(true);
    expect(shouldShowBackHeader("admin/index")).toBe(true);
    expect(getBackRule("product/[id]").fallback).toBe("/(tabs)/shop");
    expect(getBackRule("orders/[id]").fallback).toBe("/orders");
    expect(getBackRule("admin/index").fallback).toBe("/(tabs)/account");
  });

  it("uses a safe Home fallback for unknown deep links", () => {
    expect(getBackRule("unknown/route").fallback).toBe("/(tabs)");
  });
});
