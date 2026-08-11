import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { addProductToCart, getCartItemCount, getCartTotal, updateCartItemQuantity, type CartItem } from "@/lib/cart-state";
import type { HobeeProduct } from "@/lib/hobee-data";

const CART_STORAGE_KEY = "hobee.cart.v1";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  hydrated: boolean;
  addProduct: (product: HobeeProduct, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(CART_STORAGE_KEY)
      .then((stored) => {
        if (!stored || !active) return;
        const parsed = JSON.parse(stored) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed.filter((item) => item?.product?.id && item.quantity > 0));
      })
      .catch(() => {
        // A failed local cache must never block shopping; keep the in-memory cart usable.
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((nextItems: CartItem[]) => {
    void AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextItems)).catch(() => {
      // Keep the current session available even if device storage temporarily fails.
    });
  }, []);

  const addProduct = useCallback(
    (product: HobeeProduct, quantity = 1) => {
      setItems((current) => {
        let next = current;
        for (let index = 0; index < Math.max(1, quantity); index += 1) {
          next = addProductToCart(next, product);
        }
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      setItems((current) => {
        const next = updateCartItemQuantity(current, productId, quantity);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    void AsyncStorage.removeItem(CART_STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      hydrated,
      itemCount: getCartItemCount(items),
      subtotal: getCartTotal(items),
      addProduct,
      updateQuantity,
      clearCart,
    }),
    [addProduct, clearCart, hydrated, items, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
