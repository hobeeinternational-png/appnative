import { describe, expect, it } from "vitest";

import { FLOATING_NAV_CONFIG, movedEnough, nextNavMode, settledNavMode, snapFloatingPosition } from "../lib/floating-nav";

describe("HOBEE floating navigation", () => {
  it("transitions normal and floating modes through animation states", () => {
    expect(nextNavMode("normal")).toBe("collapsing");
    expect(settledNavMode("collapsing")).toBe("floating");
    expect(nextNavMode("floating")).toBe("expanding");
    expect(settledNavMode("expanding")).toBe("normal");
  });

  it("requires movement beyond the drag threshold", () => {
    expect(movedEnough({ x: 0, y: 0 }, { x: FLOATING_NAV_CONFIG.dragThreshold, y: 0 })).toBe(false);
    expect(movedEnough({ x: 0, y: 0 }, { x: FLOATING_NAV_CONFIG.dragThreshold + 1, y: 0 })).toBe(true);
  });

  it("snaps horizontally to the nearest edge while respecting safe vertical bounds", () => {
    const left = snapFloatingPosition({ x: 70, y: -100 }, { width: 390, height: 844 }, { top: 59, bottom: 34 });
    const right = snapFloatingPosition({ x: 310, y: 999 }, { width: 390, height: 844 }, { top: 59, bottom: 34 });
    expect(left.x).toBe(FLOATING_NAV_CONFIG.floatSize / 2 + FLOATING_NAV_CONFIG.edgeSnapMargin);
    expect(right.x).toBe(390 - FLOATING_NAV_CONFIG.floatSize / 2 - FLOATING_NAV_CONFIG.edgeSnapMargin);
    expect(left.y).toBeGreaterThanOrEqual(59 + FLOATING_NAV_CONFIG.floatSize / 2 + FLOATING_NAV_CONFIG.edgeSnapMargin);
    expect(right.y).toBeLessThanOrEqual(844 - 34 - FLOATING_NAV_CONFIG.floatSize / 2 - FLOATING_NAV_CONFIG.edgeSnapMargin);
  });
});
