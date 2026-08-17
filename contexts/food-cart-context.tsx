import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type FoodCartEntry = { restaurantId: string; itemId: string; quantity: number; optionIds: string[]; note?: string };
type FoodCartContextValue = { entries: FoodCartEntry[]; hydrated: boolean; restaurantId?: string; itemCount: number; addSelections: (restaurantId: string, lines: FoodCartEntry[]) => void; updateQuantity: (itemId: string, quantity: number) => void; remove: (itemId: string) => void; clear: () => void };
const FOOD_CART_KEY = "hobee.food-cart.v1";
const FoodCartContext = createContext<FoodCartContextValue | null>(null);

export function FoodCartProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<FoodCartEntry[]>([]); const [hydrated, setHydrated] = useState(false);
  useEffect(() => { let mounted = true; AsyncStorage.getItem(FOOD_CART_KEY).then((value) => { if (mounted && value) { try { setEntries(JSON.parse(value) as FoodCartEntry[]); } catch { setEntries([]); } } }).finally(() => { if (mounted) setHydrated(true); }); return () => { mounted = false; }; }, []);
  useEffect(() => { if (hydrated) void AsyncStorage.setItem(FOOD_CART_KEY, JSON.stringify(entries)); }, [entries, hydrated]);
  const value = useMemo<FoodCartContextValue>(() => ({ entries, hydrated, restaurantId: entries[0]?.restaurantId, itemCount: entries.reduce((sum, entry) => sum + entry.quantity, 0), addSelections: (restaurantId, lines) => setEntries((current) => { const base = current.length && current[0].restaurantId !== restaurantId ? [] : current; const next = [...base]; lines.filter((line) => line.quantity > 0).forEach((line) => { const index = next.findIndex((entry) => entry.itemId === line.itemId && entry.optionIds.join("|") === line.optionIds.join("|")); if (index >= 0) next[index] = { ...next[index], quantity: next[index].quantity + line.quantity }; else next.push(line); }); return next; }), updateQuantity: (itemId, quantity) => setEntries((current) => current.flatMap((entry) => entry.itemId === itemId ? quantity > 0 ? [{ ...entry, quantity }] : [] : [entry])), remove: (itemId) => setEntries((current) => current.filter((entry) => entry.itemId !== itemId)), clear: () => setEntries([]) }), [entries, hydrated]);
  return <FoodCartContext.Provider value={value}>{children}</FoodCartContext.Provider>;
}
export function useFoodCart() { const context = useContext(FoodCartContext); if (!context) throw new Error("useFoodCart must be used within FoodCartProvider"); return context; }
