import { describe, expect, it } from "vitest";

import { mergeRecentView, sanitizeRecentViews } from "../lib/recently-viewed-data";

const seed = { kind: "product" as const, contentId: "p1", title: "สินค้าท้องถิ่น", image: "https://example.com/p1.jpg", detail: "ร้านค้า HOBEE", route: "/product/[id]", params: { id: "p1" } };

describe("recently viewed data", () => {
  it("moves a repeated view to the front without duplicating it", () => {
    const initial = mergeRecentView([], seed, "2026-08-13T00:00:00.000Z");
    const updated = mergeRecentView(initial, seed, "2026-08-13T01:00:00.000Z");
    expect(updated).toHaveLength(1);
    expect(updated[0].viewedAt).toBe("2026-08-13T01:00:00.000Z");
  });

  it("keeps the newest history items within the configured limit", () => {
    const items = Array.from({ length: 14 }, (_, index) => mergeRecentView([], { ...seed, contentId: `p${index}`, title: `สินค้า ${index}` }, `2026-08-13T${String(index).padStart(2, "0")}:00:00.000Z`)[0]);
    expect(sanitizeRecentViews(items)).toHaveLength(12);
    expect(sanitizeRecentViews(items)[0].contentId).toBe("p13");
  });
});
