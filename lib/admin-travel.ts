import { supabase } from "@/lib/supabase";
import type { AdminImageCandidate } from "@/lib/admin";

export const TRAVEL_IMAGE_BUCKET = "travel-images";
export type AdminContentStatus = "draft" | "published" | "archived";
export type AdminTravelListingType = "trip" | "accommodation";
export type AdminTravelImage = { id: string; storage_path: string | null; external_url: string | null; alt_text: string | null; sort_order: number; url: string };
export type AdminTravelRoom = { id: string; listing_id: string; name: string; description: string; price_per_night: number; capacity_adults: number; capacity_children: number; room_size_sqm: number; bed_type: string; amenities: string[]; available_count: number; status: AdminContentStatus; is_visible: boolean; images: AdminTravelImage[] };
export type AdminTravelListing = { id: string; slug: string; listing_type: AdminTravelListingType; province_id: "satun" | "yala" | "pattani" | "songkhla" | "narathiwat"; province_name: string; title: string; short_description: string; full_description: string; location: string; latitude: number; longitude: number; price_from: number; rating: number; reviews_count: number; property_type: string | null; operator_name: string; is_halal_certified: boolean; included: string[]; excluded: string[]; trip_modes: ("join" | "private")[]; status: AdminContentStatus; is_visible: boolean; images: AdminTravelImage[]; rooms: AdminTravelRoom[] };
export type AdminTravelListingInput = Omit<AdminTravelListing, "id" | "images" | "rooms">;
export type AdminTravelRoomInput = Omit<AdminTravelRoom, "id" | "images">;

export async function getAdminTravelListings(): Promise<AdminTravelListing[]> {
  const { data, error } = await supabase.from("travel_listings").select("*, travel_listing_images(*), travel_room_types(*, travel_room_images(*))").order("updated_at", { ascending: false }).limit(200);
  if (error) throw error;
  return (data ?? []).map(mapListing);
}

export async function getAdminTravelListing(id: string): Promise<AdminTravelListing> {
  const { data, error } = await supabase.from("travel_listings").select("*, travel_listing_images(*), travel_room_types(*, travel_room_images(*))").eq("id", id).single();
  if (error || !data) throw error ?? new Error("ไม่พบข้อมูลทริปหรือที่พัก");
  return mapListing(data);
}

export async function createAdminTravelListing(input: Omit<AdminTravelListingInput, "id">) {
  validateListing(input);
  const { data, error } = await supabase.from("travel_listings").insert(toListingRow(input)).select("id").single();
  if (error || !data) throw error ?? new Error("สร้างรายการทริปหรือที่พักไม่สำเร็จ");
  return data as { id: string };
}

export async function updateAdminTravelListing(id: string, input: Partial<AdminTravelListingInput>) {
  if (input.title !== undefined && input.title.trim().length < 2) throw new Error("ชื่อรายการต้องมีอย่างน้อย 2 ตัวอักษร");
  if (input.price_from !== undefined && (!Number.isFinite(input.price_from) || input.price_from < 0)) throw new Error("ราคาเริ่มต้นต้องเป็น 0 หรือมากกว่า");
  const { error } = await supabase.from("travel_listings").update(toListingRow(input)).eq("id", id);
  if (error) throw error;
}

export async function deleteAdminTravelListing(id: string) {
  const listing = await getAdminTravelListing(id);
  const storagePaths = [
    ...listing.images.map((image) => image.storage_path),
    ...listing.rooms.flatMap((room) => room.images.map((image) => image.storage_path)),
  ].filter((path): path is string => Boolean(path));
  const { error } = await supabase.from("travel_listings").delete().eq("id", id);
  if (error) throw error;
  if (storagePaths.length) await supabase.storage.from(TRAVEL_IMAGE_BUCKET).remove(storagePaths);
}

export async function createAdminTravelRoom(input: AdminTravelRoomInput) {
  validateRoom(input);
  const { data, error } = await supabase.from("travel_room_types").insert(toRoomRow(input)).select("id").single();
  if (error || !data) throw error ?? new Error("สร้างประเภทห้องพักไม่สำเร็จ");
  return data as { id: string };
}

