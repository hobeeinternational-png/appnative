export type TravelListingType = "accommodation" | "trip";
export type TripMode = "join" | "private";

export type TravelRoomType = {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  capacityAdults: number;
  capacityChildren: number;
  roomSizeSqm: number;
  bedType: string;
  amenities: string[];
  image: string;
  availableCount: number;
};

export type ItineraryDay = { day: number; title: string; description: string };
export type TravelAddOn = { id: string; title: string; description: string; price: number; icon: string };

export type TravelListing = {
  id: string;
  slug: string;
  listingType: TravelListingType;
  provinceId: "satun" | "yala" | "pattani" | "songkhla" | "narathiwat";
  provinceName: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  location: string;
  coordinates: { lat: number; lng: number };
  priceFrom: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  propertyType?: "โรงแรม" | "รีสอร์ต" | "โฮมสเตย์ชุมชน" | "พูลวิลล่า";
  roomTypes?: TravelRoomType[];
  itineraryDays?: ItineraryDay[];
  departureDates?: string[];
  tripModes?: TripMode[];
  addOns: TravelAddOn[];
  operatorName: string;
  isHalalCertified: boolean;
  included: string[];
  excluded: string[];
};

export type TravelBookingDraft = {
  listingId: string;
  listingType: TravelListingType;
  roomTypeId?: string;
  tripMode?: TripMode;
  checkIn?: string;
  checkOut?: string;
  departureDate?: string;
  rooms: number;
  adults: number;
  children: number;
  addOnIds: string[];
  paymentPlan: "deposit" | "full";
};
