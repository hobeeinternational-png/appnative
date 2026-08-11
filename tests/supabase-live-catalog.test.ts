import { describe, expect, it } from "vitest";

describe("Supabase live catalogue", () => {
  it("returns the published HOBEE products through the RLS-protected public endpoint", async () => {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
    const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const response = await fetch(`${url}/rest/v1/products?status=eq.published&select=slug,name,price&order=created_at.desc&limit=10`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });

    expect(response.ok).toBe(true);
    const products = (await response.json()) as Array<{ slug: string; name: string; price: string }>;
    expect(products.length).toBeGreaterThanOrEqual(4);
    expect(products.some((product) => product.slug === "hobee-itama-stingless-bee-honey-700g")).toBe(true);
  });
});
