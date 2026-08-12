import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader, CategoryTile as SharedCategoryTile, CommunityCard as SharedCommunityCard, FixedAppShell, ProductCard as SharedProductCard, SearchBar as SharedSearchBar, SectionHeader as SharedSectionHeader, ServiceTile as SharedServiceTile, TripCard as SharedTripCard, useHeaderElevation } from "@/components/hobee/shared-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useCatalog } from "@/hooks/use-catalog";
import { formatThaiBaht, hobeeStories, type HobeeProduct } from "@/lib/hobee-data";

const CATEGORY_ITEMS = [
  { label: "ท่องเที่ยว", icon: "luggage", tone: "#FFF1C8", route: "/travel" },
  { label: "ร้านค้า", icon: "storefront", tone: "#FFF2D8", route: "/(tabs)/shop" },
  { label: "สินค้า", icon: "inventory-2", tone: "#D9FAF1", route: "/(tabs)/shop" },
  { label: "บริการ", icon: "business-center", tone: "#E0F2FE", route: "/(tabs)/discover" },
  { label: "ร้านอาหาร", icon: "restaurant", tone: "#FFF1DE", route: "/(tabs)/shop" },
  { label: "เรียนรู้", icon: "school", tone: "#E6F0FF", route: "/(tabs)/discover" },
  { label: "Opportunity", icon: "trending-up", tone: "#FFF5CC", route: "/(tabs)/discover" },
  { label: "Community", icon: "groups", tone: "#F1E8FF", route: "/(tabs)/discover" },
] as const;

const SERVICE_ITEMS = [
  { label: "จองโรงแรม", icon: "hotel", tone: "#FFF2C7" },
  { label: "รถเช่า", icon: "directions-car", tone: "#E1EDFF" },
  { label: "ดีลท่องเที่ยว", icon: "location-on", tone: "#DDF9EC" },
  { label: "ประกันเดินทาง", icon: "verified-user", tone: "#D9F8F1" },
] as const;

