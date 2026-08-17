import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");
const seed = readFileSync(resolve(root, "supabase/qa/seed_identity_qa.sql"), "utf8");
const reset = readFileSync(resolve(root, "supabase/qa/reset_identity_qa.sql"), "utf8");
const wiring = readFileSync(resolve(root, "docs/backend-wiring-phase1.md"), "utf8");
const rlsMatrix = readFileSync(resolve(root, "docs/rls-verification-matrix.md"), "utf8");

describe("controlled identity QA seed safety", () => {
  it("requires an explicit session guard and fails before data writes when QA Auth identities are missing", () => {
    expect(seed).toContain("SET LOCAL app.hobee_qa_seed = 'allow'");
    expect(seed).toContain("QA Auth identities missing");
    expect(seed.indexOf("QA Auth identities missing")).toBeLessThan(seed.indexOf("INSERT INTO public.profiles"));
  });

  it("uses disposable QA identifiers and never provisions Auth users or passwords in SQL", () => {
    expect(seed).toContain("@qa.hobee.invalid");
    expect(seed).toContain("[QA]");
    expect(seed).not.toMatch(/insert\s+into\s+auth\.users/i);
    expect(seed).not.toMatch(/password_hash|encrypted_password|bcrypt/i);
  });

  it("upserts the supported identity and organization contracts and includes a suspended membership case", () => {
    for (const table of ["public.profiles", "public.user_roles", "public.user_role_profiles", "public.role_applications", "public.organizations", "public.organization_memberships", "public.organization_member_permissions"]) expect(seed).toContain(table);
    expect(seed).toContain("ON CONFLICT (user_id, role)");
    expect(seed).toContain("ON CONFLICT (organization_id, user_id)");
    expect(seed).toContain("'suspended'");
    expect(seed).toContain("qa-local-store");
    expect(seed).toContain("qa-hotel");
    expect(seed).toContain("qa-tour-company");
  });

  it("keeps reset branch-only and leaves Auth user deletion to branch disposal", () => {
    expect(reset).toContain("Run only against branch islisdlzuadwvxsocozj");
    expect(reset).not.toMatch(/delete\s+from\s+auth\.users/i);
    expect(wiring).toContain("supabase/migrations");
    expect(wiring).toContain("cannot join production migration history");
  });

  it("defines server-side RLS verification for suspended, admin-revoked, and multi-organization personas", () => {
    expect(rlsMatrix).toContain("service-role query does not prove RLS behavior");
    expect(rlsMatrix).toContain("Suspended member");
    expect(rlsMatrix).toContain("Multi-organization switch");
    expect(rlsMatrix).toContain("Revoked admin");
    expect(rlsMatrix).toContain("private.is_platform_admin()");
  });
});
