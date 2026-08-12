import { describe, expect, it } from "vitest";

import { calculateLocalPreorder, localQueuePreviewRef } from "../lib/local-preorder";
import { dayPlans, listingsForProvince, provinceListings } from "../lib/province-local";

describe("province local discovery preview", () => {
  it("filters listings by province, category and halal attribute", () => {
    const results = listingsForProvince("narathiwat", "restaurant", ["halal"]);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((entry) => entry.provinceId === "narathiwat" && entry.category === "restaurant" && entry.halalSupported)).toBe(true);
  });

  it("keeps day-plan stops linked to an existing province listing", () => {
    const ids = new Set(provinceListings.map((entry) => entry.id));
    expect(dayPlans.flatMap((plan) => plan.stops).every((stop) => ids.has(stop.listingId))).toBe(true);
  });

  it("calculates only selected local menu lines and uses a preview queue reference", () => {
    const menu = provinceListings.find((entry) => entry.featuredMenu)?.featuredMenu ?? [];
    const quote = calculateLocalPreorder(menu, { [menu[0].id]: 2 });
    expect(quote.lines).toHaveLength(1);
    expect(quote.total).toBe(menu[0].price * 2);
    expect(localQueuePreviewRef("narathiwat-rice-bowl")).toContain("PREVIEW");
  });
});
