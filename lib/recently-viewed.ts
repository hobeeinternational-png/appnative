import AsyncStorage from "@react-native-async-storage/async-storage";

import { mergeRecentView, sanitizeRecentViews, type RecentlyViewedItem } from "@/lib/recently-viewed-data";

export const RECENTLY_VIEWED_STORAGE_KEY = "hobee_recently_viewed_v1";
const listeners = new Set<(items: RecentlyViewedItem[]) => void>();

export async function getRecentlyViewed() {
  try {
    const raw = await AsyncStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    return sanitizeRecentViews(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

export async function recordRecentlyViewed(next: Omit<RecentlyViewedItem, "key" | "viewedAt">) {
  const updated = mergeRecentView(await getRecentlyViewed(), next);
  try { await AsyncStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(updated)); } catch { /* Local history is non-essential. */ }
  listeners.forEach((listener) => listener(updated));
  return updated;
}

export function subscribeRecentlyViewed(listener: (items: RecentlyViewedItem[]) => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
