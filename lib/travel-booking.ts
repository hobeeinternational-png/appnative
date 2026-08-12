import type { TravelAddOn, TravelBookingDraft, TravelListing } from "@/lib/travel-types";

export function calculateTravelBooking(listing: TravelListing, draft: TravelBookingDraft) {
  const room = listing.roomTypes?.find((entry) => entry.id === draft.roomTypeId);
  const unitPrice = room?.pricePerNight ?? listing.priceFrom;
  const nights = listing.listingType === "accommodation" ? Math.max(1, daysBetween(draft.checkIn, draft.checkOut)) : 1;
  const baseAmount = unitPrice * (listing.listingType === "accommodation" ? draft.rooms * nights : draft.adults + draft.children * 0.7);
  const addOns = listing.addOns.filter((addOn) => draft.addOnIds.includes(addOn.id));
  const addOnAmount = addOns.reduce((sum, addOn) => sum + addOn.price, 0);
  const totalAmount = Math.round(baseAmount + addOnAmount);
  const depositAmount = draft.paymentPlan === "deposit" ? Math.round(totalAmount * 0.4) : totalAmount;
  return { unitPrice, nights, baseAmount: Math.round(baseAmount), addOns, addOnAmount, totalAmount, depositAmount, remainingAmount: totalAmount - depositAmount };
}

export function daysBetween(checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(`${checkIn}T00:00:00`).getTime();
  const end = new Date(`${checkOut}T00:00:00`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 1;
  return Math.max(1, Math.round((end - start) / 86_400_000));
}

export function previewBookingRef(listingId: string) {
  const suffix = listingId.replace(/[^a-z0-9]/gi, "").slice(-5).toUpperCase();
  return `HB-TRAVEL-${suffix}-PREVIEW`;
}

export function formatTravelMoney(value: number) { return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(value); }

export type SelectedAddOn = TravelAddOn;
