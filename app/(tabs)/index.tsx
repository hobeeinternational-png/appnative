import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { FixedAppShell, useHeaderElevation } from "@/components/hobee/shared-ui";
import { HOBEE } from "@/components/hobee/design-tokens";
import { ScreenContainer } from "@/components/screen-container";
import { useCart } from "@/contexts/cart-context";
import { useCatalog } from "@/hooks/use-catalog";
import { formatThaiBaht, hobeeStories } from "@/lib/hobee-data";

const CATEGORY_ITEMS = [
  { label: "ท่องเที่ยว", icon: "luggage", tone: "#FFF1C8", route: "/travel" },
  { label: "ร้านค้า", icon: "storefront", tone: "#FFF2D8", route: "/(tabs)/shop" },
  { label: "สินค้า", icon: "inventory-2", tone: "#D9FAF1", route: "/(tabs)/shop" },
  { label: "บริการ", icon: "business-center", tone: "#E0F2FE", route: "/(tabs)/discover" },
  { label: "ร้านอาหาร", icon: "restaurant", tone: "#FFF1DE", route: "/travel/food" },
  { label: "เรียนรู้", icon: "school", tone: "#E6F0FF", route: "/learn" },
  { label: "Opportunity", icon: "trending-up", tone: "#FFF5CC", route: "/(tabs)/discover" },
  { label: "Community", icon: "groups", tone: "#F1E8FF", route: "/(tabs)/discover" },
] as const;

const INTERESTS = [
  { label: "เชียงใหม่", icon: "landscape", route: "/travel" },
  { label: "ทริปน่าไป", icon: "explore", route: "/(tabs)/discover" },
  { label: "คาเฟ่ & อาหาร", icon: "local-cafe", route: "/travel/food" },
];
const DISCOVERY_TABS = ["แนะนำ", "ใกล้คุณ", "โอกาส"] as const;
type DiscoveryTab = (typeof DISCOVERY_TABS)[number];

export default function HomeScreen() {
  const { products } = useCatalog();
  const { elevated, onScroll } = useHeaderElevation();

  return <ScreenContainer containerClassName="bg-[#F6F6F4]" safeAreaClassName="pt-7" edges={["top", "left", "right"]}>
    <FixedAppShell elevated={elevated} header={<View style={styles.headerSpacer} />} search={<HomeSearchActions />}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={styles.content}>
        <CategoryRail />
        <RecentStories />
        <InterestRail />
        <DiscoverySection products={products} />
        <EcosystemStrip />
      </ScrollView>
    </FixedAppShell>
  </ScreenContainer>;
}

function HomeSearchActions() {
  const { itemCount } = useCart();
  return <View style={styles.searchActions}><Pressable accessibilityRole="button" accessibilityLabel="ค้นหาสินค้าและบริการ" onPress={() => router.push("/(tabs)/shop")} style={({ pressed }) => [styles.searchHero, pressed && styles.pressed]}><MaterialIcons name="search" size={25} color={HOBEE.colors.ink} /><Text numberOfLines={1} style={styles.searchText}>ค้นหาทริป สินค้า ร้านค้า หรือบริการ</Text></Pressable><Pressable accessibilityLabel="เปิดตะกร้า" onPress={() => router.push("/cart")} style={({ pressed }) => [styles.actionIcon, pressed && styles.pressed]}><MaterialIcons name="shopping-cart" size={28} color={HOBEE.colors.ink} />{itemCount > 0 ? <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{itemCount > 9 ? "9+" : itemCount}</Text></View> : null}</Pressable><Pressable accessibilityLabel="เปิดการแจ้งเตือน" onPress={() => router.push("/orders")} style={({ pressed }) => [styles.actionIcon, pressed && styles.pressed]}><MaterialIcons name="notifications-none" size={29} color={HOBEE.colors.ink} /><View style={styles.notificationDot} /></Pressable></View>;
}

function CategoryRail() { return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRail}>{CATEGORY_ITEMS.map((item) => <Pressable key={item.label} accessibilityLabel={`เปิดหมวด ${item.label}`} onPress={() => router.push(item.route as Href)} style={({ pressed }) => [styles.categoryItem, pressed && styles.pressed]}><View style={[styles.categoryIcon, { backgroundColor: item.tone }]}><MaterialIcons name={item.icon} size={28} color={HOBEE.colors.botanical} /></View><Text numberOfLines={1} style={styles.categoryLabel}>{item.label}</Text></Pressable>)}</ScrollView>; }

function RecentStories() { return <Section title="เรื่องน่าสนใจล่าสุด" action="ดูเพิ่มเติม" onAction={() => router.push("/(tabs)/discover")}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRail}>{hobeeStories.slice(1, 5).map((story) => <Pressable key={story.id} onPress={() => router.push("/(tabs)/discover")} style={({ pressed }) => [styles.recentCard, pressed && styles.pressed]}><Image source={{ uri: story.image }} style={styles.recentImage} /><Text numberOfLines={2} style={styles.recentTitle}>{story.title}</Text></Pressable>)}</ScrollView></Section>; }

