import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");

describe("Home continuous top surface", () => {
  it("places AtmosphericCanvas outside ScreenContainer so the background reaches the safe area", () => {
    const source = readFileSync(resolve(root, "app/(tabs)/index.tsx"), "utf8");
    expect(source).toContain('<AtmosphericCanvas mood="home"><ScreenContainer containerClassName="bg-transparent" safeAreaClassName="pt-0"');
    expect(source).toContain("continuousTopSurface");
  });

  it("keeps the continuous top shell transparent and removes its boundary divider", () => {
    const source = readFileSync(resolve(root, "components/hobee/shared-ui.tsx"), "utf8");
    expect(source).toContain("fixedTopShellContinuous");
    expect(source).toContain('borderBottomWidth: 0');
    expect(source).toContain('backgroundColor: "transparent"');
  });
});