const COMMUNITY_ITEMS = [
  { name: "แบกกล้องเที่ยว", detail: "Creator & Reviewer", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=85&w=300" },
  { name: "Trip Family", detail: "Family Travel Club", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=85&w=300" },
  { name: "กินเที่ยว 365", detail: "Local Foodie", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=85&w=300" },
  { name: "HOBEE Guide", detail: "Verified Local Host", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=85&w=300" },
] as const;

export default function HomeScreen() {
  const { products } = useCatalog();
  const { elevated, onScroll } = useHeaderElevation();

  return (
    <ScreenContainer containerClassName="bg-[#F8F7F5]" safeAreaClassName="pt-7" edges={["top", "left", "right"]}>
      <FixedAppShell elevated={elevated} header={<AppHeader />} search={<SharedSearchBar onPress={() => router.push("/(tabs)/shop")} />}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={styles.content}>

        <View style={styles.categoryGrid}>
          {CATEGORY_ITEMS.map((item) => <SharedCategoryTile key={item.label} label={item.label} icon={item.icon} tone={item.tone} onPress={() => router.push(item.route)} />)}
        </View>

        <EcosystemHero />

        <SharedSectionHeader title="สำหรับคุณ" onPress={() => router.push("/(tabs)/shop")} />
        <View style={styles.grid}>
          {products.slice(0, 4).map((product) => <SharedProductCard key={product.id} product={product} />)}
        </View>

        <SharedSectionHeader title="ทริปน่าสนใจ" onPress={() => router.push("/(tabs)/discover")} />
        <View style={styles.grid}>
          <SharedTripCard image={hobeeStories[2].image} badge="ทริปแนะนำ" title="เที่ยวชิล เชียงใหม่ 3 วัน 2 คืน" price="฿ 4,900" onPress={() => router.push("/(tabs)/discover")} />
          <SharedTripCard image={hobeeStories[1].image} badge="ใกล้คุณ" title="คาเฟ่วิวทุ่งนา บรรยากาศดี" price="฿ 320" onPress={() => router.push("/(tabs)/discover")} />
        </View>

        <SharedSectionHeader title="บริการ & โอกาส" onPress={() => router.push("/(tabs)/discover")} />
        <View style={styles.serviceGrid}>
          {SERVICE_ITEMS.map((item) => <SharedServiceTile key={item.label} label={item.label} icon={item.icon} tone={item.tone} onPress={() => router.push("/(tabs)/discover")} />)}
        </View>

        <SharedSectionHeader title="Story & Community" onPress={() => router.push("/(tabs)/discover")} />
        <View style={styles.grid}>
          {COMMUNITY_ITEMS.map((item) => <SharedCommunityCard key={item.name} {...item} onPress={() => router.push("/(tabs)/discover")} />)}
        </View>

        <DarkEcosystemCard />
      </ScrollView>
      </FixedAppShell>
    </ScreenContainer>
  );
}

function HomeHeader({ itemCount }: { itemCount: number }) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="หน้าหลัก HOBEE" onPress={() => router.replace("/(tabs)")} style={({ pressed }) => [styles.brand, pressed && styles.pressed]}>
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>H</Text></View>
        <Text style={styles.wordmark}>HOBEE</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="เลือกตำแหน่ง" onPress={() => router.push("/(tabs)/discover")} style={({ pressed }) => [styles.locationPill, pressed && styles.pressed]}>
        <MaterialIcons name="location-on" size={19} color="#CDA244" />
        <Text style={styles.locationText}>เชียงใหม่</Text>
        <MaterialIcons name="keyboard-arrow-down" size={19} color="#9A958E" />
      </Pressable>
      <View style={styles.headerActions}>
        <Pressable accessibilityRole="button" accessibilityLabel="เปิดตะกร้า" onPress={() => router.push("/cart")} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
          <MaterialIcons name="shopping-bag" size={28} color="#211F1D" />
          {itemCount > 0 ? <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{itemCount > 9 ? "9+" : itemCount}</Text></View> : null}
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="เปิดรายการคำสั่งซื้อ" onPress={() => router.push("/orders")} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
          <MaterialIcons name="notifications-none" size={30} color="#211F1D" />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="เปิดบัญชี" onPress={() => router.push("/(tabs)/account")} style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}>
          <Image source={{ uri: COMMUNITY_ITEMS[0].image }} style={styles.avatar} />
        </Pressable>
      </View>
    </View>
  );
}

function SearchBar() {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="ค้นหาสินค้าและบริการ" onPress={() => router.push("/(tabs)/shop")} style={({ pressed }) => [styles.searchBar, pressed && styles.pressed]}>
      <MaterialIcons name="search" size={29} color="#9C9993" />
      <Text style={styles.searchPlaceholder}>ค้นหาทริป สินค้า ร้านค้า หรือบริการ</Text>
      <MaterialIcons name="keyboard-voice" size={27} color="#9C9993" />
    </Pressable>
  );
}

function CategoryTile({ label, icon, tone, route }: (typeof CATEGORY_ITEMS)[number]) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`เปิดหมวด ${label}`} onPress={() => router.push(route)} style={({ pressed }) => [styles.categoryTile, pressed && styles.pressed]}>
      <View style={[styles.categoryIcon, { backgroundColor: tone }]}><MaterialIcons name={icon} size={30} color="#1F8D70" /></View>
      <Text numberOfLines={1} style={styles.categoryLabel}>{label}</Text>
    </Pressable>
  );
}

function EcosystemHero() {
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/discover")} style={({ pressed }) => [styles.hero, pressed && styles.pressed]}>
      <ImageBackground source={{ uri: hobeeStories[1].image }} style={styles.heroImage} imageStyle={styles.heroImageRadius}>
        <View style={styles.heroOverlay}>
          <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>HOBEE PLATFORM</Text></View>
          <Text style={styles.heroTitle}>ร่วมเติบโตกับ Ecosystem HOBEE</Text>
          <Text style={styles.heroSubtitle}>เปิดโอกาสทางธุรกิจ แพลตฟอร์ม ตัวแทนชุมชน และพันธมิตรยั่งยืน</Text>
          <View style={styles.heroCta}><Text style={styles.heroCtaText}>เข้าร่วมโครงการ</Text><MaterialIcons name="arrow-forward" size={24} color="#211F1D" /></View>
          <View style={styles.pagination}><View style={styles.dot} /><View style={styles.dot} /><View style={[styles.dot, styles.activeDot]} /></View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

function SectionHeader({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleWrap}><View style={styles.goldAccent} /><Text style={styles.sectionTitle}>{title}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel={`ดูทั้งหมด ${title}`} onPress={onPress} style={({ pressed }) => [styles.seeAll, pressed && styles.pressed]}>
        <Text style={styles.seeAllText}>ดูทั้งหมด</Text><MaterialIcons name="chevron-right" size={25} color="#77716B" />
      </Pressable>
    </View>
  );
}

