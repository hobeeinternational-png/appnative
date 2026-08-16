import type { LocalFulfilment, LocalStoreMenuItem } from "@/lib/local-stores";

export type LocalStorePreorderLine = { menuItemId: string; quantity: number; note?: string };
export type LocalStorePreorderStatus = "PREORDER_CREATED" | "STORE_ACCEPTED" | "PREPARING" | "READY_FOR_PICKUP" | "PICKED_UP" | "OUT_FOR_DELIVERY" | "DELIVERED" | "COMPLETED";
export type LocalStorePreorderPreview = { reference: string; storeId: string; lines: LocalStorePreorderLine[]; fulfilment: LocalFulfilment; scheduledLabel: string; customerName: string; phone: string; note: string; status: LocalStorePreorderStatus; dataMode: "presentation" };

export function calculateLocalStorePreorder(menu: LocalStoreMenuItem[], lines: LocalStorePreorderLine[]) {
  const resolved = lines.map((line) => ({ ...line, item: menu.find((candidate) => candidate.id === line.menuItemId) })).filter((line): line is LocalStorePreorderLine & { item: LocalStoreMenuItem } => Boolean(line.item) && line.quantity > 0);
  const hasPriceBoundary = resolved.some((line) => typeof line.item.price !== "number");
  const subtotal = hasPriceBoundary ? null : resolved.reduce((total, line) => total + (line.item.price ?? 0) * line.quantity, 0);
  return { lines: resolved, subtotal, hasPriceBoundary };
}

export function localStorePreviewReference(storeId: string) { return `HB-LOCAL-${storeId.replace(/[^a-z0-9]/gi, "").slice(-7).toUpperCase()}-PREVIEW`; }
