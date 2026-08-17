import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { HOBEE } from "@/components/hobee/design-tokens";

const OFFICIAL_HOBEE_MARK = require("../../assets/images/hobee-official-mark.png");

export type MyHobeeSection = "overview" | "roles" | "work" | "earnings";

const sections: Array<{ key: MyHobeeSection; label: string; route: string }> = [
  { key: "overview", label: "ภาพรวม", route: "/my-hobee" },
  { key: "roles", label: "บทบาท", route: "/my-hobee/roles" },
  { key: "work", label: "งาน", route: "/my-hobee/work" },
  { key: "earnings", label: "รายได้", route: "/my-hobee/earnings" },
];

export function MyHobeeHeader({ title, onBack, notificationCount = 0, onNotifications }: { title?: string; onBack?: () => void; notificationCount?: number; onNotifications?: () => void }) {
  return <View style={styles.header}>
    <View style={styles.headerLeft}>{onBack ? <Pressable accessibilityLabel="ย้อนกลับ" onPress={onBack} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={23} color="#FFFFFF" /></Pressable> : <View style={styles.markShell}><Image source={OFFICIAL_HOBEE_MARK} style={styles.mark} resizeMode="contain" /></View>}<View><Text style={styles.wordmark}>HOBEE</Text><Text style={styles.subtitle}>{title ?? "MY HOBEE"}</Text></View></View>
    <View style={styles.headerRight}><Pressable disabled accessibilityState={{ disabled: true }} accessibilityLabel="สแกน QR HOBEE ยังไม่พร้อมใช้งาน" style={[styles.iconButton, { opacity: 0.48 }]}><MaterialIcons name="qr-code-scanner" size={22} color="#FFFFFF" /></Pressable><Pressable accessibilityLabel="การแจ้งเตือน" onPress={onNotifications ?? (() => router.push("/my-hobee/notifications" as never))} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><MaterialIcons name="notifications-none" size={23} color="#FFFFFF" />{notificationCount > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{Math.min(notificationCount, 99)}</Text></View> : null}</Pressable></View>
  </View>;
}

export function MyHobeeSegments({ active }: { active: MyHobeeSection }) {
  return <View style={styles.segments}>{sections.map((section) => <Pressable key={section.key} onPress={() => { if (active !== section.key) router.replace(section.route as never); }} style={({ pressed }) => [styles.segment, active === section.key && styles.segmentActive, pressed && styles.pressed]}><Text style={[styles.segmentText, active === section.key && styles.segmentTextActive]}>{section.label}</Text></Pressable>)}</View>;
}

export function MyHobeeEmptyState({ icon = "inbox", title, description, actionLabel, onAction }: { icon?: keyof typeof MaterialIcons.glyphMap; title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return <View style={styles.empty}><View style={styles.emptyIcon}><MaterialIcons name={icon} size={26} color={HOBEE.colors.goldDark} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyDescription}>{description}</Text>{actionLabel && onAction ? <Pressable onPress={onAction} style={({ pressed }) => [styles.emptyAction, pressed && styles.pressed]}><Text style={styles.emptyActionText}>{actionLabel}</Text><MaterialIcons name="arrow-forward" size={16} color={HOBEE.colors.ink} /></Pressable> : null}</View>;
}

export function formatHobeeCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(value);
}

export function formatHobeeCount(value: number) {
  return new Intl.NumberFormat("th-TH").format(value);
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 50, paddingHorizontal: HOBEE.space.page },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 9 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  markShell: { width: 37, height: 37, alignItems: "center", justifyContent: "center", borderRadius: 19, backgroundColor: "rgba(255,255,255,0.12)" },
  mark: { width: 27, height: 27 }, wordmark: { color: "#FFFFFF", fontSize: 17, fontWeight: "900", letterSpacing: 0.7 }, subtitle: { marginTop: -1, color: "#E9DCA9", fontSize: 9, fontWeight: "900", letterSpacing: 1.3 },
  iconButton: { position: "relative", width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: "rgba(255,255,255,0.10)" },
  badge: { position: "absolute", right: 5, top: 5, minWidth: 14, height: 14, alignItems: "center", justifyContent: "center", borderRadius: 7, backgroundColor: HOBEE.colors.gold, paddingHorizontal: 3 }, badgeText: { color: HOBEE.colors.ink, fontSize: 8, fontWeight: "900" },
  segments: { flexDirection: "row", gap: 4, marginHorizontal: HOBEE.space.page, padding: 4, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.12)" },
  segment: { flex: 1, alignItems: "center", borderRadius: 13, paddingVertical: 9 }, segmentActive: { backgroundColor: HOBEE.colors.gold }, segmentText: { color: "rgba(255,255,255,0.78)", fontSize: 12, fontWeight: "800" }, segmentTextActive: { color: HOBEE.colors.ink },
  empty: { alignItems: "center", borderRadius: HOBEE.radius.hero, backgroundColor: HOBEE.overlay.glass, paddingHorizontal: 22, paddingVertical: 26, ...HOBEE.elevation.card },
  emptyIcon: { width: 54, height: 54, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: HOBEE.atmosphere.warmCream }, emptyTitle: { marginTop: 12, color: HOBEE.colors.ink, fontSize: 16, fontWeight: "900" }, emptyDescription: { marginTop: 5, color: HOBEE.colors.muted, fontSize: 12, fontWeight: "600", textAlign: "center", lineHeight: 18 },
  emptyAction: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 15, borderRadius: 12, backgroundColor: HOBEE.colors.gold, paddingHorizontal: 12, paddingVertical: 9 }, emptyActionText: { color: HOBEE.colors.ink, fontSize: 12, fontWeight: "900" }, pressed: { opacity: 0.78, transform: [{ scale: HOBEE.motion.pressScale }] },
});
