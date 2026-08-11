import { useCallback, useEffect, useState } from "react";

import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { listMyOrders, type HobeeOrder } from "@/lib/orders";

export function useOrders() {
  const { user } = useSupabaseAuth();
  const [orders, setOrders] = useState<HobeeOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!user) { setOrders([]); return; }
    setLoading(true); setError(null);
    try { setOrders(await listMyOrders()); } catch (cause) { setError(cause instanceof Error ? cause.message : "ไม่สามารถอ่านคำสั่งซื้อได้"); } finally { setLoading(false); }
  }, [user]);
  useEffect(() => { void refresh(); }, [refresh]);
  return { orders, loading, error, refresh };
}

