import { describe, expect, it } from "vitest";

import { buildTravelCanonicalLink, buildTravelDeepLink, buildTravelMapLink, travelShareMessage } from "../lib/travel-links";

describe("travel links", () => {
  it("creates an encoded canonical listing link with an optional referral", () => {
    expect(buildTravelCanonicalLink("betong garden", "TRAVEL-001")).toBe("https://hobee.app/travel/betong%20garden?ref=TRAVEL-001");
  });

  it("creates a custom-scheme deep link scoped to a travel listing", () => {
    expect(buildTravelDeepLink("trip-lipe-3d2n")).toBe("manushobeemobile://travel/trip-lipe-3d2n");
  });

  it("builds a Google Maps URL only for valid coordinates", () => {
    expect(buildTravelMapLink(6.489, 99.302)).toBe("https://www.google.com/maps/search/?api=1&query=6.489%2C99.302");
    expect(() => buildTravelMapLink(Number.NaN, 99.302)).toThrow("coordinates");
  });

  it("includes the canonical URL in a share message", () => {
    expect(travelShareMessage("Lipe", "lipe-islands-3d2n")).toContain("https://hobee.app/travel/lipe-islands-3d2n");
  });
});
