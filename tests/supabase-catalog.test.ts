import { describe, expect, it } from "vitest";

import { mapSupabaseProduct } from "../lib/supabase-catalog";

describe("Supabase catalogue mapping", () => {
  it("maps the public product row and respects the lowest image sort order", () => {
    const product = mapSupabaseProduct(
      {
        id: "product-1",
        name: "น้ำผึ้งชันโรง",
        slug: "stingless-bee-honey",
        description: "น้ำผึ้งแท้",
        price: "590.00",
        compare_at_price: "650.00",
        stock_quantity: 12,
        origin: "นราธิวาส",
        rating: "4.8",
        review_count: 19,
        shops: { name: "HOBEE Official" },
        product_categories: { name: "น้ำผึ้ง" },
        product_images: [
          { storage_path: "https://example.com/second.jpg", sort_order: 2 },
          { storage_path: "https://example.com/first.jpg", sort_order: 1 },
        ],
      },
      "https://example.com/fallback.jpg",
    );

    expect(product).toMatchObject({
      id: "product-1",
      price: 590,
      compareAtPrice: 650,
      image: "https://example.com/first.jpg",
      shopName: "HOBEE Official",
      category: "น้ำผึ้ง",
    });
  });
});
