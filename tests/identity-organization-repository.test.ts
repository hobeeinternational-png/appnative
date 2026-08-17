import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { toHobeeIdentityProfile } from "../lib/identity-profile";

const user = (overrides: Record<string, unknown> = {}) => ({
  id: "qa-user-id",
  email: "qa+customer-basic@qa.hobee.invalid",
  phone: null,
  email_confirmed_at: "2026-08-17T00:00:00Z",
  phone_confirmed_at: null,
  user_metadata: { full_name: "Metadata Name" },
  ...overrides,
}); 

const root = resolve(__dirname, "..");

describe("identity and organization repository", () => {
  it("prefers the real profiles row while keeping Auth email and confirmation state", () => {
    const profile = toHobeeIdentityProfile(user() as never, { display_name: "[QA] Customer", avatar_url: "https://example.test/avatar.png", phone: "+66900000000" });
    expect(profile).toEqual({ id: "qa-user-id", displayName: "[QA] Customer", avatarUrl: "https://example.test/avatar.png", email: "qa+customer-basic@qa.hobee.invalid", phone: "+66900000000", accountStatus: "active" });
  });

  it("uses Auth metadata only when a profile row is absent and never invents a phone number", () => {
    const profile = toHobeeIdentityProfile(user({ email_confirmed_at: null }) as never, null);
    expect(profile.displayName).toBe("Metadata Name");
    expect(profile.phone).toBeNull();
    expect(profile.accountStatus).toBe("unconfirmed");
  });

  it("wires Account and My HOBEE through the shared identity repository", () => {
    const account = readFileSync(resolve(root, "app/(tabs)/account.tsx"), "utf8");
    const myHobee = readFileSync(resolve(root, "app/my-hobee/index.tsx"), "utf8");
    expect(account).toContain("loadHobeeIdentityProfile(user)");
    expect(myHobee).toContain("loadMyHobeeIdentityWorkspace(user)");
    expect(myHobee).toContain("workspace.memberships");
  });

  it("clears cached admin data when a real authorization refresh denies access", () => {
    const adminHook = readFileSync(resolve(root, "hooks/use-admin.ts"), "utf8");
    expect(adminHook).toContain("if (!user) { setAllowed(false); setProducts([]); setOrders([]);");
    expect(adminHook).toContain("if (!admin) { setProducts([]); setOrders([]); return; }");
    expect(adminHook).toContain("catch (cause) { setAllowed(false); setProducts([]); setOrders([]);");
  });
});
