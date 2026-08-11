import { describe, expect, it } from "vitest";

import { addProductToCart, getCartItemCount, getCartTotal, updateCartItemQuantity } from "../lib/cart-state";
import { hobeeProducts } from "../lib/hobee-data";

describe("cart state", () => {
  const product = hobeeProducts[0];

  it("adds a product and aggregates quantities by product id", () => {
    const once = addProductToCart([], product);
    const twice = addProductToCart(once, product);

    expect(twice).toHaveLength(1);
    expect(twice[0].quantity).toBe(2);
    expect(getCartItemCount(twice)).toBe(2);
    expect(getCartTotal(twice)).toBe(product.price * 2);
  });

  it("caps quantity at stock and removes an item when quantity is zero", () => {
    const atStock = updateCartItemQuantity([{ product, quantity: 1 }], product.id, product.stock + 10);
    expect(atStock[0].quantity).toBe(product.stock);
    expect(updateCartItemQuantity(atStock, product.id, 0)).toEqual([]);
  });
});
