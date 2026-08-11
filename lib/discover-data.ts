import { hobeeStories } from "@/lib/hobee-data";

export const discoverTopics = ["ทั้งหมด", "Trip", "Place", "Food", "Service", "Story", "Community", "Opportunity"] as const;
export const featuredDiscovery = { badge: "LOCAL DISCOVERY", title: "ออกไปพบเรื่องราวที่อยู่ใกล้กว่าที่คิด", description: "ทริป สถานที่ รสชาติ และผู้คนที่ทำให้ทุกวันมีความหมายมากขึ้น", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=85&w=1200", storyId: hobeeStories[2].id };
export const discoverTrips = [
  { id: "trip-cm", title: "เที่ยวชิล เชียงใหม่ 3 วัน 2 คืน", image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&q=85&w=900", badge: "ทริปแนะนำ", detail: "3 วัน 2 คืน · เชียงใหม่", price: "฿ 4,900", storyId: hobeeStories[2].id },
  { id: "trip-andaman", title: "ทะเลอันดามัน และวิถีชุมชน", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=85&w=900", badge: "สุดสัปดาห์", detail: "2 วัน 1 คืน · พังงา", price: "฿ 2,900", storyId: hobeeStories[1].id },
];
export const discoverPlaces = [
  { id: "place-cafe", title: "คาเฟ่วิวทุ่งนา บรรยากาศดี", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=85&w=900", badge: "ใกล้คุณ", detail: "เชียงใหม่ · คาเฟ่", price: "เริ่ม ฿ 120", storyId: hobeeStories[1].id },
  { id: "place-farm", title: "ฟาร์มผึ้งและสวนดอกไม้", image: "https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?auto=format&fit=crop&q=85&w=900", badge: "วันหยุด", detail: "นราธิวาส · Family", price: "เข้าชมฟรี", storyId: hobeeStories[0].id },
];
export const discoverFood = [
  { id: "food-south", title: "ครัวใต้รสจัด สูตรบ้านเรา", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=85&w=900", badge: "Food guide", detail: "รสชาติท้องถิ่น", price: "เริ่ม ฿ 150", storyId: hobeeStories[1].id },
  { id: "food-coffee", title: "กาแฟชุมชน คั่วสดทุกเช้า", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=85&w=900", badge: "Coffee", detail: "Local roaster", price: "เริ่ม ฿ 90", storyId: hobeeStories[0].id },
];
export const discoverServices = [
  { id: "hotel", label: "จองโรงแรม", icon: "hotel" as const, tone: "#FFF2C7", storyId: hobeeStories[2].id },
  { id: "car", label: "รถเช่า", icon: "directions-car" as const, tone: "#E1EDFF", storyId: hobeeStories[2].id },
  { id: "insurance", label: "ประกันเดินทาง", icon: "verified-user" as const, tone: "#D9F8F1", storyId: hobeeStories[1].id },
  { id: "course", label: "เรียนรู้", icon: "school" as const, tone: "#F1E8FF", storyId: hobeeStories[0].id },
];
export const discoverCommunities = [
  { id: "creator", name: "แบกกล้องเที่ยว", detail: "Creator & Reviewer", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=85&w=300", storyId: hobeeStories[2].id },
  { id: "family", name: "Trip Family", detail: "Family Travel Club", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=85&w=300", storyId: hobeeStories[1].id },
  { id: "foodie", name: "กินเที่ยว 365", detail: "Local Foodie", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=85&w=300", storyId: hobeeStories[0].id },
  { id: "guide", name: "HOBEE Guide", detail: "Verified Local Host", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=85&w=300", storyId: hobeeStories[2].id },
];