function CommerceCard({ product }: { product: HobeeProduct }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`ดูสินค้า ${product.shortName}`} onPress={() => router.push({ pathname: "/product/[id]", params: { id: product.id } })} style={({ pressed }) => [styles.commerceCard, pressed && styles.pressed]}>
      <Image source={{ uri: product.image }} style={styles.commerceImage} resizeMode="cover" />
      <View style={styles.commerceBody}>
        {product.badge ? <View style={styles.cardBadge}><Text style={styles.cardBadgeText}>{product.badge}</Text></View> : null}
        <Text numberOfLines={2} style={styles.commerceTitle}>{product.shortName}</Text>
        <View style={styles.priceRow}><Text style={styles.price}>{formatThaiBaht(product.price)}</Text>{product.compareAtPrice ? <Text style={styles.comparePrice}>{formatThaiBaht(product.compareAtPrice)}</Text> : null}</View>
      </View>
    </Pressable>
  );
}

function TravelCard({ image, badge, title, price }: { image: string; badge: string; title: string; price: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={() => router.push("/(tabs)/discover")} style={({ pressed }) => [styles.commerceCard, pressed && styles.pressed]}>
      <View><Image source={{ uri: image }} style={styles.commerceImage} resizeMode="cover" /><View style={styles.imageBadge}><Text style={styles.imageBadgeText}>{badge}</Text></View></View>
      <View style={styles.commerceBody}><Text numberOfLines={2} style={styles.commerceTitle}>{title}</Text><Text style={styles.price}>{price}</Text></View>
    </Pressable>
  );
}

function ServiceTile({ label, icon, tone }: (typeof SERVICE_ITEMS)[number]) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => router.push("/(tabs)/discover")} style={({ pressed }) => [styles.serviceTile, pressed && styles.pressed]}>
      <View style={[styles.serviceIcon, { backgroundColor: tone }]}><MaterialIcons name={icon} size={27} color="#267B67" /></View>
      <Text style={styles.serviceText}>{label}</Text>
    </Pressable>
  );
}

function CommunityCard({ name, detail, image }: (typeof COMMUNITY_ITEMS)[number]) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`เปิด ${name}`} onPress={() => router.push("/(tabs)/discover")} style={({ pressed }) => [styles.communityCard, pressed && styles.pressed]}>
      <View style={styles.profileRing}><Image source={{ uri: image }} style={styles.profileImage} /><View style={styles.verifyBadge}><MaterialIcons name="check" size={13} color="#FFFFFF" /></View></View>
      <Text numberOfLines={1} style={styles.communityName}>{name}</Text>
      <Text numberOfLines={1} style={styles.communityDetail}>{detail}</Text>
    </Pressable>
  );
}

