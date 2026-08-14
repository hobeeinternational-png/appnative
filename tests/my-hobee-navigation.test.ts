import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(__dirname, "..");

describe("My HOBEE navigation", () => {
  it("routes the center HOBEE single tap to My HOBEE while preserving the double-tap mode toggle", () => {
    const source = readFileSync(resolve(projectRoot, "components/hobee/floating-tab-bar.tsx"), "utf8");
    expect(source).toContain('hobeeRouter.push("/my-hobee")');
    expect(source).toContain("FLOATING_NAV_CONFIG.doubleTapWindowMs");
    expect(source).toContain("toggleMode(); return;");
    expect(source).not.toContain("showQuickMenu");
  });

  it("registers all My HOBEE module routes without adding a second bottom navigation", () => {
    const layout = readFileSync(resolve(projectRoot, "app/my-hobee/_layout.tsx"), "utf8");
    expect(layout).toContain('name="index"');
    expect(layout).toContain('name="roles"');
    expect(layout).toContain('name="work"');
    expect(layout).not.toContain("FloatingBottomNav");
  });
});
