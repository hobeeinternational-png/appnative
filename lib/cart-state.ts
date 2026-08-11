import type { HobeeProduct } from "@/lib/hobee-data";

export type CartItem = {
  product: HobeeProduct;
  quantity: number;
};

export function addProductToCart(items: CartItem[], product: HobeeProduct): CartItem[] {
  const existingItem = items.find((item) => item.product.id === product.id);
  if (!existingItem) return [...items, { product, quantity: 1 }];

  return items.map((item) =>
    item.product.id === product.id
      ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
      : item,
  );
}

export function updateCartItemQuantity(items: CartItem[], productId: string, quantity: number): CartItem[] {
  if (quantity <= 0) return items.filter((item) => item.product.id !== productId);

  return items.map((item) =>
    item.product.id === productId
      ? { ...item, quantity: Math.min(Math.max(1, quantity), item.product.stock) }
      : item,
  );
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
}

