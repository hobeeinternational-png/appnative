import type { LocalMenuItem } from "@/lib/province-local";

export type LocalPreorderDraft = { listingId: string; diningMode: "dine_in" | "takeaway"; arrivalTime: string; quantities: Record<string, number> };

export function calculateLocalPreorder(menu: LocalMenuItem[], quantities: Record<string, number>) {
  const lines = menu.map((item) => ({ item, quantity: Math.max(0, quantities[item.id] ?? 0) })).filter((line) => line.quantity > 0);
  const total = lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0);
  return { lines, total };
}

export function localQueuePreviewRef(listingId: string) { return `HB-LOCAL-${listingId.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase()}-PREVIEW`; }
