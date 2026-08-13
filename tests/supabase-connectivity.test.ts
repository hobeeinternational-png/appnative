import { describe, expect, it } from "vitest";

describe("Supabase connectivity", () => {
  it("authenticates the publishable key against the project Auth endpoint", async () => {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    expect(url).toMatch(/^https:\/\/[a-z0-9-]+\.supabase\.co$/);
    expect(key).toMatch(/^sb_publishable_[A-Za-z0-9_-]+$/);

    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: {
        apikey: key!,
        Authorization: `Bearer ${key!}`,
      },
    });

    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
    expect(response.ok).toBe(true);

    const catalogueResponse = await fetch(`${url}/rest/v1/products?select=id&limit=1`, {
      headers: {
        apikey: key!,
        Authorization: `Bearer ${key!}`,
      },
    });

    expect(catalogueResponse.status).not.toBe(401);
    expect(catalogueResponse.status).not.toBe(403);
    expect(catalogueResponse.ok).toBe(true);
  });
});
