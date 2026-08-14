export type CustomerJourneyInput = {
  orderStatus: string;
  paymentStatus: string;
  customerReceivedAt: string | null;
  shipmentStatuses: string[];
  hasOpenCase: boolean;
};

export type CustomerOrderAction =
  | "pay"
  | "cancel"
  | "track"
  | "confirm_received"
  | "review"
  | "buy_again"
  | "get_help";

const openCaseStatuses = new Set(["draft", "submitted", "under_review", "need_more_info", "approved", "in_progress"]);

export function hasOpenAfterSalesCase(statuses: string[]) {
  return statuses.some((status) => openCaseStatuses.has(status));
}

export function resolveCustomerLifecycle(input: CustomerJourneyInput) {
  if (input.orderStatus === "cancelled") return "cancelled" as const;
  if (input.orderStatus === "refunded" || input.paymentStatus === "refunded") return "refunded" as const;
  if (input.customerReceivedAt) return "completed" as const;
  if (input.shipmentStatuses.includes("delivered")) return "delivered" as const;
  if (input.shipmentStatuses.includes("out_for_delivery")) return "out_for_delivery" as const;
  if (input.shipmentStatuses.includes("in_transit")) return "in_transit" as const;
  if (input.orderStatus === "shipped") return "shipped" as const;
  if (input.orderStatus === "processing") return "processing" as const;
  if (input.paymentStatus === "pending") return "awaiting_payment" as const;
  if (input.paymentStatus === "paid") return "paid" as const;
  return "pending" as const;
}

export function customerLifecycleLabel(lifecycle: ReturnType<typeof resolveCustomerLifecycle>) {
  return ({
    pending: "รอดำเนินการ",
    awaiting_payment: "รอชำระเงิน",
    paid: "ชำระเงินแล้ว",
    processing: "กำลังจัดเตรียม",
    shipped: "จัดส่งแล้ว",
    in_transit: "อยู่ระหว่างขนส่ง",
    out_for_delivery: "กำลังนำส่ง",
    delivered: "จัดส่งสำเร็จ",
    completed: "ได้รับสินค้าแล้ว",
    cancelled: "ยกเลิกแล้ว",
    refunded: "คืนเงินแล้ว",
  } as const)[lifecycle];
}

export function getCustomerOrderActions(input: CustomerJourneyInput): CustomerOrderAction[] {
  const lifecycle = resolveCustomerLifecycle(input);
  if (lifecycle === "awaiting_payment") return ["pay", "cancel", "get_help"];
  if (lifecycle === "pending") return ["cancel", "get_help"];
  if (["shipped", "in_transit", "out_for_delivery"].includes(lifecycle)) return ["track", "get_help"];
  if (lifecycle === "delivered") return ["confirm_received", "get_help"];
  if (lifecycle === "completed") return ["review", "buy_again", "get_help"];
  if (lifecycle === "cancelled" || lifecycle === "refunded") return ["get_help"];
  return ["get_help"];
}

export function canAutoCompleteOrder(input: CustomerJourneyInput, policyEnabled: boolean) {
  return policyEnabled && !input.hasOpenCase && !input.customerReceivedAt && input.shipmentStatuses.includes("delivered");
}

export function canAllocateRefund(input: { paidAmount: number; reservedRefundAmount: number; requestedAmount: number }) {
  return input.requestedAmount > 0 && input.requestedAmount <= Math.max(0, input.paidAmount - input.reservedRefundAmount);
}

export function shipmentTimelineLabel(status: string) {
  return ({
    label_created: "รับข้อมูลพัสดุ",
    pickup_scheduled: "เข้ารับสินค้า",
    in_transit: "อยู่ระหว่างขนส่ง",
    out_for_delivery: "กำลังนำส่ง",
    delivered: "จัดส่งสำเร็จ",
    failed: "จัดส่งไม่สำเร็จ",
    returned: "ตีกลับผู้ส่ง",
  } as Record<string, string>)[status] ?? status;
}

export function buildBuyAgainPlan<T extends { id: string; price: number; stock: number }>(
  orderItems: Array<{ product_id: string; product_name: string; quantity: number }>,
  products: T[],
) {
  return orderItems.map((item) => {
    const product = products.find((candidate) => candidate.id === item.product_id);
    if (!product) return { ...item, product: null, quantityToAdd: 0, unavailableReason: "สินค้านี้ไม่ได้วางจำหน่ายแล้ว" };
    if (product.stock <= 0) return { ...item, product, quantityToAdd: 0, unavailableReason: "สินค้าหมดชั่วคราว" };
    return { ...item, product, quantityToAdd: Math.min(item.quantity, product.stock), unavailableReason: null };
  });
}
