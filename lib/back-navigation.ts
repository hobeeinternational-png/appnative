export type BackRule = { title: string; fallback: string };

const ROUTE_RULES: Record<string, BackRule> = {
  cart: { title: "ตะกร้าสินค้า", fallback: "/(tabs)/shop" }, checkout: { title: "ชำระเงิน", fallback: "/cart" }, "checkout/address": { title: "ที่อยู่จัดส่ง", fallback: "/checkout" }, favorites: { title: "สินค้าที่ชื่นชอบ", fallback: "/(tabs)/account" }, rewards: { title: "รางวัลของฉัน", fallback: "/(tabs)/account" },
  "product/[id]": { title: "รายละเอียดสินค้า", fallback: "/(tabs)/shop" }, "story/[id]": { title: "เรื่องราว HOBEE", fallback: "/(tabs)/discover" }, "travel/[id]": { title: "รายละเอียดทริป", fallback: "/travel" }, "travel/local-life": { title: "Local Life", fallback: "/travel" }, "travel/my-province": { title: "จังหวัดของฉัน", fallback: "/travel" }, "travel/restaurants": { title: "ร้านอาหาร", fallback: "/travel" }, "travel/trip-builder": { title: "วางแผนทริป", fallback: "/travel" },
  "learning/[id]": { title: "รายละเอียดบทเรียน", fallback: "/(tabs)/learn" }, "learning/my-learning": { title: "การเรียนรู้ของฉัน", fallback: "/(tabs)/learn" }, "orders/index": { title: "คำสั่งซื้อ", fallback: "/(tabs)/account" }, "orders/[id]": { title: "รายละเอียดคำสั่งซื้อ", fallback: "/orders" }, "payment/[orderId]": { title: "ชำระเงิน", fallback: "/orders" },
  "admin/index": { title: "HOBEE Admin", fallback: "/(tabs)/account" }, "admin/products": { title: "จัดการสินค้า", fallback: "/admin" }, "admin/orders": { title: "จัดการคำสั่งซื้อ", fallback: "/admin" }, "admin/stores": { title: "ร้านค้า / Seller", fallback: "/admin" }, "admin/travel": { title: "จัดการทริปและที่พัก", fallback: "/admin" },
};

export function shouldShowBackHeader(routeName: string) { return !["(tabs)", "auth", "oauth/callback", "auth/callback", "payment/callback", "travel", "travel/index"].includes(routeName) && !routeName.startsWith("my-hobee"); }
export function getBackRule(routeName: string): BackRule { return ROUTE_RULES[routeName] ?? { title: "HOBEE", fallback: "/(tabs)" }; }

type RouterWithBack = { canGoBack?: () => boolean; back: () => void; replace: (...args: any[]) => void };
export function goBackOr(router: RouterWithBack, fallback: string) { if (router.canGoBack?.()) router.back(); else router.replace(fallback); }
