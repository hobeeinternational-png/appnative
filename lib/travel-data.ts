import type { TravelListing } from "@/lib/travel-types";

export const travelProvinces = [
  { id: "all", label: "ทุกจังหวัด" },
  { id: "satun", label: "สตูล" },
  { id: "yala", label: "ยะลา / เบตง" },
  { id: "pattani", label: "ปัตตานี" },
  { id: "songkhla", label: "สงขลา" },
  { id: "narathiwat", label: "นราธิวาส" },
] as const;

export const travelIntents = [
  { id: "beach", label: "ทะเลและเกาะสวย", icon: "beach-access", tone: "#DDF5F7" },
  { id: "mountain", label: "ทะเลหมอกและภูเขา", icon: "landscape", tone: "#E8EEF9" },
  { id: "heritage", label: "พหุวัฒนธรรม", icon: "account-balance", tone: "#FFF0D2" },
  { id: "eco", label: "เชิงนิเวศ", icon: "forest", tone: "#E0F4E8" },
  { id: "homestay", label: "โฮมสเตย์ชุมชน", icon: "cottage", tone: "#F4E8DD" },
] as const;

const commonAddOns = [
  { id: "transfer", title: "รถรับส่งสนามบิน", description: "รับ-ส่งตามเวลาที่เลือก", price: 900, icon: "directions-car" },
  { id: "esim", title: "eSIM เน็ต 5 วัน", description: "สำหรับนักท่องเที่ยวต่างชาติ", price: 350, icon: "sim-card" },
  { id: "halal", title: "เซ็ตอาหารฮาลาล", description: "เลือกเมนูตามจำนวนผู้เดินทาง", price: 450, icon: "restaurant" },
] as const;

export const travelListings: TravelListing[] = [
  {
    id: "trip-lipe-3d2n", slug: "lipe-islands-3d2n", listingType: "trip", provinceId: "satun", provinceName: "สตูล", title: "ดำน้ำเกาะหลีเป๊ะ 3 วัน 2 คืน", shortDescription: "ทะเลใส เกาะสวย และวิถีชุมชนอันดามัน", fullDescription: "แพ็กเกจทริปตัวอย่างสำหรับออกแบบประสบการณ์ Travel ของ HOBEE โปรดตรวจสอบวันว่างและราคาจริงกับผู้ประกอบการก่อนยืนยันการจอง", location: "เกาะหลีเป๊ะ, สตูล", coordinates: { lat: 6.489, lng: 99.302 }, priceFrom: 8900, rating: 4.9, reviewsCount: 128, images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=85&w=1200", "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&q=85&w=1200"], itineraryDays: [{ day: 1, title: "ถึงสตูลและเข้าสู่เกาะหลีเป๊ะ", description: "พบไกด์ท้องถิ่น เดินทางโดยเรือ และเช็คอินที่พัก" }, { day: 2, title: "ดำน้ำชมปะการัง", description: "ออกเรือไปยังจุดดำน้ำ พร้อมอาหารฮาลาล" }, { day: 3, title: "วิถีชุมชนและเดินทางกลับ", description: "เลือกซื้อของดีท้องถิ่นก่อนเดินทางกลับ" }], departureDates: ["2026-08-22", "2026-09-05", "2026-09-19"], tripModes: ["join", "private"], addOns: [...commonAddOns], operatorName: "HOBEE Andaman Local", isHalalCertified: true, included: ["รถรับส่งตามโปรแกรม", "ที่พัก 2 คืน", "อาหารฮาลาล", "อุปกรณ์ดำน้ำ", "ประกันอุบัติเหตุ"], excluded: ["ตั๋วเครื่องบิน", "ค่าใช้จ่ายส่วนตัว"]
  },
  {
    id: "stay-betong-garden", slug: "betong-garden-homestay", listingType: "accommodation", provinceId: "yala", provinceName: "ยะลา / เบตง", title: "เบตง การ์เดน โฮมสเตย์", shortDescription: "พักใกล้หมอกเช้าและวิถีชุมชนเบตง", fullDescription: "ที่พักตัวอย่างในเครือข่ายชุมชนสำหรับแสดงการเลือกห้องพัก สิ่งอำนวยความสะดวก และการจองรายคืน", location: "เบตง, ยะลา", coordinates: { lat: 5.774, lng: 101.072 }, priceFrom: 1590, rating: 4.8, reviewsCount: 74, images: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=85&w=1200", "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&q=85&w=1200"], propertyType: "โฮมสเตย์ชุมชน", roomTypes: [{ id: "garden-deluxe", name: "Deluxe Garden View", description: "ห้องพักวิวสวนสำหรับคู่รักหรือครอบครัวเล็ก", pricePerNight: 1590, capacityAdults: 2, capacityChildren: 1, roomSizeSqm: 32, bedType: "1 King Bed", amenities: ["Free Wi‑Fi", "เครื่องปรับอากาศ", "อาหารเช้าฮาลาล", "ที่จอดรถ"], image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=85&w=800", availableCount: 3 }, { id: "mountain-suite", name: "Cozy Mountain View Suite", description: "ห้องสวีทพร้อมพื้นที่พักผ่อนและวิวภูเขา", pricePerNight: 2290, capacityAdults: 3, capacityChildren: 1, roomSizeSqm: 46, bedType: "1 King Bed + Sofa Bed", amenities: ["Free Wi‑Fi", "อาหารเช้าฮาลาล", "เครื่องทำน้ำอุ่น", "ระเบียงส่วนตัว"], image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=85&w=800", availableCount: 2 }], addOns: [...commonAddOns], operatorName: "Betong Community Stay", isHalalCertified: true, included: ["อาหารเช้าฮาลาล", "น้ำดื่ม", "ที่จอดรถ"], excluded: ["รถรับส่งสนามบิน", "อาหารมื้ออื่น"]
  },
  {
    id: "trip-pattani-heritage", slug: "pattani-local-heritage", listingType: "trip", provinceId: "pattani", provinceName: "ปัตตานี", title: "พหุวัฒนธรรมปัตตานี 2 วัน 1 คืน", shortDescription: "อาหาร ฮาลาล ศิลปะ และวิถีชุมชนชายแดนใต้", fullDescription: "ทริปตัวอย่างสำหรับ Local Life Hub ที่เน้นอาหารท้องถิ่น สถานที่สำคัญ และ Creator ชุมชน", location: "เมืองปัตตานี", coordinates: { lat: 6.869, lng: 101.25 }, priceFrom: 3490, rating: 4.7, reviewsCount: 41, images: ["https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=85&w=1200"], itineraryDays: [{ day: 1, title: "ชิมวิถีถิ่น", description: "ตลาดเช้า อาหารฮาลาล และงานหัตถกรรม" }, { day: 2, title: "เรื่องเล่าชุมชน", description: "พบ Creator และเลือกซื้อของดีท้องถิ่น" }], departureDates: ["2026-08-30", "2026-09-13"], tripModes: ["join", "private"], addOns: [...commonAddOns], operatorName: "Pattani Local Collective", isHalalCertified: true, included: ["รถตู้ท้องถิ่น", "มื้ออาหารตามโปรแกรม", "ไกด์ชุมชน", "ประกันอุบัติเหตุ"], excluded: ["ตั๋วเดินทางมายังปัตตานี", "ค่าใช้จ่ายส่วนตัว"]
  },
] as const;

export function getTravelListing(id: string) { return travelListings.find((listing) => listing.id === id); }

export function formatTravelPrice(value: number) { return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(value); }
