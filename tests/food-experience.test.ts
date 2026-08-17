import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { foodRestaurantMatches, FOOD_COLLECTIONS, getFoodMealExperience, getRestaurantExperience } from "../lib/food-experience";
import { isFoodNotificationRoute } from "../lib/deep-links";

const root = resolve(__dirname, "..");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("Food Experience contracts", () => {
  it("maps restaurant entities to a non-duplicative Food experience contract", () => {
    const first = getRestaurantExperience("restaurant-betong");
    expect(first?.restaurantId).toBe("restaurant-betong");
    expect(first?.badges.length).toBeGreaterThan(0);
    expect(getFoodMealExperience("lunch").quickChips.length).toBeGreaterThan(0);
  });

  it("supports discovery searches over restaurant and menu data", () => {
    const matches = foodRestaurantMatches("");
    expect(matches.length).toBeGreaterThan(0);
    expect(foodRestaurantMatches("").map((item) => item.id)).toEqual(expect.arrayContaining(["restaurant-betong"]));
  });

  it("keeps editorial food collections available without operating data", () => {
    expect(FOOD_COLLECTIONS.length).toBeGreaterThanOrEqual(3);
    expect(FOOD_COLLECTIONS.every((item) => item.title && item.subtitle)).toBe(true);
  });
});

describe("Food route and safety coverage", () => {
  it("permits only supported Food notification paths", () => {
    expect(isFoodNotificationRoute("/travel/food/orders/HB-FOOD-2026-9921")).toBe(true);
    expect(isFoodNotificationRoute("/travel/food/reservations")).toBe(true);
    expect(isFoodNotificationRoute("/travel/food/private-secret")).toBe(false);
  });

  it("registers Food cart, reservation, queue, saved, map, search, collections, safety and merchant routes", () => {
    const layout = source("app/_layout.tsx");
    for (const route of ["travel/food/cart", "travel/food/reservation/[id]", "travel/food/queue/[id]", "travel/food/orders", "travel/food/reservations", "travel/food/saved", "travel/food/map", "travel/food/search", "travel/food/collections", "travel/food/safety", "restaurant-merchant"]) expect(layout).toContain(`name="${route}"`);
  });

  it("separates Food Cart state from ecommerce cart and persists Food preferences locally", () => {
    expect(source("contexts/food-cart-context.tsx")).toContain("FoodCartProvider");
    const preferences = source("contexts/food-preferences-context.tsx");
    expect(preferences).toContain("hobee.food-preferences.v1");
    expect(preferences).toContain("savedRestaurantIds");
    expect(preferences).toContain("recentRestaurantIds");
  });

  it("preserves customer-facing presentation boundaries rather than inventing live transactions", () => {
    expect(source("app/travel/food/orders/[reference].tsx")).toContain("ยังไม่มี Food Order transaction ถูกสร้าง");
    expect(source("app/travel/food/reservation/[id].tsx")).toContain("Reservation");
    expect(source("app/restaurant-merchant/index.tsx")).toContain("ไม่มีการแสดงยอดขาย ยอดออเดอร์ หรือคิวจำลอง");
  });
});
