import { describe, expect, it } from "vitest";

import { hobeeProducts } from "../lib/hobee-data";
import { deriveCommunityOrigins, deriveShopCategories, deriveShopImpact } from "../lib/shop-data";

describe("shop community data", () => {
  it("derives categories and community cards from catalogue rows", () => {
    const categories = deriveShopCategories(hobeeProducts);
    const origins = deriveCommunityOrigins(hobeeProducts);

    expect(categories[0]?.id).toBe("ทั้งหมด");
    expect(categories.some((category) => category.id === "ของดีชุมชน")).toBe(true);
    expect(origins.length).toBeGreaterThan(0);
    expect(origins.reduce((total, origin) => total + origin.count, 0)).toBe(hobeeProducts.length);
  });

  it("reports impact values only from current catalogue totals", () => {
    const impact = deriveShopImpact(hobeeProducts);

    expect(impact.available).toBe(true);
    expect(impact.productCount).toBe(hobeeProducts.length);
    expect(impact.producerCount).toBe(new Set(hobeeProducts.map((product) => product.shopName)).size);
    expect(impact.originCount).toBe(new Set(hobeeProducts.map((product) => product.origin)).size);
  });
});
