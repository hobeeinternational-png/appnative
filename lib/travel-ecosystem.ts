import { travelListings } from "@/lib/travel-data";
import type { TravelListing } from "@/lib/travel-types";

export type TravelEcosystemMode = "presentation";
export type TravelIntentId = "local-life" | "regional-trips" | "foreign-visitors" | "trip-builder";
export type TravelStyleId = "nature" | "culture" | "adventure" | "workation" | "camping" | "workshop" | "food" | "family" | "couple" | "creator";
export type TravelProvinceId = Exclude<TravelListing["provinceId"], never>;
export type TravelDiscoveryKind = "destination" | "trip" | "stay" | "workshop" | "restaurant" | "store" | "creator-template";

export type TravelIntent = { id: TravelIntentId; label: string; subtitle: string; icon: string; tone: string; route: string; dataMode: TravelEcosystemMode };
export type TravelStyle = { id: TravelStyleId; label: string; icon: string; tone: string; dataMode: TravelEcosystemMode };
export type ProvinceEditorial = { id: TravelProvinceId; name: string; volume: string; tagline: string; heroImage: string; highlights: string[]; dataMode: TravelEcosystemMode };
export type FeaturedDestination = { id: string; provinceId: TravelProvinceId; title: string; subtitle: string; image: string; route: string; dataMode: TravelEcosystemMode };
export type TravelWorkshop = { id: string; title: string; provinceId: TravelProvinceId; host: string; duration: string; location: string; priceFrom?: number; rating?: number; image: string; dataMode: TravelEcosystemMode };
export type CreatorTripTemplate = { id: string; creator: string; verified: boolean; title: string; provinceId: TravelProvinceId; duration: string; estimatedBudget?: number; image: string; dataMode: TravelEcosystemMode };
export type ForeignVisitorService = { id: string; title: string; description: string; icon: string; status: "presentation" | "backend_pending"; dataMode: TravelEcosystemMode };
export type TravelSafetyContract = { id: "hospital" | "police" | "tourist-police" | "local-help" | "operator"; title: string; description: string; phone?: string; verification: "backend_pending" | "verified"; dataMode: TravelEcosystemMode };
export type TravelSearchResult = { id: string; kind: TravelDiscoveryKind; title: string; subtitle: string; image?: string; route: string; dataMode: TravelEcosystemMode };
export type TravelPlannerItemType = "attraction" | "food" | "hotel" | "workshop" | "transport" | "photo-spot" | "custom";

export const TRAVEL_INTENTS: TravelIntent[] = [
  { id: "local-life", label: "เที่ยวในจังหวัดของฉัน", subtitle: "Local Life Hub", icon: "forest", tone: "#629B55", route: "/travel/my-province", dataMode: "presentation" },
  { id: "regional-trips", label: "เที่ยวจังหวัดอื่น / ทริปหลัก", subtitle: "Trips & stays", icon: "map", tone: "#6F9FCB", route: "/travel", dataMode: "presentation" },
  { id: "foreign-visitors", label: "Foreign Visitors to Thailand", subtitle: "Services for international travelers", icon: "public", tone: "#8D88BF", route: "/travel/visitor", dataMode: "presentation" },
  { id: "trip-builder", label: "สร้างทริปของฉัน", subtitle: "Custom Trip Builder", icon: "auto-awesome", tone: "#EFA16A", route: "/travel/trip-builder", dataMode: "presentation" },
];

export const TRAVEL_STYLES: TravelStyle[] = [
  { id: "nature", label: "Nature", icon: "landscape", tone: "#DCEFD9", dataMode: "presentation" }, { id: "culture", label: "History & Culture", icon: "account-balance", tone: "#E4EDF9", dataMode: "presentation" }, { id: "adventure", label: "Adventure", icon: "explore", tone: "#FBE7DF", dataMode: "presentation" }, { id: "workation", label: "Workation", icon: "laptop-mac", tone: "#DFF0F5", dataMode: "presentation" }, { id: "camping", label: "Camping", icon: "terrain", tone: "#F9EED4", dataMode: "presentation" }, { id: "workshop", label: "Workshop & Experience", icon: "palette", tone: "#EEE4F5", dataMode: "presentation" }, { id: "food", label: "Food Trip", icon: "restaurant", tone: "#F9E5D4", dataMode: "presentation" }, { id: "family", label: "Family", icon: "family-restroom", tone: "#E5F0FB", dataMode: "presentation" }, { id: "couple", label: "Couple / Relax", icon: "favorite-border", tone: "#F9E1E8", dataMode: "presentation" }, { id: "creator", label: "Creator Trip", icon: "photo-camera", tone: "#E4F3EC", dataMode: "presentation" },
];

