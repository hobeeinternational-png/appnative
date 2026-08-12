import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");

describe("native build configuration", () => {
  it("keeps the HOBEE custom scheme, notification permission and required native plugins", () => {
    const config = readFileSync(resolve(root, "app.config.ts"), "utf8");
    expect(config).toContain('scheme: "manushobeemobile"');
    expect(config).toContain('const rawBundleId = "com.app.hobeemobile"');
    expect(config).toContain("iosBundleId: bundleId");
    expect(config).toContain("androidPackage: bundleId");
    expect(config).toContain('"POST_NOTIFICATIONS"');
    expect(config).toContain('"expo-notifications"');
    expect(config).toContain('"expo-asset"');
    expect(config).toContain('"expo-web-browser"');
  });

  it("keeps internal development profiles for iOS and Android device QA", () => {
    const eas = JSON.parse(readFileSync(resolve(root, "eas.json"), "utf8"));
    expect(eas.build.development.developmentClient).toBe(true);
    expect(eas.build.development.distribution).toBe("internal");
    expect(eas.build.preview.distribution).toBe("internal");
  });
});
