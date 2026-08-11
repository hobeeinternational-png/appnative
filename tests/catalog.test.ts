import { describe, expect, it } from "vitest";

import { mapRemoteProduct } from "../lib/catalog-map";

describe("catalog mapping", () => {
  it("maps a valid remote product to the native product shape", () => {
    const product = mapRemoteProduct(
      {
        id: "remote-honey-1",
        name: "น้ำผึ้งจาก API",
        price: 420,
        images: ["https://example.com/honey.png"],
        stock: 8,
        rating: 4.7,
      },
      0,
    );

    expect(product).toMatchObject({
      id: "remote-honey-1",
      name: "น้ำผึ้งจาก API",
      price: 420,
      image: "https://example.com/honey.png",
      stock: 8,
    });
  });

  it("rejects a remote payload without the minimum orderable fields", () => {
    expect(mapRemoteProduct({ id: "missing-price", name: "Incomplete" }, 0)).toBeNull();
  });
});
