import { useCallback, useEffect, useState } from "react";

import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { getAdminDashboard, isCurrentUserAdmin, type AdminOrder, type AdminProduct } from "@/lib/admin";

export function useAdmin() {
  const { user } = useSupabaseAuth();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!user) { setAllowed(false); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const admin = await isCurrentUserAdmin(user.id);
      setAllowed(admin);
      if (!admin) return;
      const dashboard = await getAdminDashboard();
      setProducts(dashboard.products); setOrders(dashboard.orders);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "ไม่สามารถโหลดหลังบ้านได้"); } finally { setLoading(false); }
  }, [user]);
  useEffect(() => { void refresh(); }, [refresh]);
  return { allowed, loading, products, orders, error, refresh, user };
}
