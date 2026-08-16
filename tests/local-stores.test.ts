import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { calculateLocalStorePreorder, localStorePreviewReference } from "../lib/local-store-preorder";
import { DEFAULT_LOCAL_STORE_FILTERS, LOCAL_STORE_CATEGORIES, LOCAL_STORE_PRESENTATION_DATA, getOpeningState, queryLocalStores } from "../lib/local-stores";

const root = resolve(__dirname, "..");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("Local Stores presentation repository", () => {
  it("keeps presentation fixtures explicitly labelled and separate from Shop product data", () => {
    expect(LOCAL_STORE_PRESENTATION_DATA.length).toBeGreaterThan(0);
    expect(LOCAL_STORE_PRESENTATION_DATA.every((store) => store.dataMode === "presentation")).toBe(true);
    expect(source("app/(tabs)/index.tsx")).toContain('{ label: "ร้านค้า", icon: "storefront", tone: "#FFF2D8", route: "/stores" }');
  });
  it("supports required local-store category choices", () => {
    for (const id of ["restaurant", "cafe", "souvenir", "community", "agriculture", "batik", "health", "lifestyle", "service", "other"]) expect(LOCAL_STORE_CATEGORIES.some((category) => category.id === id)).toBe(true);
  });
  it("filters the directory by province, category, query and available fulfilment", () => {
    const cafe = queryLocalStores("yala", { ...DEFAULT_LOCAL_STORE_FILTERS, category: "cafe", search: "ชาชัก", pickup: true });
    expect(cafe.items).toHaveLength(1);
    expect(cafe.items[0]?.preorderSupported).toBe(true);
    expect(cafe.items[0]?.fulfilment).toContain("pickup");
  });
  it("derives opening UI state from opening-hours contract rather than fixed display flags", () => {
    const store = LOCAL_STORE_PRESENTATION_DATA[0]!;
    expect(getOpeningState(store, new Date("2026-08-16T12:00:00"))).toMatchObject({ isOpen: true, label: "เปิดอยู่" });
    expect(getOpeningState(store, new Date("2026-08-16T23:00:00"))).toMatchObject({ isOpen: false, label: "ปิดอยู่" });
  });
});

describe("Local Store preorder journey", () => {
  it("calculates only menu lines that exist in the selected store and preserves price boundaries", () => {
    const store = LOCAL_STORE_PRESENTATION_DATA.find((candidate) => candidate.id === "local-narathiwat-khao-yam")!;
    const summary = calculateLocalStorePreorder(store.menu, [{ menuItemId: "rice-yam", quantity: 2 }, { menuItemId: "unknown", quantity: 5 }]);
    expect(summary.lines).toHaveLength(1);
    expect(summary.subtotal).toBe(110);
    expect(summary.hasPriceBoundary).toBe(false);
  });
  it("generates a clearly labelled preview reference until a real Store Order API is integrated", () => {
    expect(localStorePreviewReference("local-narathiwat-khao-yam")).toContain("PREVIEW");
  });
  it("registers the complete Local Store navigation flow", () => {
    const layout = source("app/_layout.tsx");
    for (const route of ["stores", "stores/[id]", "stores/[id]/preorder", "stores/saved", "stores/orders/[reference]", "stores/orders/[reference]/review"]) expect(layout).toContain(`name="${route}"`);
    expect(source("app/stores/index.tsx")).toContain("<FlatList");
    expect(source("app/stores/[id].tsx")).toContain("goBackOr(router, \"/stores\")");
    expect(source("app/stores/[id]/preorder.tsx")).toContain("LOCAL PRE-ORDER");
  });
});
