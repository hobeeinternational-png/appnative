import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");
const screens = ["app/(tabs)/index.tsx", "app/(tabs)/shop.tsx", "app/(tabs)/discover.tsx"];

describe("top header safe area", () => {
  it("reserves additional top spacing on all screens that render AppHeader", () => {
    for (const screen of screens) {
      const source = readFileSync(resolve(root, screen), "utf8");
      expect(source).toContain('safeAreaClassName="pt-5"');
      expect(source).toContain('<AppHeader />');
    }
  });
});
