import type { HobeeProduct } from "@/lib/hobee-data";

const PROVINCES = ["เชียงใหม่", "เชียงราย", "ยะลา", "นราธิวาส", "สงขลา", "นครนายก", "สุรินทร์"];

export type ShopCategory = { id: string; label: string; icon: "apps" | "restaurant" | "eco" | "redeem"; tone: string };

export function deriveShopCategories(products: HobeeProduct[]): ShopCategory[] {
  const categories = Array.from(new Set(products.map((product) => product.category))).slice(0, 6);
  return [
    { id: "ทั้งหมด", label: "ทั้งหมด", icon: "apps", tone: "#DDF6EF" },
    ...categories.map((category, index): ShopCategory => ({ id: category, label: category, icon: index === 0 ? "eco" : "restaurant", tone: index % 2 ? "#FFF0D6" : "#E6F7F2" })),
    ...(products.some((product) => product.badge === "LOCAL") ? [{ id: "ของดีชุมชน", label: "ของดีชุมชน", icon: "redeem" as const, tone: "#FBE8F0" }] : []),
  ];
}

export type CommunityOrigin = { id: string; title: string; count: number; image: string; origin: string };

function provinceFromOrigin(origin: string) {
  return PROVINCES.find((province) => origin.includes(province)) ?? origin;
}

export function deriveCommunityOrigins(products: HobeeProduct[]): CommunityOrigin[] {
  const grouped = new Map<string, HobeeProduct[]>();
  for (const product of products) grouped.set(product.origin, [...(grouped.get(product.origin) ?? []), product]);
  return Array.from(grouped.entries()).map(([origin, entries]) => ({ id: origin, title: provinceFromOrigin(origin), count: entries.length, image: entries[0].image, origin }));
}

export function deriveShopImpact(products: HobeeProduct[]) {
  const producerCount = new Set(products.map((product) => product.shopName)).size;
  const originCount = new Set(products.map((product) => product.origin)).size;
  return { productCount: products.length, producerCount, originCount, available: products.length > 0 };
}
