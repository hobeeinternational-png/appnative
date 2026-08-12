import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");
const screens = ["app/(tabs)/index.tsx", "app/(tabs)/shop.tsx", "app/(tabs)/discover.tsx"];

describe("fixed top app shell", () => {
  it("keeps the shared header and search outside each scrolling content region", () => {
    for (const screen of screens) {
      const source = readFileSync(resolve(root, screen), "utf8");
      expect(source).toContain("FixedAppShell");
      expect(source).toContain("header={<AppHeader");
      expect(source).toContain("search={<");
      expect(source).toContain("style={styles.scroll}");
    }
  });

  it("elevates the shared app shell only from each tab's vertical scroll offset", () => {
    const sharedUi = readFileSync(resolve(root, "components/hobee/shared-ui.tsx"), "utf8");
    expect(sharedUi).toContain("export function useHeaderElevation");
    expect(sharedUi).toContain("fixedTopShellElevated");
    expect(sharedUi).toContain("contentOffset.y > threshold");
    for (const screen of screens) {
      const source = readFileSync(resolve(root, screen), "utf8");
      expect(source).toContain("useHeaderElevation()");
      expect(source).toContain("elevated={elevated}");
      expect(source).toContain("onScroll={onScroll}");
      expect(source).toContain("scrollEventThrottle={16}");
    }
  });
});
