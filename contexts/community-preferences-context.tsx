import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

type CommunityPreferences = { savedIds: string[]; recentSearches: string[]; followingIds: string[]; hydrated: boolean; toggleSaved: (id: string) => void; toggleFollowing: (id: string) => void; addRecentSearch: (query: string) => void; clearRecentSearches: () => void };
const STORAGE_KEY = "hobee.community.preferences.v1";
const CommunityPreferencesContext = createContext<CommunityPreferences | null>(null);

export function CommunityPreferencesProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]); const [recentSearches, setRecentSearches] = useState<string[]>([]); const [followingIds, setFollowingIds] = useState<string[]>([]); const [hydrated, setHydrated] = useState(false);
  useEffect(() => { void AsyncStorage.getItem(STORAGE_KEY).then((value) => { if (!value) return; try { const parsed = JSON.parse(value) as Partial<Pick<CommunityPreferences, "savedIds" | "recentSearches" | "followingIds">>; setSavedIds(Array.isArray(parsed.savedIds) ? parsed.savedIds : []); setRecentSearches(Array.isArray(parsed.recentSearches) ? parsed.recentSearches : []); setFollowingIds(Array.isArray(parsed.followingIds) ? parsed.followingIds : []); } catch { /* preserve empty local state if an older value cannot parse */ } }).finally(() => setHydrated(true)); }, []);
  useEffect(() => { if (!hydrated) return; void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ savedIds, recentSearches, followingIds })); }, [followingIds, hydrated, recentSearches, savedIds]);
  const toggleSaved = useCallback((id: string) => setSavedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]), []);
  const toggleFollowing = useCallback((id: string) => setFollowingIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]), []);
  const addRecentSearch = useCallback((query: string) => { const normalized = query.trim(); if (!normalized) return; setRecentSearches((current) => [normalized, ...current.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 8)); }, []);
  const clearRecentSearches = useCallback(() => setRecentSearches([]), []);
  const value = useMemo(() => ({ savedIds, recentSearches, followingIds, hydrated, toggleSaved, toggleFollowing, addRecentSearch, clearRecentSearches }), [addRecentSearch, clearRecentSearches, followingIds, hydrated, recentSearches, savedIds, toggleFollowing, toggleSaved]);
  return <CommunityPreferencesContext.Provider value={value}>{children}</CommunityPreferencesContext.Provider>;
}
export function useCommunityPreferences() { const value = useContext(CommunityPreferencesContext); if (!value) throw new Error("useCommunityPreferences must be used within CommunityPreferencesProvider"); return value; }
