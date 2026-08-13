import { useCallback, useEffect, useState } from "react";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { travelListings as fallbackTravelListings } from "@/lib/travel-data";
import type { TravelListing, TravelRoomType } from "@/lib/travel-types";

export async function fetchPublishedTravelListings(): Promise<TravelListing[]> {
  if (!isSupabaseConfigured) return fallbackTravelListings;
  const { data, error } = await supabase.from("travel_listings").select("*, travel_listing_images(*), travel_room_types(*, travel_room_images(*)), travel_itinerary_days(*), travel_departure_dates(*), travel_add_ons(*)").order("updated_at", { ascending: false }).limit(100);
  if (error) throw error;
  return (data ?? []).map(mapTravelListing);
}

export function useTravelCatalog() {
  const [listings, setListings] = useState<TravelListing[]>(fallbackTravelListings);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [source, setSource] = useState<"supabase" | "fallback">("fallback");
  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) { setListings(fallbackTravelListings); setSource("fallback"); setLoading(false); return; }
    setLoading(true);
    try { const records = await fetchPublishedTravelListings(); setListings(records.length ? records : fallbackTravelListings); setSource(records.length ? "supabase" : "fallback"); }
    catch { setListings(fallbackTravelListings); setSource("fallback"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  return { listings, loading, source, refresh };
}

function mapTravelListing(raw: any): TravelListing {
  const listingImages = Array.isArray(raw.travel_listing_images) ? raw.travel_listing_images : [];
  const rooms = Array.isArray(raw.travel_room_types) ? raw.travel_room_types : [];
  return {
    id: raw.id, slug: raw.slug, listingType: raw.listing_type, provinceId: raw.province_id, provinceName: raw.province_name, title: raw.title, shortDescription: raw.short_description, fullDescription: raw.full_description, location: raw.location,
    coordinates: { lat: Number(raw.latitude), lng: Number(raw.longitude) }, priceFrom: Number(raw.price_from), rating: Number(raw.rating), reviewsCount: Number(raw.reviews_count), images: listingImages.sort(bySortOrder).map(toImageUrl).filter(Boolean),
    propertyType: raw.property_type ?? undefined, roomTypes: rooms.map(mapRoom), itineraryDays: (Array.isArray(raw.travel_itinerary_days) ? raw.travel_itinerary_days : []).sort((left: any, right: any) => Number(left.day_number) - Number(right.day_number)).map((day: any) => ({ day: Number(day.day_number), title: day.title, description: day.description })),
    departureDates: (Array.isArray(raw.travel_departure_dates) ? raw.travel_departure_dates : []).filter((entry: any) => entry.is_available).map((entry: any) => entry.departure_date), tripModes: Array.isArray(raw.trip_modes) ? raw.trip_modes : ["join", "private"],
    addOns: (Array.isArray(raw.travel_add_ons) ? raw.travel_add_ons : []).filter((entry: any) => entry.is_visible && entry.status === "published").map((entry: any) => ({ id: entry.id, title: entry.title, description: entry.description, price: Number(entry.price), icon: entry.icon })),
    operatorName: raw.operator_name, isHalalCertified: Boolean(raw.is_halal_certified), included: Array.isArray(raw.included) ? raw.included : [], excluded: Array.isArray(raw.excluded) ? raw.excluded : [],
  } as TravelListing;
}

function mapRoom(raw: any): TravelRoomType {
  const images = Array.isArray(raw.travel_room_images) ? raw.travel_room_images : [];
  return { id: raw.id, name: raw.name, description: raw.description, pricePerNight: Number(raw.price_per_night), capacityAdults: Number(raw.capacity_adults), capacityChildren: Number(raw.capacity_children), roomSizeSqm: Number(raw.room_size_sqm), bedType: raw.bed_type, amenities: Array.isArray(raw.amenities) ? raw.amenities : [], image: toImageUrl(images.sort(bySortOrder)[0]) || "", availableCount: Number(raw.available_count) };
}

function toImageUrl(raw: any) { if (!raw) return ""; if (raw.external_url) return raw.external_url; return raw.storage_path ? supabase.storage.from("travel-images").getPublicUrl(raw.storage_path).data.publicUrl : ""; }
function bySortOrder(left: any, right: any) { return Number(left.sort_order ?? 0) - Number(right.sort_order ?? 0); }
