export const LOCAL_STORE_FAVORITES_KEY = "hobee.local-stores.favorites.v1";
export const LOCAL_STORE_RECENTLY_VIEWED_KEY = "hobee.local-stores.recently-viewed.v1";
export const LOCAL_STORE_PREORDER_DRAFT_KEY = "hobee.local-stores.preorder-draft.v1";

export type LocalStoreFavoriteRecord = { storeId: string; savedAt: string };
export type LocalStoreRecentRecord = { storeId: string; viewedAt: string };
export type LocalStoreDraftItem = { menuItemId: string; quantity: number; note?: string };
export type LocalStorePreorderDraft = { storeId: string; items: LocalStoreDraftItem[]; fulfilment?: "pickup" | "delivery"; scheduledAt?: string; note?: string; updatedAt: string };
