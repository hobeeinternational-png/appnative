import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { LocalStoreCard } from "@/components/hobee/local-store-ui";
import { AppStatusState } from "@/components/hobee/error-screens";
import { HOBEE } from "@/components/hobee/design-tokens";
import { ScreenContainer } from "@/components/screen-container";
import { useLocalStorePreferences } from "@/hooks/use-local-store-preferences";
import { goBackOr } from "@/lib/back-navigation";
import { getStoreById } from "@/lib/local-stores";

type Tab = "favorites" | "recent";

export default function LocalStoreSavedScreen() {
  const [tab, setTab] = useState<Tab>("favorites");
  const { favoriteIds, recentIds, hydrated, toggleFavorite } = useLocalStorePreferences();
  const stores = useMemo(() => (tab === "favorites" ? favoriteIds : recentIds).map((id) => getStoreById(id)).filter(Boolean), [favoriteIds, recentIds, tab]);
  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background"><View style={styles.root}><View style={styles.top}><Pressable onPress={() => goBackOr(router, "/stores")} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={21} color={HOBEE.colors.ink} /></Pressable><View><Text style={styles.eyebrow}>HOBEE LOCAL</Text><Text style={styles.title}>ร้านที่บันทึกไว้</Text></View></View><View style={styles.tabs}><TabButton label="บันทึกไว้" active={tab === "favorites"} onPress={() => setTab("favorites")} /><TabButton label="ดูล่าสุด" active={tab === "recent"} onPress={() => setTab("recent")} /></View>{!hydrated ? <View style={styles.center}><Text style={styles.loading}>กำลังเปิดข้อมูลในอุปกรณ์</Text></View> : <FlatList data={stores} keyExtractor={(item) => item!.id} contentContainerStyle={styles.list} ItemSeparatorComponent={() => <View style={styles.separator} />} renderItem={({ item }) => item ? <LocalStoreCard store={item} favorite={favoriteIds.includes(item.id)} onToggleFavorite={() => toggleFavorite(item.id)} onPress={() => router.push({ pathname: "/stores/[id]", params: { id: item.id } } as never)} onPreorder={() => router.push({ pathname: "/stores/[id]/preorder", params: { id: item.id } } as never)} /> : null} ListEmptyComponent={<AppStatusState icon={tab === "favorites" ? "favorite-border" : "history"} tone="gold" title={tab === "favorites" ? "ยังไม่มีร้านที่บันทึก" : "ยังไม่มีร้านที่ดูล่าสุด"} description={tab === "favorites" ? "แตะรูปหัวใจบนการ์ดร้านเพื่อบันทึกร้านที่สนใจ" : "ร้านที่เปิดดูจะถูกเก็บไว้ในอุปกรณ์นี้"} actionLabel="สำรวจร้านค้า" onAction={() => router.replace("/stores" as never)} />} showsVerticalScrollIndicator={false} />}</View></ScreenContainer>;
}
function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}><Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text></Pressable>; }
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: HOBEE.atmosphere.canvas }, top: { flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: HOBEE.colors.border, backgroundColor: HOBEE.colors.surface, padding: 11 }, back: { alignItems: "center", justifyContent: "center", width: 37, height: 37, borderRadius: 19, backgroundColor: HOBEE.atmosphere.warmCream }, eyebrow: { color: HOBEE.colors.goldDark, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 }, title: { color: HOBEE.colors.ink, fontSize: 19, fontWeight: "900" }, tabs: { flexDirection: "row", gap: 6, alignSelf: "center", marginVertical: 14, borderRadius: 14, backgroundColor: HOBEE.atmosphere.warmCream, padding: 4 }, tab: { borderRadius: 10, paddingHorizontal: 18, paddingVertical: 9 }, tabActive: { backgroundColor: HOBEE.colors.surface, ...HOBEE.elevation.surface }, tabText: { color: HOBEE.colors.muted, fontSize: 11, fontWeight: "900" }, tabTextActive: { color: HOBEE.colors.ink }, list: { paddingHorizontal: HOBEE.space.page, paddingBottom: 40 }, separator: { height: 12 }, center: { flex: 1, alignItems: "center", justifyContent: "center" }, loading: { color: HOBEE.colors.muted, fontSize: 12, fontWeight: "800" }, pressed: { opacity: 0.78, transform: [{ scale: HOBEE.motion.pressScale }] } });