export async function updateAdminTravelRoom(id: string, input: Partial<AdminTravelRoomInput>) {
  if (input.name !== undefined && input.name.trim().length < 2) throw new Error("ชื่อห้องพักต้องมีอย่างน้อย 2 ตัวอักษร");
  const { error } = await supabase.from("travel_room_types").update(toRoomRow(input)).eq("id", id);
  if (error) throw error;
}

export async function deleteAdminTravelRoom(id: string) {
  const { data, error } = await supabase.from("travel_room_images").select("storage_path").eq("room_type_id", id);
  if (error) throw error;
  const { error: deleteError } = await supabase.from("travel_room_types").delete().eq("id", id);
  if (deleteError) throw deleteError;
  const storagePaths = (data ?? []).map((image) => image.storage_path).filter((path): path is string => Boolean(path));
  if (storagePaths.length) await supabase.storage.from(TRAVEL_IMAGE_BUCKET).remove(storagePaths);
}

export async function uploadAdminTravelListingImages(listingId: string, candidates: AdminImageCandidate[], defaultAltText: string) {
  validateImages(candidates, "ทริปหรือที่พัก");
  const current = await getAdminTravelListing(listingId);
  if (current.images.length + candidates.length > 5) throw new Error("ทริปหรือที่พักแต่ละรายการมีรูปภาพได้สูงสุด 5 รูป");
  const records = [] as { listing_id: string; storage_path: string; alt_text: string | null; sort_order: number }[];
  for (const [index, candidate] of candidates.entries()) records.push({ listing_id: listingId, storage_path: await uploadTravelImage(`listings/${listingId}`, candidate, index), alt_text: candidate.altText ?? defaultAltText, sort_order: current.images.length + index });
  if (records.length) {
    const { error } = await supabase.from("travel_listing_images").insert(records);
    if (error) throw error;
  }
}

export async function uploadAdminTravelRoomImages(roomId: string, candidates: AdminImageCandidate[], defaultAltText: string) {
  validateImages(candidates, "ห้องพัก");
  const { data, error } = await supabase.from("travel_room_images").select("id").eq("room_type_id", roomId).limit(6);
  if (error) throw error;
  if ((data?.length ?? 0) + candidates.length > 5) throw new Error("ห้องพักแต่ละประเภทมีรูปภาพได้สูงสุด 5 รูป");
  const records = [] as { room_type_id: string; storage_path: string; alt_text: string | null; sort_order: number }[];
  for (const [index, candidate] of candidates.entries()) records.push({ room_type_id: roomId, storage_path: await uploadTravelImage(`rooms/${roomId}`, candidate, index), alt_text: candidate.altText ?? defaultAltText, sort_order: (data?.length ?? 0) + index });
  if (records.length) {
    const { error: insertError } = await supabase.from("travel_room_images").insert(records);
    if (insertError) throw insertError;
  }
}

export async function replaceAdminTravelImage(image: AdminTravelImage, folder: string, candidate: AdminImageCandidate, altText: string, table: "travel_listing_images" | "travel_room_images") {
  validateImages([candidate], "รายการ");
  const storagePath = await uploadTravelImage(folder, candidate, image.sort_order);
  const { error } = await supabase.from(table).update({ storage_path: storagePath, external_url: null, alt_text: candidate.altText ?? altText }).eq("id", image.id);
  if (error) throw error;
  if (image.storage_path) await supabase.storage.from(TRAVEL_IMAGE_BUCKET).remove([image.storage_path]);
}

export async function deleteAdminTravelImage(image: AdminTravelImage, table: "travel_listing_images" | "travel_room_images") {
  const { error } = await supabase.from(table).delete().eq("id", image.id);
  if (error) throw error;
  if (image.storage_path) await supabase.storage.from(TRAVEL_IMAGE_BUCKET).remove([image.storage_path]);
}

