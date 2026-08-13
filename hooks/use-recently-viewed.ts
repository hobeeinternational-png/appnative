import { useCallback, useEffect, useState } from "react";

import { getRecentlyViewed, subscribeRecentlyViewed } from "@/lib/recently-viewed";
import type { RecentlyViewedItem } from "@/lib/recently-viewed-data";

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    setItems(await getRecentlyViewed());
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    return subscribeRecentlyViewed((next) => { setItems(next); setLoading(false); });
  }, [refresh]);

  return { items, loading, refresh };
}