function InterestRail() { return <Section title="กำลังมองหาอะไรอยู่?" action="ทั้งหมด" onAction={() => router.push("/(tabs)/discover")}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.interestRail}>{INTERESTS.map((interest) => <Pressable key={interest.label} onPress={() => router.push(interest.route as Href)} style={({ pressed }) => [styles.interestChip, pressed && styles.pressed]}><View style={styles.interestIcon}><MaterialIcons name={interest.icon as keyof typeof MaterialIcons.glyphMap} size={18} color={HOBEE.colors.travelTeal} /></View><Text style={styles.interestText}>{interest.label}</Text></Pressable>)}</ScrollView></Section>; }

function DiscoverySection({ products }: { products: ReturnType<typeof useCatalog>["products"] }) {
  const [activeTab, setActiveTab] = useState<DiscoveryTab>("แนะนำ");
  const productCards = products.slice(0, 4).map((product) => ({ id: `product-${product.id}`, image: product.image, title: product.shortName, detail: `★ ${product.rating.toFixed(1)} (${product.reviewsCount})`, price: formatThaiBaht(product.price), badge: product.badge, route: { pathname: "/product/[id]", params: { id: product.id } } as Href }));
  const storyCards = hobeeStories.slice(1, 5).map((story, index) => ({ id: `story-${story.id}`, image: story.image, title: story.title, detail: index % 2 === 0 ? "ทริปและสถานที่แนะนำ" : "Story จากชุมชน HOBEE", price: index % 2 === 0 ? "ดูรายละเอียด" : "ค้นพบเพิ่มเติม", badge: index === 0 ? "ทริปแนะนำ" : undefined, route: "/(tabs)/discover" as Href }));
  const serviceCards = [
    { id: "service-travel", image: hobeeStories[2].image, title: "จองโรงแรมและดีลท่องเที่ยว", detail: "บริการ HOBEE Travel", price: "เริ่มวางแผน", badge: "TRAVEL", route: "/travel" as Href },
    { id: "service-food", image: hobeeStories[1].image, title: "ร้านอาหารท้องถิ่นและ Halal", detail: "สั่งล่วงหน้าได้", price: "ดูร้านอาหาร", badge: "FOOD", route: "/travel/food" as Href },
    { id: "service-learn", image: hobeeStories[3].image, title: "เรียนรู้เพื่อชุมชนและธุรกิจ", detail: "HOBEE Academy", price: "เริ่มเรียน", badge: "LEARNING", route: "/learn" as Href },
    { id: "service-community", image: hobeeStories[0].image, title: "โอกาสและ Community", detail: "เชื่อมต่อ Ecosystem", price: "สำรวจโอกาส", badge: "COMMUNITY", route: "/(tabs)/discover" as Href },
  ];
  const cards = activeTab === "แนะนำ" ? [...storyCards.slice(0, 2), ...productCards] : activeTab === "ใกล้คุณ" ? [...storyCards, ...productCards.slice(0, 2)] : serviceCards;
  return <View style={styles.discovery}><View style={styles.tabRow}>{DISCOVERY_TABS.map((tab) => <Pressable key={tab} onPress={() => setActiveTab(tab)} style={({ pressed }) => [styles.discoveryTab, activeTab === tab && styles.discoveryTabActive, pressed && styles.pressed]}><Text style={[styles.discoveryTabText, activeTab === tab && styles.discoveryTabTextActive]}>{tab}</Text></Pressable>)}</View><View style={styles.discoveryGrid}>{cards.map((card) => <DiscoveryCard key={card.id} {...card} />)}</View></View>;
}

function DiscoveryCard({ image, title, detail, price, badge, route }: { image: string; title: string; detail: string; price: string; badge?: string; route: Href }) { return <Pressable accessibilityLabel={title} onPress={() => router.push(route)} style={({ pressed }) => [styles.discoveryCard, pressed && styles.pressed]}><View><Image source={{ uri: image }} style={styles.discoveryImage} /><View style={styles.imageShade} />{badge ? <View style={styles.discoveryBadge}><Text style={styles.discoveryBadgeText}>{badge}</Text></View> : null}</View><View style={styles.discoveryBody}><Text numberOfLines={2} style={styles.discoveryTitle}>{title}</Text><Text numberOfLines={1} style={styles.discoveryDetail}>{detail}</Text><Text style={styles.discoveryPrice}>{price}</Text></View></Pressable>; }

function EcosystemStrip() { return <Pressable onPress={() => router.push("/(tabs)/discover")} style={({ pressed }) => [styles.ecosystem, pressed && styles.pressed]}><View style={styles.ecosystemIcon}><MaterialIcons name="auto-awesome" size={22} color={HOBEE.colors.gold} /></View><View style={styles.ecosystemCopy}><Text style={styles.ecosystemTitle}>HOBEE Ecosystem</Text><Text style={styles.ecosystemText}>โอกาสธุรกิจ บริการ ชุมชน และเรื่องราวที่เติบโตไปด้วยกัน</Text></View><MaterialIcons name="arrow-forward" size={23} color={HOBEE.colors.gold} /></Pressable>; }

