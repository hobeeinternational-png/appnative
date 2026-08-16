import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { GlobalErrorState } from "@/components/hobee/error-screens";
import { HOBEE } from "@/components/hobee/design-tokens";
import { MyHobeeHeader } from "@/components/hobee/my-hobee-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { isHobeeNotificationRoute } from "@/lib/deep-links";
import { loadMyNotifications, markMyHobeeNotificationRead, type MyHobeeNotification } from "@/lib/my-hobee-phase2";
import { goBackOr } from "@/lib/back-navigation";

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>(); const { user } = useSupabaseAuth(); const [item, setItem] = useState<MyHobeeNotification | null>(null); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { if (!user || !id) { setLoading(false); return; } setLoading(true); try { const found = (await loadMyNotifications(user.id)).find((entry) => entry.id === id) ?? null; setItem(found); if (found && !found.is_read) await markMyHobeeNotificationRead(found.id); } finally { setLoading(false); } }, [id, user]);
  useEffect(() => { void load(); }, [load]);
  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background"><MyHobeeHeader title="NOTIFICATION" onBack={() => goBackOr(router, "/my-hobee/notifications")} />{loading ? <View style={styles.center}><ActivityIndicator color={HOBEE.colors.goldDark} /></View> : !item ? <View style={styles.center}><GlobalErrorState actionLabel="ลองใหม่" onAction={() => void load()} /></View> : <ScrollView contentContainerStyle={styles.content}><View style={styles.icon}><MaterialIcons name="notifications" size={25} color={HOBEE.colors.goldDark} /></View><Text style={styles.title}>{item.title}</Text><Text style={styles.date}>{formatDate(item.created_at)}</Text><View style={styles.message}><Text style={styles.body}>{item.body ?? "มีการอัปเดตใหม่ในบัญชี HOBEE ของคุณ"}</Text></View>{isHobeeNotificationRoute(item.route) ? <Pressable onPress={() => router.push(item.route as never)} style={({ pressed }) => [styles.action, pressed && styles.pressed]}><Text style={styles.actionText}>ดำเนินการต่อ</Text><MaterialIcons name="arrow-forward" size={17} color={HOBEE.colors.surface} /></Pressable> : null}</ScrollView>}</ScreenContainer>;
}
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(date); }
const styles = StyleSheet.create({ center: { flex: 1, justifyContent: "center" }, content: { alignItems: "center", gap: 10, padding: HOBEE.space.page, paddingTop: 48 }, icon: { width: 58, height: 58, alignItems: "center", justifyContent: "center", borderRadius: 29, backgroundColor: HOBEE.atmosphere.warmCream }, title: { color: HOBEE.colors.ink, fontSize: 20, fontWeight: "900", textAlign: "center" }, date: { color: HOBEE.colors.muted, fontSize: 11, fontWeight: "700" }, message: { width: "100%", marginTop: 14, borderRadius: HOBEE.radius.card, backgroundColor: HOBEE.colors.surface, padding: HOBEE.space.page, ...HOBEE.elevation.surface }, body: { color: HOBEE.colors.ink, fontSize: 14, fontWeight: "600", lineHeight: 22 }, action: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", marginTop: 10, borderRadius: HOBEE.radius.pill, backgroundColor: HOBEE.colors.goldDark, paddingVertical: 13 }, actionText: { color: HOBEE.colors.surface, fontSize: 13, fontWeight: "900" }, pressed: { opacity: 0.78, transform: [{ scale: HOBEE.motion.pressScale }] } });
