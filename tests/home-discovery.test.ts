import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "..", "app/(tabs)/index.tsx"), "utf8");

describe("Home discovery feed", () => {
  it("keeps the existing HOBEE categories while presenting the search-first discovery layout", () => {
    expect(source).toContain("HomeSearchActions");
    expect(source).toContain("CategoryRail");
    expect(source).toContain("RecentStories");
    expect(source).toContain("DiscoverySection");
    for (const category of ["ท่องเที่ยว", "ร้านค้า", "สินค้า", "บริการ", "ร้านอาหาร", "เรียนรู้", "Opportunity", "Community"]) {
      expect(source).toContain(category);
    }
  });

  it("keeps all discovery tabs and the shared fixed app shell", () => {
    expect(source).toContain("FixedAppShell");
    expect(source).toContain('"แนะนำ"');
    expect(source).toContain('"ใกล้คุณ"');
    expect(source).toContain('"โอกาส"');
  });
});
