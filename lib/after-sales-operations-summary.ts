export type AfterSalesSlaState = "normal" | "at_risk" | "breached" | "unconfigured";

export function getAfterSalesSlaState(dueAt: string | null | undefined, now = Date.now()): AfterSalesSlaState {
  if (!dueAt) return "unconfigured";
  const due = new Date(dueAt).getTime();
  if (Number.isNaN(due)) return "unconfigured";
  if (due <= now) return "breached";
  if (due - now <= 4 * 60 * 60 * 1000) return "at_risk";
  return "normal";
}

export function afterSalesQueueRank(input: { priority: string; slaState: AfterSalesSlaState; updatedAt: string }): number {
  const urgency = input.slaState === "breached" ? 50 : input.slaState === "at_risk" ? 40 : input.slaState === "normal" ? 10 : 0;
  const priority = input.priority === "urgent" ? 30 : input.priority === "high" ? 20 : input.priority === "normal" ? 10 : 0;
  const freshness = Math.max(0, Math.floor(new Date(input.updatedAt).getTime() / 86_400_000));
  return urgency + priority + freshness / 1_000_000;
}

export function caseQueueLabel(input: { status: string; requestedResolution: string; refundStatus?: string | null; returnStatus?: string | null; replacementStatus?: string | null }): string {
  if (["requested", "approved", "processing"].includes(input.refundStatus ?? "")) return "รอคืนเงิน";
  if (["return_and_refund"].includes(input.requestedResolution) && !["received", "completed"].includes(input.returnStatus ?? "")) return "รอคืนสินค้า";
  if (["replacement", "reship_missing_item"].includes(input.requestedResolution) && !["delivered", "received"].includes(input.replacementStatus ?? "")) return "รอเปลี่ยนสินค้า";
  const labels: Record<string, string> = { submitted: "เคสใหม่", under_review: "รอตรวจสอบ", need_more_info: "รอข้อมูลเพิ่ม", approved: "กำลังดำเนินการ", in_progress: "กำลังดำเนินการ", resolved: "แก้ไขแล้ว", closed: "ปิดเคสแล้ว", rejected: "ไม่อนุมัติ", cancelled: "ยกเลิก" };
  return labels[input.status] ?? input.status;
}

export function canPostInternalNote(permissionCodes: readonly string[], isPlatformAdmin: boolean): boolean {
  return isPlatformAdmin || permissionCodes.includes("VIEW_INTERNAL_NOTES");
}
