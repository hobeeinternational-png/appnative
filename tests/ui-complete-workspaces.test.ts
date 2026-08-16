import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { goBackOr } from "../lib/back-navigation";

const root = resolve(__dirname, "..");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("UI COMPLETE FIRST role workspaces", () => {
  it("registers each specialised role hub without a native Stack header", () => {
    const layout = source("app/_layout.tsx");
    for (const route of ["organization", "seller", "hospitality", "creative", "field-service", "employee"]) {
      expect(layout).toContain(`<Stack.Screen name="${route}" options={{ headerShown: false }} />`);
    }
  });

  it("keeps every specialised mobile workspace in a bottom-safe ScreenContainer", () => {
    for (const path of ["app/hospitality/index.tsx", "app/creative/index.tsx", "app/field-service/index.tsx", "app/employee/index.tsx"]) {
      expect(source(path)).toContain('edges={["top", "left", "right", "bottom"]}');
      expect(source(path)).toContain('goBackOr(router, "/my-hobee")');
    }
  });

  it("provides safe fallback destinations for Support and notification detail deep links", () => {
    expect(source("app/support/index.tsx")).toContain('goBackOr(router, "/(tabs)/account")');
    expect(source("app/notification/[id].tsx")).toContain('goBackOr(router, "/my-hobee/notifications")');
    expect(source("app/my-hobee/notifications.tsx")).toContain('router.push(`/notification/${encodeURIComponent(item.id)}`)');
  });

  it("routes supported Admin operations modules to protected presentation workspaces", () => {
    const shell = source("components/admin/admin-portal-ui.tsx");
    const workspace = source("app/admin/workspace/[workspace].tsx");
    expect(shell).toContain('{ key: "organizations", label: "องค์กร & Staff", icon: "domain", enabled: true }');
    for (const module of ["customers", "shipping", "payments", "activity", "settings", "system"]) expect(shell).toContain(`key: "${module}"`);
    expect(workspace).toContain("Presentation mode — จะแสดงข้อมูลเฉพาะเมื่อ data source และสิทธิ์พร้อม");
  });
});

describe("safe back contract", () => {
  it("pops the current navigation history when available", () => {
    const calls: string[] = []; goBackOr({ canGoBack: () => true, back: () => calls.push("back"), replace: () => calls.push("replace") }, "/my-hobee");
    expect(calls).toEqual(["back"]);
  });
  it("replaces to a deterministic fallback when history is unavailable", () => {
    const calls: string[] = []; goBackOr({ canGoBack: () => false, back: () => calls.push("back"), replace: (href: string) => calls.push(href) }, "/my-hobee");
    expect(calls).toEqual(["/my-hobee"]);
  });
});
