import { useCallback, useEffect, useState } from "react";

import { loadCatalog } from "@/lib/catalog";
import { hobeeProducts, type HobeeProduct } from "@/lib/hobee-data";

export function useCatalog() {
  const [products, setProducts] = useState<HobeeProduct[]>(hobeeProducts);
  const [source, setSource] = useState<"supabase" | "api" | "local">("local");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const next = await loadCatalog();
    setProducts(next.products);
    setSource(next.source);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { products, source, loading, refresh };
}
