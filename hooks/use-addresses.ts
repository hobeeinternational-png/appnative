import { useCallback, useEffect, useState } from "react";

import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { listShippingAddresses, type ShippingAddress } from "@/lib/addresses";

export function useAddresses() {
  const { user } = useSupabaseAuth();
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setAddresses(await listShippingAddresses());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ไม่สามารถอ่านที่อยู่ได้");
    } finally {
      setLoading(false);
    }
  }, [user]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return { addresses, loading, error, refresh };
}

