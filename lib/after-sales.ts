import { supabase } from "@/lib/supabase";

export type OrderItemForAfterSales = {
  id: string;
  product_id: string;
  shop_id: string;
  product_name: string;
  sku: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type AfterSalesCase = {
  id: string;
  case_number: string;
  order_id: string;
  order_item_id: string | null;
  shop_id: string;
  case_type: string;
  description: string;
  requested_resolution: string;
  status: string;
  priority: string;
  decision_note: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
};

export type AfterSalesCaseDetail = AfterSalesCase & {
  events: Array<{ id: string; event_type: string; description: string | null; created_at: string }>;
  messages: Array<{ id: string; visibility: string; body: string; created_at: string }>;
  evidence: Array<{ id: string; storage_path: string; media_type: string; file_name: string; note: string | null; created_at: string }>;
  refund: { id: string; status: string; amount: number; currency: string; refund_method: string | null; requested_at: string; approved_at: string | null; completed_at: string | null } | null;
  returnShipment: { id: string; carrier: string | null; tracking_number: string | null; tracking_url: string | null; status: string; shipped_at: string | null; received_at: string | null } | null;
  replacementShipment: { id: string; provider: string | null; tracking_number: string | null; tracking_url: string | null; status: string; shipped_at: string | null; delivered_at: string | null; received_at: string | null } | null;
};

export async function listOrderItemsForAfterSales(orderId: string) {
  const { data, error } = await supabase
    .from("order_items")
    .select("id,product_id,shop_id,product_name,sku,unit_price,quantity,line_total")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as OrderItemForAfterSales[];
}

export async function confirmOrderReceived(orderId: string) {
  const { data, error } = await supabase.rpc("confirm_my_hobee_order_received" as never, { p_order_id: orderId } as never);
  if (error) throw error;
  return data as string;
}

export async function submitAfterSalesCase(input: {
  orderId: string;
  orderItemId: string;
  caseType: string;
  description: string;
  requestedResolution: string;
  reasonCode?: string;
}) {
  const { data, error } = await supabase.rpc("submit_my_after_sales_case" as never, {
    p_order_id: input.orderId,
    p_order_item_id: input.orderItemId,
    p_case_type: input.caseType,
    p_description: input.description,
    p_requested_resolution: input.requestedResolution,
    p_reason_code: input.reasonCode ?? null,
  } as never);
  if (error) throw error;
  return data as string;
}

export async function listMyAfterSalesCases() {
  const { data, error } = await supabase
    .from("after_sales_cases")
    .select("id,case_number,order_id,order_item_id,shop_id,case_type,description,requested_resolution,status,priority,decision_note,created_at,updated_at,resolved_at,closed_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AfterSalesCase[];
}

export async function getMyAfterSalesCase(caseId: string): Promise<AfterSalesCaseDetail> {
  const [caseResult, eventsResult, messagesResult, evidenceResult, refundsResult, returnsResult, replacementsResult] = await Promise.all([
    supabase.from("after_sales_cases").select("id,case_number,order_id,order_item_id,shop_id,case_type,description,requested_resolution,status,priority,decision_note,created_at,updated_at,resolved_at,closed_at").eq("id", caseId).single(),
    supabase.from("after_sales_case_events").select("id,event_type,description,created_at").eq("case_id", caseId).order("created_at", { ascending: true }),
    supabase.from("after_sales_case_messages").select("id,visibility,body,created_at").eq("case_id", caseId).order("created_at", { ascending: true }),
    supabase.from("after_sales_evidence").select("id,storage_path,media_type,file_name,note,created_at").eq("case_id", caseId).order("created_at", { ascending: true }),
    supabase.from("after_sales_refunds").select("id,status,amount,currency,refund_method,requested_at,approved_at,completed_at").eq("case_id", caseId).order("created_at", { ascending: false }).limit(1),
    supabase.from("return_shipments").select("id,carrier,tracking_number,tracking_url,status,shipped_at,received_at").eq("case_id", caseId).maybeSingle(),
    supabase.from("replacement_shipments").select("id,provider,tracking_number,tracking_url,status,shipped_at,delivered_at,received_at").eq("case_id", caseId).maybeSingle(),
  ]);
  const firstError = [caseResult.error, eventsResult.error, messagesResult.error, evidenceResult.error, refundsResult.error, returnsResult.error, replacementsResult.error].find(Boolean);
  if (firstError || !caseResult.data) throw firstError ?? new Error("ไม่พบคำร้อง");
  return {
    ...(caseResult.data as AfterSalesCase),
    events: (eventsResult.data ?? []) as AfterSalesCaseDetail["events"],
    messages: (messagesResult.data ?? []) as AfterSalesCaseDetail["messages"],
    evidence: (evidenceResult.data ?? []) as AfterSalesCaseDetail["evidence"],
    refund: (refundsResult.data?.[0] ?? null) as AfterSalesCaseDetail["refund"],
    returnShipment: (returnsResult.data ?? null) as AfterSalesCaseDetail["returnShipment"],
    replacementShipment: (replacementsResult.data ?? null) as AfterSalesCaseDetail["replacementShipment"],
  };
}

export async function addAfterSalesMessage(caseId: string, body: string) {
  const { data, error } = await supabase.rpc("add_my_after_sales_message" as never, { p_case_id: caseId, p_body: body, p_visibility: "customer" } as never);
  if (error) throw error;
  return data as string;
}

export async function submitReturnTracking(input: { caseId: string; carrier: string; trackingNumber: string; trackingUrl?: string }) {
  const { data, error } = await supabase.rpc("submit_my_return_tracking" as never, {
    p_case_id: input.caseId,
    p_carrier: input.carrier,
    p_tracking_number: input.trackingNumber,
    p_tracking_url: input.trackingUrl ?? null,
    p_receipt_storage_path: null,
  } as never);
  if (error) throw error;
  return data as string;
}

export async function uploadAfterSalesEvidence(input: { caseId: string; uri: string; mediaType: "image" | "video" | "file"; fileName: string; mimeType?: string | null; fileSizeBytes?: number | null; note?: string }) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw authError ?? new Error("กรุณาเข้าสู่ระบบก่อนอัปโหลดหลักฐาน");
  const suffix = input.fileName.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "bin";
  const path = `${authData.user.id}/${input.caseId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${suffix}`;
  const response = await fetch(input.uri);
  const file = await response.arrayBuffer();
  const { error: uploadError } = await supabase.storage.from("after-sales-evidence").upload(path, file, { contentType: input.mimeType ?? undefined, upsert: false });
  if (uploadError) throw uploadError;
  const { data, error } = await supabase.rpc("attach_my_after_sales_evidence" as never, { p_case_id: input.caseId, p_storage_path: path, p_media_type: input.mediaType, p_file_name: input.fileName, p_file_size_bytes: input.fileSizeBytes ?? null, p_note: input.note ?? null } as never);
  if (error) throw error;
  return data as string;
}

export async function cancelMyPendingOrder(orderId: string, reason: string) {
  const { error } = await supabase.rpc("cancel_my_pending_order" as never, { p_order_id: orderId, p_reason: reason } as never);
  if (error) throw error;
}

export async function listManageableAfterSalesCases(status?: string) {
  let query = supabase.from("after_sales_cases").select("id,case_number,user_id,order_id,order_item_id,shop_id,case_type,description,requested_resolution,status,priority,decision_note,created_at,updated_at,resolved_at,closed_at").order("updated_at", { ascending: false });
  if (status && status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AfterSalesCase[];
}

export async function reviewAfterSalesCase(caseId: string, nextStatus: string, note?: string) {
  const { error } = await supabase.rpc("review_my_after_sales_case" as never, { p_case_id: caseId, p_next_status: nextStatus, p_decision_note: note ?? null } as never);
  if (error) throw error;
}
