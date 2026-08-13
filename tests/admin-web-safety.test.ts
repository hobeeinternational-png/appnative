import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/hobee-mobile";
const imageRoutes = ["app/admin/product/[id].tsx", "app/admin/product/new.tsx", "app/admin/travel/[id].tsx"];

describe("Admin web route safety", () => {
  it("keeps expo image picker behind a dynamic web-safe adapter", () => {
    const picker = readFileSync(`${root}/lib/admin-image-picker.ts`, "utf8");
    expect(picker).toContain('Platform.OS === "web"');
    expect(picker).toContain('await import("expo-image-picker")');
    expect(picker).toContain('document.createElement("input")');
    for (const route of imageRoutes) {
      const source = readFileSync(`${root}/${route}`, "utf8");
      expect(source).toContain('chooseAdminImages');
      expect(source).not.toContain('import * as ImagePicker from "expo-image-picker"');
    }
  });
});
