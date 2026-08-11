import { supabase } from "@/lib/supabase";
import { formatShippingAddress } from "@/lib/address-format";

export { formatShippingAddress } from "@/lib/address-format";

export type ShippingAddress = {
  id: string;
  recipient_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  subdistrict: string | null;
  district: string | null;
  province: string;
  postal_code: string;
  country_code: string;
  is_default: boolean;
};

export async function listShippingAddresses(): Promise<ShippingAddress[]> {
  const { data, error } = await supabase
    .from("addresses")
    .select("id,recipient_name,phone,line1,line2,subdistrict,district,province,postal_code,country_code,is_default")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ShippingAddress[];
}

