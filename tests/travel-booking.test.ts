import { describe, expect, it } from "vitest";

import { calculateTravelBooking, daysBetween, previewBookingRef } from "../lib/travel-booking";
import { travelListings } from "../lib/travel-data";

describe("travel booking preview", () => {
  it("calculates accommodation nights, selected room and add-ons", () => {
    const listing = travelListings.find((entry) => entry.listingType === "accommodation");
    if (!listing) throw new Error("Expected preview accommodation listing");
    const room = listing.roomTypes?.[0];
    const quote = calculateTravelBooking(listing, { listingId: listing.id, listingType: "accommodation", roomTypeId: room?.id, checkIn: "2026-09-12", checkOut: "2026-09-14", rooms: 1, adults: 2, children: 0, addOnIds: [listing.addOns[0].id], paymentPlan: "deposit" });
    expect(quote.nights).toBe(2);
    expect(quote.totalAmount).toBeGreaterThan(quote.baseAmount);
    expect(quote.depositAmount).toBe(Math.round(quote.totalAmount * 0.4));
  });

  it("keeps a minimum one-night stay for incomplete or invalid dates", () => {
    expect(daysBetween(undefined, undefined)).toBe(1);
    expect(daysBetween("2026-09-14", "2026-09-12")).toBe(1);
  });

  it("uses a visibly preview-only booking reference", () => {
    expect(previewBookingRef("trip-lipe-3d2n")).toContain("PREVIEW");
  });
});
