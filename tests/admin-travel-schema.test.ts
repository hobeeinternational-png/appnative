import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/20260813_admin_travel_management.sql"), "utf8");

describe("admin travel management schema", () => {
  it("creates managed listings, rooms, galleries and booking-supporting records", () => {
    for (const table of ["travel_listings", "travel_listing_images", "travel_room_types", "travel_room_images", "travel_itinerary_days", "travel_departure_dates", "travel_add_ons"]) {
      expect(migration).toContain(`public.${table}`);
    }
  });

  it("keeps public catalog reads limited to published and visible content", () => {
    expect(migration).toContain("status = 'published' AND is_visible");
    expect(migration).toContain("travel_listings_admin_manage");
    expect(migration).toContain("private.is_platform_admin()");
  });

  it("protects travel image mutations behind admin storage policies", () => {
    expect(migration).toContain("'travel-images'");
    expect(migration).toContain("travel_images_admin_insert");
    expect(migration).toContain("travel_images_admin_update");
    expect(migration).toContain("travel_images_admin_delete");
  });
});