function Section({ title, action, onAction, children }: { title: string; action: string; onAction: () => void; children: React.ReactNode }) { return <View style={styles.section}><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text><Pressable onPress={onAction} style={styles.sectionAction}><Text style={styles.sectionActionText}>{action}</Text><MaterialIcons name="chevron-right" size={20} color={HOBEE.colors.ink} /></Pressable></View>{children}</View>; }

const styles = StyleSheet.create({
  headerSpacer: { height: 0 }, scroll: { flex: 1 }, content: { paddingBottom: 164, backgroundColor: "#F6F6F4" }, searchActions: { flexDirection: "row", alignItems: "center", gap: 6 }, searchHero: { flex: 1, height: 54, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 2, borderColor: HOBEE.colors.gold, borderRadius: 27, backgroundColor: "#FFFFFF", paddingHorizontal: 15 }, searchText: { flex: 1, color: HOBEE.colors.ink, fontSize: 15, fontWeight: "700" }, actionIcon: { position: "relative", width: 39, height: 54, alignItems: "center", justifyContent: "center" }, cartBadge: { position: "absolute", right: 1, top: 8, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: HOBEE.colors.gold, paddingHorizontal: 3 }, cartBadgeText: { color: HOBEE.colors.ink, fontSize: 9, fontWeight: "900" }, notificationDot: { position: "absolute", top: 12, right: 6, width: 7, height: 7, borderRadius: 4, borderWidth: 1, borderColor: "#FFFFFF", backgroundColor: HOBEE.colors.gold }, categoryRail: { gap: 16, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 5 }, categoryItem: { width: 65, alignItems: "center", gap: 6 }, categoryIcon: { width: 47, height: 47, alignItems: "center", justifyContent: "center", borderRadius: 15 }, categoryLabel: { width: 75, color: HOBEE.colors.ink, fontSize: 10, fontWeight: "800", textAlign: "center" }, section: { marginTop: 25 }, sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 13 }, sectionTitle: { color: HOBEE.colors.ink, fontSize: 21, fontWeight: "900", letterSpacing: -0.3 }, sectionAction: { flexDirection: "row", alignItems: "center" }, sectionActionText: { color: HOBEE.colors.ink, fontSize: 12, fontWeight: "800" }, recentRail: { gap: 11, paddingHorizontal: 20 }, recentCard: { width: 146 }, recentImage: { width: 146, height: 104, borderRadius: 12, backgroundColor: "#E6E3DD" }, recentTitle: { marginTop: 7, color: HOBEE.colors.ink, fontSize: 12, fontWeight: "800", lineHeight: 17 }, interestRail: { gap: 9, paddingHorizontal: 20 }, interestChip: { flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: "#E2DFD9", borderRadius: 24, backgroundColor: "#FFFFFF", paddingVertical: 7, paddingLeft: 7, paddingRight: 13 }, interestIcon: { width: 31, height: 31, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#E8F7F1" }, interestText: { color: HOBEE.colors.ink, fontSize: 12, fontWeight: "800" }, discovery: { marginTop: 27 }, tabRow: { flexDirection: "row", gap: 26, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#E6E3DE" }, discoveryTab: { paddingBottom: 11 }, discoveryTabActive: { borderBottomWidth: 3, borderBottomColor: HOBEE.colors.gold }, discoveryTabText: { color: HOBEE.colors.muted, fontSize: 19, fontWeight: "900" }, discoveryTabTextActive: { color: HOBEE.colors.shopOrange }, discoveryGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 14, paddingHorizontal: 20, paddingTop: 16 }, discoveryCard: { width: "48.4%", overflow: "hidden", borderRadius: 14, backgroundColor: "#FFFFFF" }, discoveryImage: { width: "100%", height: 164, backgroundColor: "#E7E4DF" }, imageShade: { ...StyleSheet.absoluteFillObject, bottom: "auto", height: 44, backgroundColor: "rgba(0,0,0,0.08)" }, discoveryBadge: { position: "absolute", left: 9, top: 9, borderRadius: 10, backgroundColor: "rgba(25,124,106,0.94)", paddingHorizontal: 7, paddingVertical: 4 }, discoveryBadgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" }, discoveryBody: { minHeight: 122, padding: 11 }, discoveryTitle: { color: HOBEE.colors.ink, fontSize: 14, fontWeight: "900", lineHeight: 19 }, discoveryDetail: { marginTop: 5, color: HOBEE.colors.shopOrange, fontSize: 11, fontWeight: "800" }, discoveryPrice: { marginTop: 8, color: HOBEE.colors.ink, fontSize: 16, fontWeight: "900" }, ecosystem: { flexDirection: "row", alignItems: "center", gap: 11, marginHorizontal: 20, marginTop: 29, borderRadius: 20, backgroundColor: HOBEE.colors.darkCard, padding: 16 }, ecosystemIcon: { width: 43, height: 43, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: "rgba(255,255,255,0.08)" }, ecosystemCopy: { flex: 1 }, ecosystemTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" }, ecosystemText: { marginTop: 3, color: "#C9C5BF", fontSize: 11, fontWeight: "600", lineHeight: 15 }, pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