function DarkEcosystemCard() {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="เริ่มต้นธุรกิจกับ HOBEE" onPress={() => router.push("/(tabs)/discover")} style={({ pressed }) => [styles.darkCard, pressed && styles.pressed]}>
      <View style={styles.darkBadge}><MaterialIcons name="auto-awesome" size={16} color="#D8B65B" /><Text style={styles.darkBadgeText}>HOBEE ECOSYSTEM</Text></View>
      <Text style={styles.darkTitle}>เป็นเจ้าของธุรกิจหรือเข้าร่วม{`\n`}Ecosystem กับ HOBEE</Text>
      <Text style={styles.darkSubtitle}>สร้างรายได้ เชื่อมต่อชุมชน ขยายโอกาสธุรกิจของคุณ เติบโตไปด้วยกันกับแพลตฟอร์มท้องถิ่น</Text>
      <View style={styles.darkCta}><Text style={styles.darkCtaText}>เริ่มต้นธุรกิจของคุณ</Text><MaterialIcons name="arrow-forward" size={24} color="#211F1D" /></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 162, backgroundColor: "#F8F7F5" },
  header: { minHeight: 70, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center", gap: 6 },
  brandMark: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: "#25211F", borderWidth: 1, borderColor: "#9B762A" },
  brandMarkText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  wordmark: { color: "#211F1D", fontSize: 26, fontWeight: "900", letterSpacing: -1.4 },
  locationPill: { height: 42, flexDirection: "row", alignItems: "center", gap: 1, borderRadius: 21, borderWidth: 1, borderColor: "#E5E1DB", backgroundColor: "#FCFBFA", paddingHorizontal: 8 },
  locationText: { color: "#3A3632", fontSize: 15, fontWeight: "700" },
  headerActions: { flexDirection: "row", alignItems: "center" },
  headerIcon: { width: 29, height: 44, alignItems: "center", justifyContent: "center" },
  cartBadge: { position: "absolute", top: 7, right: 0, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: "#D6AC48", paddingHorizontal: 3 },
  cartBadgeText: { color: "#211F1D", fontSize: 9, fontWeight: "900" },
  avatarButton: { width: 43, height: 43, overflow: "hidden", borderRadius: 22, borderWidth: 2, borderColor: "#ECE9E4", backgroundColor: "#F2F0ED", padding: 3 },
  avatar: { width: "100%", height: "100%", borderRadius: 18 },
  searchBar: { height: 58, flexDirection: "row", alignItems: "center", gap: 13, borderRadius: 30, backgroundColor: "#F1F0EE", paddingHorizontal: 18 },
  searchPlaceholder: { flex: 1, color: "#ABA6A1", fontSize: 17, fontWeight: "500" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12, marginTop: 24 },
  categoryTile: { width: "22%", height: 128, alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 22, borderWidth: 1, borderColor: "#E9E5DF", backgroundColor: "#FFFFFF", shadowColor: "#5E564D", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  categoryIcon: { width: 55, height: 55, alignItems: "center", justifyContent: "center", borderRadius: 18 },
  categoryLabel: { maxWidth: "92%", color: "#262220", fontSize: 13, fontWeight: "800", textAlign: "center" },
  hero: { height: 303, overflow: "hidden", marginTop: 24, borderRadius: 26, backgroundColor: "#282622" },
  heroImage: { flex: 1, justifyContent: "flex-end" },
  heroImageRadius: { borderRadius: 26 },
  heroOverlay: { flex: 1, justifyContent: "flex-end", padding: 22, backgroundColor: "rgba(24, 22, 18, 0.48)" },
  heroBadge: { alignSelf: "flex-start", borderRadius: 18, backgroundColor: "#D4A43D", paddingHorizontal: 14, paddingVertical: 7 },
  heroBadgeText: { color: "#211F1D", fontSize: 13, fontWeight: "900", letterSpacing: 0.4 },
  heroTitle: { maxWidth: "92%", marginTop: 13, color: "#FFFFFF", fontSize: 29, fontWeight: "900", letterSpacing: -0.8, lineHeight: 35 },
  heroSubtitle: { marginTop: 8, color: "#F1EEEA", fontSize: 14, fontWeight: "600", lineHeight: 20 },
  heroCta: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 10, marginTop: 17, borderRadius: 22, backgroundColor: "#D6AC48", paddingHorizontal: 19, paddingVertical: 12 },
  heroCtaText: { color: "#211F1D", fontSize: 16, fontWeight: "900" },
  pagination: { position: "absolute", bottom: 15, alignSelf: "center", flexDirection: "row", gap: 7 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.55)" },
  activeDot: { width: 27, backgroundColor: "#D6AC48" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 31, marginBottom: 16 },
  sectionTitleWrap: { flexDirection: "row", alignItems: "center", gap: 12 },
  goldAccent: { width: 9, height: 40, borderRadius: 5, backgroundColor: "#D3A544" },
  sectionTitle: { color: "#211F1D", fontSize: 28, fontWeight: "900", letterSpacing: -0.8 },
  seeAll: { flexDirection: "row", alignItems: "center" },
  seeAllText: { color: "#77716B", fontSize: 15, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 16 },
  commerceCard: { width: "48%", overflow: "hidden", borderRadius: 23, borderWidth: 1, borderColor: "#E9E5DF", backgroundColor: "#FFFFFF", shadowColor: "#5E564D", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.09, shadowRadius: 9, elevation: 3 },
  commerceImage: { width: "100%", height: 154, backgroundColor: "#E9E7E3" },
  commerceBody: { minHeight: 112, justifyContent: "space-between", padding: 13 },
  cardBadge: { alignSelf: "flex-start", marginBottom: 5, borderRadius: 12, backgroundColor: "#E0F1E8", paddingHorizontal: 9, paddingVertical: 4 },
  cardBadgeText: { color: "#16745F", fontSize: 10, fontWeight: "900" },
  commerceTitle: { color: "#25211F", fontSize: 16, fontWeight: "900", lineHeight: 21 },
  priceRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 10 },
  price: { color: "#211F1D", fontSize: 18, fontWeight: "900" },
  comparePrice: { color: "#A39E98", fontSize: 12, fontWeight: "600", textDecorationLine: "line-through" },
  imageBadge: { position: "absolute", top: 12, left: 12, borderRadius: 13, backgroundColor: "#197C6A", paddingHorizontal: 10, paddingVertical: 5 },
  imageBadgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  serviceGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  serviceTile: { width: "48%", minHeight: 101, flexDirection: "row", alignItems: "center", gap: 11, borderRadius: 21, borderWidth: 1, borderColor: "#E9E5DF", backgroundColor: "#FFFFFF", padding: 13, shadowColor: "#5E564D", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 7, elevation: 2 },
  serviceIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 16 },
  serviceText: { flex: 1, color: "#2A2624", fontSize: 16, fontWeight: "900", lineHeight: 20 },
  communityCard: { width: "48%", minHeight: 202, alignItems: "center", justifyContent: "center", borderRadius: 24, borderWidth: 1, borderColor: "#E9E5DF", backgroundColor: "#FFFFFF", padding: 15, shadowColor: "#5E564D", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.09, shadowRadius: 8, elevation: 3 },
  profileRing: { position: "relative", width: 91, height: 91, alignItems: "center", justifyContent: "center", borderRadius: 46, borderWidth: 5, borderColor: "#D8B047" },
  profileImage: { width: 77, height: 77, borderRadius: 39 },
  verifyBadge: { position: "absolute", right: -3, bottom: 0, width: 24, height: 24, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 2, borderColor: "#FFFFFF", backgroundColor: "#D4A43D" },
  communityName: { marginTop: 13, color: "#24211F", fontSize: 16, fontWeight: "900" },
  communityDetail: { marginTop: 4, color: "#8A847E", fontSize: 13, fontWeight: "600" },
  darkCard: { overflow: "hidden", marginTop: 31, borderRadius: 26, backgroundColor: "#242320", padding: 23, shadowColor: "#171513", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.17, shadowRadius: 18, elevation: 6 },
  darkBadge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: "#806A39", borderRadius: 18, backgroundColor: "rgba(213, 174, 74, 0.12)", paddingHorizontal: 13, paddingVertical: 8 },
  darkBadgeText: { color: "#D8B65B", fontSize: 13, fontWeight: "900", letterSpacing: 0.5 },
  darkTitle: { marginTop: 19, color: "#FFFFFF", fontSize: 28, fontWeight: "900", lineHeight: 35, letterSpacing: -0.8 },
  darkSubtitle: { marginTop: 12, color: "#D4D0CB", fontSize: 15, fontWeight: "600", lineHeight: 22 },
  darkCta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 11, marginTop: 22, borderRadius: 20, backgroundColor: "#D6AC48", paddingVertical: 15 },
  darkCtaText: { color: "#211F1D", fontSize: 16, fontWeight: "900" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