export const TRAVEL_PROVINCE_EDITORIAL: ProvinceEditorial[] = [
  { id: "narathiwat", name: "นราธิวาส", volume: "VOL.01", tagline: "Rainforest & Coast", heroImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=85&w=900", highlights: ["ป่าฮาลา-บาลา", "ชายฝั่ง", "วิถีชุมชน"], dataMode: "presentation" },
  { id: "pattani", name: "ปัตตานี", volume: "VOL.02", tagline: "Heritage & Culture", heroImage: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&q=85&w=900", highlights: ["ย่านเมืองเก่า", "อาหารฮาลาล", "งานหัตถกรรม"], dataMode: "presentation" },
  { id: "yala", name: "ยะลา", volume: "VOL.03", tagline: "Misty Mountain & City", heroImage: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&q=85&w=900", highlights: ["เบตง", "ทะเลหมอก", "คาเฟ่ชุมชน"], dataMode: "presentation" },
  { id: "songkhla", name: "สงขลา", volume: "VOL.04", tagline: "Old Town & Lake", heroImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=85&w=900", highlights: ["เมืองเก่า", "ทะเลสาบ", "สตรีทอาร์ต"], dataMode: "presentation" },
  { id: "satun", name: "สตูล", volume: "VOL.05", tagline: "UNESCO Geopark & Isles", heroImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=85&w=900", highlights: ["เกาะหลีเป๊ะ", "ธรณีโลก", "อันดามัน"], dataMode: "presentation" },
];

export const FEATURED_DESTINATIONS: FeaturedDestination[] = [
  { id: "travel-feature-satun", provinceId: "satun", title: "หน้าฝนนี้ ไม่ได้ลุย...ถ้าทะเลใต้", subtitle: "ธรรมชาติ · อาหาร · วัฒนธรรม · ชุมชน", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=85&w=1200", route: "/travel/trip-lipe-3d2n", dataMode: "presentation" },
];

export const TRAVEL_WORKSHOPS: TravelWorkshop[] = [
  { id: "workshop-southern-cook", title: "ทำอาหารใต้แบบชุมชน", provinceId: "pattani", host: "Local Food Host", duration: "2.5 ชม.", location: "ปัตตานี", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=85&w=700", dataMode: "presentation" },
  { id: "workshop-batik", title: "เพนต์ผ้าบาติก", provinceId: "narathiwat", host: "Community Artisan", duration: "3 ชม.", location: "นราธิวาส", image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=85&w=700", dataMode: "presentation" },
  { id: "workshop-bee", title: "เลี้ยงผึ้งชันโรง", provinceId: "yala", host: "HOBEE Community", duration: "3 ชม.", location: "ยะลา", image: "https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&q=85&w=700", dataMode: "presentation" },
  { id: "workshop-korlae", title: "เรื่องเล่าเรือกอและ", provinceId: "narathiwat", host: "Coastal Storyteller", duration: "2 ชม.", location: "ชายฝั่งนราธิวาส", image: "https://images.unsplash.com/photo-1484291470158-b8f8d608850d?auto=format&fit=crop&q=85&w=700", dataMode: "presentation" },
];

export const CREATOR_TRIP_TEMPLATES: CreatorTripTemplate[] = [
  { id: "creator-pattani-weekend", creator: "HOBEE Local Creator", verified: true, title: "Pattani Slow Weekend", provinceId: "pattani", duration: "2 วัน 1 คืน", image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=85&w=700", dataMode: "presentation" },
  { id: "creator-satun-isles", creator: "HOBEE Travel Creator", verified: true, title: "Island & Community Notes", provinceId: "satun", duration: "3 วัน 2 คืน", image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&q=85&w=700", dataMode: "presentation" },
];

export const FOREIGN_VISITOR_SERVICES: ForeignVisitorService[] = [
  { id: "airport", title: "Airport pickup", description: "บริการรับส่งสนามบินจะแสดงเมื่อ provider พร้อม", icon: "airport-shuttle", status: "backend_pending", dataMode: "presentation" }, { id: "esim", title: "eSIM", description: "เปรียบเทียบแพ็กเกจหลังเชื่อม provider", icon: "sim-card", status: "backend_pending", dataMode: "presentation" }, { id: "stay", title: "Accommodation", description: "ค้นหาที่พักจาก Travel listings", icon: "hotel", status: "presentation", dataMode: "presentation" }, { id: "tours", title: "Tours & Guides", description: "ค้นหาทริปและไกด์ชุมชน", icon: "explore", status: "presentation", dataMode: "presentation" }, { id: "insurance", title: "Travel insurance", description: "ต้องเลือก provider และ consent ก่อน", icon: "health-and-safety", status: "backend_pending", dataMode: "presentation" }, { id: "emergency", title: "Help & Emergency", description: "แสดงข้อมูลหลังผ่าน verification source", icon: "emergency", status: "backend_pending", dataMode: "presentation" },
];

export const TRAVEL_SAFETY_CONTRACTS: TravelSafetyContract[] = [
  { id: "hospital", title: "Hospital", description: "จะแสดงโรงพยาบาลใกล้เคียงเมื่อ map/location source พร้อม", verification: "backend_pending", dataMode: "presentation" }, { id: "police", title: "Police", description: "หมายเลขติดต่อรอแหล่งข้อมูลที่ผ่าน verification", verification: "backend_pending", dataMode: "presentation" }, { id: "tourist-police", title: "Tourist Police", description: "หมายเลขติดต่อรอแหล่งข้อมูลที่ผ่าน verification", verification: "backend_pending", dataMode: "presentation" }, { id: "local-help", title: "Local Help", description: "ช่องทางช่วยเหลือในพื้นที่ตามจังหวัดที่เลือก", verification: "backend_pending", dataMode: "presentation" }, { id: "operator", title: "Trip Operator", description: "ข้อมูลติดต่อจะแสดงเฉพาะ booking ที่ยืนยันแล้ว", verification: "backend_pending", dataMode: "presentation" },
];

export function getProvinceEditorial(id: TravelProvinceId) { return TRAVEL_PROVINCE_EDITORIAL.find((province) => province.id === id); }
export function getTravelStyleMatches(style: TravelStyleId, listings: TravelListing[] = travelListings) { const matching: Record<TravelStyleId, TravelListing["provinceId"][]> = { nature: ["satun", "yala"], culture: ["pattani", "songkhla"], adventure: ["satun", "yala"], workation: ["yala", "songkhla"], camping: ["satun", "yala"], workshop: ["pattani", "narathiwat"], food: ["pattani", "narathiwat"], family: ["satun", "yala"], couple: ["satun", "yala"], creator: ["pattani", "satun"] }; return listings.filter((listing) => matching[style].includes(listing.provinceId)); }
export function searchTravelEcosystem(query: string, listings: TravelListing[] = travelListings): TravelSearchResult[] { const normalized = query.trim().toLocaleLowerCase(); if (!normalized) return []; const listingMatches = listings.filter((listing) => `${listing.title} ${listing.location} ${listing.provinceName}`.toLocaleLowerCase().includes(normalized)).map((listing) => ({ id: listing.id, kind: listing.listingType === "trip" ? "trip" as const : "stay" as const, title: listing.title, subtitle: `${listing.location} · ${listing.provinceName}`, image: listing.images[0], route: `/travel/${listing.id}`, dataMode: "presentation" as const })); const workshopMatches = TRAVEL_WORKSHOPS.filter((workshop) => `${workshop.title} ${workshop.location}`.toLocaleLowerCase().includes(normalized)).map((workshop) => ({ id: workshop.id, kind: "workshop" as const, title: workshop.title, subtitle: `${workshop.location} · ${workshop.duration}`, image: workshop.image, route: "/travel/local-life", dataMode: "presentation" as const })); return [...listingMatches, ...workshopMatches]; }
