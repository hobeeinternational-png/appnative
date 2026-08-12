import { useCallback, useEffect, useState } from "react";

import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { listFavoriteIds, setFavorite } from "@/lib/loyalty";

export function useFavorites() {
  const { user } = useSupabaseAuth(); const [ids, setIds] = useState<Set<string>>(new Set()); const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => { if (!user) { setIds(new Set()); return; } setLoading(true); try { setIds(await listFavoriteIds(user.id)); } finally { setLoading(false); } }, [user]);
  useEffect(() => { void refresh(); }, [refresh]);
  const toggle = useCallback(async (productId: string) => {
    if (!user) return false;
    const next = !ids.has(productId); await setFavorite(user.id, productId, next); setIds((current) => { const copy = new Set(current); next ? copy.add(productId) : copy.delete(productId); return copy; }); return next;
  }, [ids, user]);
  return { favoriteIds: ids, loading, toggle, refresh, signedIn: Boolean(user) };
}
