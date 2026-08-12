import { describe, expect, it } from "vitest";

import { calculateRestaurantOrder, restaurantQueuePreviewRef } from "../lib/restaurant-order";
import { getFoodTimeSlot, menuForTimeSlot, restaurantListings, restaurantsForTimeSlot } from "../lib/restaurant-data";

describe("restaurant time-aware hub", () => {
  it("maps local time into the intended meal period", () => {
    expect(getFoodTimeSlot(new Date("2026-08-12T08:30:00"))).toBe("morning");
    expect(getFoodTimeSlot(new Date("2026-08-12T12:30:00"))).toBe("lunch");
    expect(getFoodTimeSlot(new Date("2026-08-12T22:30:00"))).toBe("late_night");
  });

  it("filters only restaurants that satisfy selected quick filters", () => {
    const results = restaurantsForTimeSlot("lunch", ["halal", "preorder", "fast"]);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((entry) => entry.isHalalCertified && entry.preorderSupported && entry.averagePrepTimeMinutes <= 15)).toBe(true);
  });

  it("keeps all-day menu categories visible with time-targeted menu categories", () => {
    const categories = menuForTimeSlot(restaurantListings[0], "morning");
    expect(categories.some((entry) => entry.timeSlotTarget === "morning")).toBe(true);
    expect(categories.some((entry) => entry.timeSlotTarget === "all_day")).toBe(true);
  });

  it("calculates selected menu customization and marks queue references as preview", () => {
    const menu = restaurantListings[0].menuCategories.flatMap((category) => category.items);
    const tea = menu.find((entry) => entry.id === "food-tea")!;
    const quote = calculateRestaurantOrder(menu, [{ itemId: tea.id, quantity: 2, selectedOptions: [{ label: "ฟองหนา", extraPrice: 5 }] }]);
    expect(quote.total).toBe((tea.price + 5) * 2);
    expect(restaurantQueuePreviewRef("restaurant-wang")).toContain("PREVIEW");
  });
});