function mapListing(raw: any): AdminTravelListing {
  const listingImages = Array.isArray(raw.travel_listing_images) ? raw.travel_listing_images : [];
  const rooms = Array.isArray(raw.travel_room_types) ? raw.travel_room_types : [];
  return {
    ...raw,
    latitude: Number(raw.latitude), longitude: Number(raw.longitude), price_from: Number(raw.price_from), rating: Number(raw.rating), reviews_count: Number(raw.reviews_count),
    included: Array.isArray(raw.included) ? raw.included : [], excluded: Array.isArray(raw.excluded) ? raw.excluded : [], trip_modes: Array.isArray(raw.trip_modes) ? raw.trip_modes : ["join", "private"],
    images: listingImages.sort(sortImages).map(mapImage),
    rooms: rooms.map((room: any) => ({ ...room, price_per_night: Number(room.price_per_night), room_size_sqm: Number(room.room_size_sqm), amenities: Array.isArray(room.amenities) ? room.amenities : [], images: (Array.isArray(room.travel_room_images) ? room.travel_room_images : []).sort(sortImages).map(mapImage) })),
  } as AdminTravelListing;
}

function mapImage(raw: any): AdminTravelImage {
  const url = raw.external_url || (raw.storage_path ? supabase.storage.from(TRAVEL_IMAGE_BUCKET).getPublicUrl(raw.storage_path).data.publicUrl : "");
  return { id: raw.id, storage_path: raw.storage_path ?? null, external_url: raw.external_url ?? null, alt_text: raw.alt_text ?? null, sort_order: Number(raw.sort_order ?? 0), url };
}

function sortImages(left: any, right: any) { return Number(left.sort_order ?? 0) - Number(right.sort_order ?? 0); }
function toListingRow(input: Partial<AdminTravelListingInput>) { return { ...input }; }
function toRoomRow(input: Partial<AdminTravelRoomInput>) { return { ...input }; }

function validateListing(input: Omit<AdminTravelListingInput, "id">) {
  if (input.title.trim().length < 2) throw new Error("ชื่อรายการต้องมีอย่างน้อย 2 ตัวอักษร");
  if (!input.slug.trim()) throw new Error("กรุณาระบุ slug");
  if (!Number.isFinite(input.price_from) || input.price_from < 0) throw new Error("ราคาเริ่มต้นต้องเป็น 0 หรือมากกว่า");
  if (!Number.isFinite(input.latitude) || !Number.isFinite(input.longitude)) throw new Error("กรุณาระบุพิกัดแผนที่ให้ถูกต้อง");
}

function validateRoom(input: AdminTravelRoomInput) {
  if (input.name.trim().length < 2) throw new Error("ชื่อห้องพักต้องมีอย่างน้อย 2 ตัวอักษร");
  if (!Number.isFinite(input.price_per_night) || input.price_per_night < 0) throw new Error("ราคาห้องพักต้องเป็น 0 หรือมากกว่า");
  if (!Number.isInteger(input.available_count) || input.available_count < 0) throw new Error("จำนวนห้องว่างต้องเป็นจำนวนเต็ม 0 หรือมากกว่า");
}

function validateImages(images: AdminImageCandidate[], entityLabel: string) {
  if (images.length > 5) throw new Error(`อัปโหลดรูป${entityLabel}ได้สูงสุด 5 รูป`);
  for (const image of images) {
    if (image.fileSize && image.fileSize > 5 * 1024 * 1024) throw new Error("รูปภาพแต่ละรูปต้องมีขนาดไม่เกิน 5 MB");
    if (image.mimeType && !["image/jpeg", "image/png", "image/webp"].includes(image.mimeType)) throw new Error("รองรับเฉพาะ JPG, PNG และ WebP");
  }
}

async function uploadTravelImage(folder: string, candidate: AdminImageCandidate, index: number) {
  const response = await fetch(candidate.uri);
  const blob = await response.blob();
  const extension = candidate.fileName?.split(".").pop()?.toLowerCase() || candidate.mimeType?.split("/").pop() || "jpg";
  const { data, error } = await supabase.storage.from(TRAVEL_IMAGE_BUCKET).upload(`${folder}/${Date.now()}-${index}.${extension}`, blob, { contentType: candidate.mimeType ?? blob.type ?? "image/jpeg", upsert: false });
  if (error || !data) throw error ?? new Error("อัปโหลดรูปภาพไม่สำเร็จ");
  return data.path;
}
