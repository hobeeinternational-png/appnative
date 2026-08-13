import { describe, expect, it } from "vitest";
import { slugifyProductName, validateAdminProductInput } from "../lib/admin-product-validation";

describe("admin product create validation", () => {
  it("creates a stable slug from a product title", () => {
    expect(slugifyProductName("  HOBEE Local Coffee  ")).toBe("hobee-local-coffee");
  });
  it("rejects incomplete and invalid commercial fields", () => {
    expect(validateAdminProductInput({ shop_id: "", name: "A", slug: "", price: -1, stock_quantity: -1 })).toBe("เลือกหน้าร้านสำหรับสินค้านี้");
    expect(validateAdminProductInput({ shop_id: "shop-1", name: "สินค้า", slug: "สินค้า", price: 199, stock_quantity: 0 })).toBeNull();
  });
});
