import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { HOBEE } from "@/components/hobee/design-tokens";
import { MyHobeeHeader } from "@/components/hobee/my-hobee-ui";
import { RoleWorkspaceHero, WorkspaceNavigationCard, WorkspaceSectionHeading } from "@/components/hobee/role-workspace-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useToast } from "@/contexts/toast-context";
import { getWorkspaceRole, getWorkspaceScreen } from "@/lib/presentation-data/role-workspaces";
import { SELLER_DAILY_STATES, SELLER_TABS, type SellerTab } from "@/lib/presentation-data/seller-ui";

export default function SellerWorkspaceScreen() {
  const [tab, setTab] = useState<SellerTab>("operations");
  const { showToast } = useToast();
  const role = getWorkspaceRole("seller")!;
  const screens = role.screens;
  const toScreen = (screenId: string) => {
    const screen = getWorkspaceScreen("seller", screenId);
    if (!screen) return;
    router.push({ pathname: "/workspace/[role]/[screen]" as never, params: { role: "seller", screen: screen.id } } as never);
  };
  const tabScreens = useMemo(() => ({
    operations: ["orders", "order-detail", "inventory", "stock-adjustment", "claims"],
    catalog: ["products", "product-form", "inventory", "stock-adjustment"],
    customers: ["customers", "customer-detail", "claims"],
    growth: ["promotions", "coupons", "earnings"],
    more: ["earnings", "team", "store-profile", "settings", "notifications"],
  }), []);
  const selected = tabScreens[tab].map((id) => screens.find((screen) => screen.id === id)).filter(Boolean);
  const quickAction = () => showToast("เปิด presentation state สำหรับสร้างสินค้าแล้ว", "success");
  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background"><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <MyHobeeHeader title="SELLER" onBack={() => router.back()} />
    <RoleWorkspaceHero role={role} title="Seller Operations" subtitle="จัดการร้านค้าและงานประจำวันในพื้นที่เดียว — พร้อมเชื่อมข้อมูลจริงเมื่อ backend พร้อม" />
    <View style={styles.tabs}>{SELLER_TABS.map((item) => <Pressable key={item.id} onPress={() => setTab(item.id)} style={({ pressed }) => [styles.tab, tab === item.id && styles.tabActive, pressed && styles.pressed]}><Text style={[styles.tabText, tab === item.id && styles.tabTextActive]}>{item.label}</Text></Pressable>)}</View>
    <View style={styles.body}>{tab === "operations" ? <DailyState onPress={toScreen} /> : null}<WorkspaceSectionHeading title={tab === "operations" ? "เครื่องมือปฏิบัติการ" : SELLER_TABS.find((item) => item.id === tab)?.label ?? ""} subtitle="Presentation UI จะไม่แก้ข้อมูลร้านค้าจริงจนกว่าจะเชื่อม authorization และ API" />{selected.map((screen) => screen ? <WorkspaceNavigationCard key={screen.id} screen={screen} onPress={() => screen.id === "product-form" ? quickAction() : toScreen(screen.id)} /> : null)}</View>
  </ScrollView></ScreenContainer>;
}

function DailyState({ onPress }: { onPress: (screen: string) => void }) {
  const mappings = ["orders", "inventory", "claims"];
  return <View style={styles.dailyGrid}>{SELLER_DAILY_STATES.map((item, index) => <Pressable key={item.label} onPress={() => onPress(mappings[index])} style={({ pressed }) => [styles.dailyCard, pressed && styles.pressed]}><View style={styles.dailyIcon}><MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={20} color={HOBEE.colors.goldDark} /></View><Text style={styles.dailyLabel}>{item.label}</Text><Text style={styles.dailyDetail}>{item.detail}</Text></Pressable>)}</View>;
}

const styles = StyleSheet.create({
  content: { gap: HOBEE.space.loose, paddingBottom: 42 }, body: { gap: HOBEE.space.regular, paddingHorizontal: HOBEE.space.page }, tabs: { flexDirection: "row", marginHorizontal: HOBEE.space.page, borderRadius: HOBEE.radius.medium, backgroundColor: HOBEE.atmosphere.warmCream, padding: 4 }, tab: { flex: 1, alignItems: "center", borderRadius: 12, paddingVertical: 9 }, tabActive: { backgroundColor: HOBEE.colors.surface, ...HOBEE.elevation.surface }, tabText: { color: HOBEE.colors.muted, fontSize: 11, fontWeight: "800" }, tabTextActive: { color: HOBEE.colors.ink }, dailyGrid: { flexDirection: "row", gap: HOBEE.space.compact }, dailyCard: { flex: 1, minHeight: 128, gap: 7, borderRadius: HOBEE.radius.card, backgroundColor: HOBEE.colors.surface, padding: HOBEE.space.regular, ...HOBEE.elevation.surface }, dailyIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: HOBEE.atmosphere.warmCream }, dailyLabel: { color: HOBEE.colors.ink, fontSize: 12, fontWeight: "900" }, dailyDetail: { color: HOBEE.colors.muted, fontSize: 10, fontWeight: "600", lineHeight: 15 }, pressed: { opacity: 0.78, transform: [{ scale: HOBEE.motion.pressScale }] },
});
