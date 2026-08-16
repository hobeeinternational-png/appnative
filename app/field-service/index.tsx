import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { HOBEE } from "@/components/hobee/design-tokens";
import { MyHobeeHeader } from "@/components/hobee/my-hobee-ui";
import { RoleWorkspaceHero, WorkspaceNavigationCard, WorkspaceSectionHeading } from "@/components/hobee/role-workspace-ui";
import { ScreenContainer } from "@/components/screen-container";
import { getWorkspaceRole, type WorkspaceRole } from "@/lib/presentation-data/role-workspaces";
import { goBackOr } from "@/lib/back-navigation";

type FieldRole = Extract<WorkspaceRole, "guide" | "service">;
const GROUPS: Record<FieldRole, Array<{ title: string; screens: string[] }>> = {
  guide: [{ title: "งานและลูกค้า", screens: ["requests", "bookings", "booking-detail", "customers", "passengers", "meeting-point"] }, { title: "ปฏิบัติการภาคสนาม", screens: ["calendar", "availability", "job-progress", "evidence"] }, { title: "ผลงาน", screens: ["reviews", "earnings", "profile", "settings"] }],
  service: [{ title: "งานและลูกค้า", screens: ["requests", "bookings", "booking-detail", "customers", "service-profile", "location"] }, { title: "การนัดหมายและการส่งมอบ", screens: ["calendar", "availability", "job-progress", "evidence"] }, { title: "ผลงาน", screens: ["reviews", "earnings", "profile", "settings"] }],
};

export default function FieldServiceWorkspaceScreen() {
  const [active, setActive] = useState<FieldRole>("guide");
  const role = getWorkspaceRole(active)!;
  const toScreen = (screen: string) => router.push({ pathname: "/workspace/[role]/[screen]" as never, params: { role: active, screen } } as never);
  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background"><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <MyHobeeHeader title="FIELD WORK" onBack={() => goBackOr(router, "/my-hobee")} />
    <RoleWorkspaceHero role={role} title={active === "guide" ? "Guide Operations" : "Service Operations"} subtitle={active === "guide" ? "รับงานนำเที่ยว จัดการจุดนัดพบ ผู้ร่วมทริป และหลักฐานการจบงาน" : "รับงานบริการ จัดตารางนัดหมาย ลูกค้า สถานที่ และการส่งมอบ"} />
    <View style={styles.toggle}>{(["guide", "service"] as FieldRole[]).map((item) => <Pressable key={item} onPress={() => setActive(item)} style={({ pressed }) => [styles.toggleButton, item === active && styles.toggleActive, pressed && styles.pressed]}><MaterialIcons name={item === "guide" ? "explore" : "handyman"} size={18} color={item === active ? HOBEE.colors.ink : HOBEE.colors.muted} /><Text style={[styles.toggleText, item === active && styles.toggleTextActive]}>{item === "guide" ? "ไกด์" : "บริการ"}</Text></Pressable>)}</View>
    <View style={styles.quick}><Quick icon="event-available" title="ความพร้อม" subtitle="ตั้งตารางรับงาน" onPress={() => toScreen("availability")} /><Quick icon="play-circle-outline" title="เริ่มงาน" subtitle="อัปเดตสถานะงาน" onPress={() => toScreen("job-progress")} /><Quick icon="account-balance-wallet" title="รายได้" subtitle="เชื่อม ledger ภายหลัง" onPress={() => toScreen("earnings")} /></View>
    <View style={styles.body}>{GROUPS[active].map((group) => <View key={group.title} style={styles.group}><WorkspaceSectionHeading title={group.title} />{group.screens.map((id) => { const screen = role.screens.find((entry) => entry.id === id); return screen ? <WorkspaceNavigationCard key={id} screen={screen} onPress={() => toScreen(id)} /> : null; })}</View>)}</View>
  </ScrollView></ScreenContainer>;
}

function Quick({ icon, title, subtitle, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; subtitle: string; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}><MaterialIcons name={icon} size={20} color={HOBEE.colors.botanical} /><Text style={styles.quickTitle}>{title}</Text><Text style={styles.quickSubtitle}>{subtitle}</Text></Pressable>; }

const styles = StyleSheet.create({ content: { gap: HOBEE.space.loose, paddingBottom: 42 }, toggle: { flexDirection: "row", gap: 8, marginHorizontal: HOBEE.space.page }, toggleButton: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7, borderRadius: 14, backgroundColor: HOBEE.colors.surface, paddingVertical: 11, ...HOBEE.elevation.surface }, toggleActive: { backgroundColor: HOBEE.colors.gold }, toggleText: { color: HOBEE.colors.muted, fontSize: 12, fontWeight: "900" }, toggleTextActive: { color: HOBEE.colors.ink }, quick: { flexDirection: "row", gap: 8, paddingHorizontal: HOBEE.space.page }, quickCard: { flex: 1, minHeight: 112, gap: 7, borderRadius: HOBEE.radius.card, backgroundColor: HOBEE.atmosphere.botanicalMist, padding: HOBEE.space.regular }, quickTitle: { color: HOBEE.colors.ink, fontSize: 12, fontWeight: "900" }, quickSubtitle: { color: HOBEE.colors.muted, fontSize: 10, fontWeight: "600", lineHeight: 15 }, body: { gap: HOBEE.space.section, paddingHorizontal: HOBEE.space.page }, group: { gap: HOBEE.space.compact }, pressed: { opacity: 0.78, transform: [{ scale: HOBEE.motion.pressScale }] } });
