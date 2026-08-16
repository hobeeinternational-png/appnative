import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import { LOCAL_STORE_FAVORITES_KEY, LOCAL_STORE_RECENTLY_VIEWED_KEY, type LocalStoreFavoriteRecord, type LocalStoreRecentRecord } from "@/lib/local-store-storage";

export function useLocalStorePreferences() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { let active = true; Promise.all([AsyncStorage.getItem(LOCAL_STORE_FAVORITES_KEY), AsyncStorage.getItem(LOCAL_STORE_RECENTLY_VIEWED_KEY)]).then(([favorites, recent]) => { if (!active) return; const favoriteRecords = parseRecords<LocalStoreFavoriteRecord>(favorites); const recentRecords = parseRecords<LocalStoreRecentRecord>(recent); setFavoriteIds(favoriteRecords.map((record) => record.storeId)); setRecentIds(recentRecords.map((record) => record.storeId)); }).catch(() => {}).finally(() => { if (active) setHydrated(true); }); return () => { active = false; }; }, []);
  const toggleFavorite = useCallback((storeId: string) => setFavoriteIds((current) => { const next = current.includes(storeId) ? current.filter((id) => id !== storeId) : [storeId, ...current]; void AsyncStorage.setItem(LOCAL_STORE_FAVORITES_KEY, JSON.stringify(next.map((id) => ({ storeId: id, savedAt: new Date().toISOString() })))); return next; }), []);
  const recordViewed = useCallback((storeId: string) => setRecentIds((current) => { const next = [storeId, ...current.filter((id) => id !== storeId)].slice(0, 12); void AsyncStorage.setItem(LOCAL_STORE_RECENTLY_VIEWED_KEY, JSON.stringify(next.map((id) => ({ storeId: id, viewedAt: new Date().toISOString() })))); return next; }), []);
  return { favoriteIds, recentIds, hydrated, toggleFavorite, recordViewed };
}
function parseRecords<T>(raw: string | null): T[] { if (!raw) return []; try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
