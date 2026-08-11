import { supabase } from "@/lib/supabase";

export type HobeeOrder = {
  id: string;
  order_number: string;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total: number;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
};

export type Shipment = {
  id: string;
  provider: string;
  tracking_number: string;
  tracking_url: string | null;
  status: string;
  shipped_at: string | null;
  delivered_at: string | null;
};

const orderFields = "id,order_number,subtotal,shipping_fee,discount_amount,total,currency,status,payment_status,created_at";

export async function listMyOrders(): Promise<HobeeOrder[]> {
  const { data, error } = await supabase.from("orders").select(orderFields).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as HobeeOrder[];
}

export async function getMyOrder(id: string): Promise<HobeeOrder> {
  const { data, error } = await supabase.from("orders").select(orderFields).eq("id", id).single();
  if (error || !data) throw error ?? new Error("ไม่พบคำสั่งซื้อ");
  return data as HobeeOrder;
}

export async function listOrderShipments(orderId: string): Promise<Shipment[]> {
  const { data, error } = await supabase
    .from("shipments")
    .select("id,provider,tracking_number,tracking_url,status,shipped_at,delivered_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Shipment[];
}

export function orderStatusLabel(status: string) {
  return ({ pending: "รอดำเนินการ", confirmed: "ยืนยันคำสั่งซื้อ", processing: "กำลังจัดเตรียม", shipped: "จัดส่งแล้ว", delivered: "ส่งสำเร็จ", cancelled: "ยกเลิก", refunded: "คืนเงินแล้ว" } as Record<string, string>)[status] ?? status;
}

export function paymentStatusLabel(status: string) {
  return ({ pending: "รอชำระเงิน", authorized: "ยืนยันสิทธิ์แล้ว", paid: "ชำระเงินแล้ว", failed: "ชำระเงินไม่สำเร็จ", refunded: "คืนเงินแล้ว" } as Record<string, string>)[status] ?? status;
}
