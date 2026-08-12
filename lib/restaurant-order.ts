import type { RestaurantMenuItem } from "@/lib/restaurant-data";

export type RestaurantOrderSelection = { itemId: string; quantity: number; selectedOptions?: { label: string; extraPrice: number }[] };

export function calculateRestaurantOrder(menu: RestaurantMenuItem[], selections: RestaurantOrderSelection[]) {
  const lines = selections.filter((selection) => selection.quantity > 0).map((selection) => {
    const item = menu.find((entry) => entry.id === selection.itemId);
    if (!item) throw new Error("Menu item not found");
    const optionsTotal = selection.selectedOptions?.reduce((sum, option) => sum + option.extraPrice, 0) ?? 0;
    return { item, quantity: selection.quantity, unitPrice: item.price + optionsTotal, total: (item.price + optionsTotal) * selection.quantity };
  });
  return { lines, total: lines.reduce((sum, line) => sum + line.total, 0) };
}

export function restaurantQueuePreviewRef(restaurantId: string) { return `HB-FOOD-${restaurantId.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase()}-PREVIEW`; }
