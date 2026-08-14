import { describe, expect, it } from "vitest";
import { credentialHint, detectAuthIdentifier, isPasswordValid, mapAuthError, normalizeThaiPhone } from "../lib/auth-credentials";

describe("HOBEE password credentials", () => {
  it("detects emails and normalizes Thai phone numbers", () => {
    expect(detectAuthIdentifier("member@hobee.co.th")).toBe("email");
    expect(normalizeThaiPhone("081-234-5678")).toBe("+66812345678");
    expect(detectAuthIdentifier("081 234 5678")).toBe("phone");
    expect(detectAuthIdentifier("not-an-identifier")).toBe("invalid");
  });

  it("describes the detected credential without exposing a password", () => {
    expect(credentialHint("0812345678")).toContain("เบอร์โทรศัพท์");
    expect(credentialHint("member@hobee.co.th")).toContain("อีเมล");
    expect(isPasswordValid("12345")).toBe(false);
    expect(isPasswordValid("123456")).toBe(true);
  });

  it("maps common Supabase authentication failures to Thai UX messages", () => {
    expect(mapAuthError(new Error("Invalid login credentials"))).toContain("ไม่ถูกต้อง");
    expect(mapAuthError(new Error("Email not confirmed"))).toContain("ยืนยันอีเมล");
    expect(mapAuthError(new Error("phone sign in not enabled"))).toContain("เบอร์โทรศัพท์");
  });
});
