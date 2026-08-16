import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { calculateTravelBooking } from "../lib/travel-booking";
import { TRAVEL_BOOKING_PRESENTATIONS, travelBookingStateLabel } from "../lib/travel-booking-presentation";
import { getTravelListing } from "../lib/travel-data";

const root = resolve(__dirname, "..");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("HOBEE Travel Ecosystem contracts", () => {
  it("defines the four travel intents and ten travel styles required by the discovery hub", () => {
    const ecosystem = source("lib/travel-ecosystem.ts");
    expect(ecosystem).toContain("export const TRAVEL_INTENTS");
    expect(ecosystem).toContain("export const TRAVEL_STYLES");
    for (const id of ["local-life", "regional-trips", "foreign-visitors", "trip-builder"]) expect(ecosystem).toContain(`id: "${id}"`);
    for (const id of ["nature", "culture", "adventure", "workation", "camping", "workshop", "food", "family", "couple", "creator"]) expect(ecosystem).toContain(`id: "${id}"`);
  });

  it("keeps all preview booking cards explicitly in presentation mode", () => {
    expect(TRAVEL_BOOKING_PRESENTATIONS.length).toBeGreaterThan(0);
    expect(TRAVEL_BOOKING_PRESENTATIONS.every((booking) => booking.dataMode === "presentation")).toBe(true);
    expect(travelBookingStateLabel("upcoming")).toBe("กำลังจะไป");
    expect(travelBookingStateLabel("completed")).toBe("เสร็จแล้ว");
  });

  it("calculates travel booking only from existing listing and selected draft contracts", () => {
    const listing = getTravelListing("trip-lipe-3d2n");
    expect(listing).toBeDefined();
    const quote = calculateTravelBooking(listing!, { listingId: listing!.id, listingType: "trip", tripMode: "join", departureDate: listing!.departureDates?.[0], adults: 2, children: 0, rooms: 1, addOnIds: [], paymentPlan: "deposit" });
    expect(quote.totalAmount).toBeGreaterThan(0);
    expect(quote.depositAmount).toBeGreaterThan(0);
    expect(quote.depositAmount).toBeLessThanOrEqual(quote.totalAmount);
  });

  it("maintains a four-step native booking journey and a server-side payment boundary", () => {
    const booking = source("app/travel/book/[id].tsx");
    expect(booking).toContain('const STEPS = ["Trip & Date", "Preferences", "Travelers", "Review"]');
    expect(booking).toContain("payment intent จริง");
    expect(booking).toContain('pathname: "/travel/voucher/[id]"');
  });

  it("exposes planner, visitor, search, safety, booking detail and review routes through app navigation", () => {
    const layout = source("app/_layout.tsx");
    for (const route of ["travel/my-trips", "travel/bookings/[id]", "travel/review/[id]", "travel/visitor", "travel/search", "travel/safety"]) expect(layout).toContain(`name="${route}"`);
    expect(source("app/travel/trip-builder.tsx")).toContain("งบประมาณเป็น calculation ในเครื่อง");
    expect(source("app/travel/visitor.tsx")).toContain("verified providers");
    expect(source("app/travel/safety.tsx")).toContain("รอ verified source");
  });

  it("includes creator templates and visitor services without creating a separate backend entity", () => {
    const ecosystem = source("lib/travel-ecosystem.ts");
    expect(ecosystem).toContain("export const CREATOR_TRIP_TEMPLATES");
    expect(ecosystem).toContain("export const FOREIGN_VISITOR_SERVICES");
    expect(ecosystem).toContain("TravelListing");
  });
});
