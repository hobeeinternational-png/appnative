import type { TravelListing } from "@/lib/travel-types";

export type TravelBookingState = "upcoming" | "pending" | "completed" | "cancelled";
export type TravelBookingPresentation = { id: string; listingId: string; state: TravelBookingState; dateLabel: string; travelersLabel: string; paymentLabel: string; operatorLabel: string; dataMode: "presentation" };

export const TRAVEL_BOOKING_PRESENTATIONS: TravelBookingPresentation[] = [
  { id: "travel-preview-upcoming", listingId: "trip-lipe-3d2n", state: "upcoming", dateLabel: "กำหนดวันเมื่อ booking backend พร้อม", travelersLabel: "ผู้เดินทางตามคำขอ", paymentLabel: "รอยืนยันการชำระเงิน", operatorLabel: "HOBEE Andaman Local", dataMode: "presentation" },
  { id: "travel-preview-pending", listingId: "trip-pattani-heritage", state: "pending", dateLabel: "รอผู้ดำเนินการยืนยันวัน", travelersLabel: "ผู้เดินทางตามคำขอ", paymentLabel: "ยังไม่สร้าง payment intent", operatorLabel: "Pattani Local Collective", dataMode: "presentation" },
  { id: "travel-preview-completed", listingId: "stay-betong-garden", state: "completed", dateLabel: "ตัวอย่างทริปที่เสร็จแล้ว", travelersLabel: "ข้อมูลถูกซ่อนใน presentation", paymentLabel: "สถานะจริงต้องมาจาก server", operatorLabel: "Betong Community Stay", dataMode: "presentation" },
];

export function travelBookingStateLabel(state: TravelBookingState) { return state === "upcoming" ? "กำลังจะไป" : state === "pending" ? "รอยืนยัน" : state === "completed" ? "เสร็จแล้ว" : "ยกเลิก"; }
export function resolveTravelBooking(bookingId: string, listings: TravelListing[]) { const booking = TRAVEL_BOOKING_PRESENTATIONS.find((entry) => entry.id === bookingId); if (!booking) return undefined; const listing = listings.find((entry) => entry.id === booking.listingId); return listing ? { booking, listing } : undefined; }
