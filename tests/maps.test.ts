import { describe, expect, it } from "vitest";

import { googleMapsDirectionsUrl, googleMapsSearchUrl } from "../lib/maps-links";

describe("HOBEE Maps deep links", () => {
  const destination = { lat: 6.489, lng: 99.302 };

  it("creates an encoded Google Maps search URL", () => {
    expect(googleMapsSearchUrl(destination)).toContain("query=6.489%2C99.302");
  });

  it("creates a driving directions URL with optional origin", () => {
    const url = googleMapsDirectionsUrl(destination, { lat: 6.1, lng: 99.1 });
    expect(url).toContain("origin=6.1%2C99.1");
    expect(url).toContain("destination=6.489%2C99.302");
    expect(url).toContain("travelmode=driving");
  });
});
