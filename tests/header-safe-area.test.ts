import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");
const screens = [
  { path: "app/(tabs)/index.tsx", safeArea: "pt-0" },
  { path: "app/(tabs)/shop.tsx", safeArea: "pt-7" },
  { path: "app/(tabs)/discover.tsx", safeArea: "pt-7" },
];

describe("top header safe area", () => {
  it("reserves additional top spacing on all screens that render a fixed top shell", () => {
    for (const screen of screens) {
      const source = readFileSync(resolve(root, screen.path), "utf8");
      expect(source).toContain(`safeAreaClassName="${screen.safeArea}"`);
      expect(source.includes("<AppHeader") || source.includes("<HomeSearchActions")).toBe(true);
    }
  });
});
