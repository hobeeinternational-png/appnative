import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { HOBEE } from "@/components/hobee/design-tokens";
import { MyHobeeHeader } from "@/components/hobee/my-hobee-ui";
import { RoleWorkspaceHero, WorkspaceNavigationCard, WorkspaceSectionHeading } from "@/components/hobee/role-workspace-ui";
import { ScreenContainer } from "@/components/screen-container";
import { getWorkspaceRole } from "@/lib/presentation-data/role-workspaces";
import { goBackOr } from "@/lib/back-navigation";

type HospitalityMode = "hotel" | "tour";

const hotelGroups = [
  { title: "การจองและเข้าพัก", screens: ["booking-inbox", "bookings", "booking-detail", "check-in", "check-out", "guests"] },
  { title: "ห้องพักและราคา", screens: ["calendar", "rooms", "room-detail", "room-form", "availability", "pricing"] },
  { title: "ธุรกิจที่พัก", screens: ["reviews", "earnings", "staff", "profile", "settings"] },
];

const tourGroups = [
  { title: "ทริปและการจอง", screens: ["packages", "package-detail", "package-form", "departures", "bookings", "booking-detail"] },
  { title: "ปฏิบัติการเดินทาง", screens: ["passengers", "check-in", "meeting-point", "trip-status", "customers"] },
  { title: "ธุรกิจทัวร์", screens: ["reviews", "earnings", "staff", "profile", "settings"] },
];

export default function HospitalityWorkspaceScreen() {
  const [mode, setMode] = useState<HospitalityMode>("hotel");
  const role = getWorkspaceRole(mode)!;
  const groups = mode === "hotel" ? hotelGroups : tourGroups;
  const toScreen = (id: string) => router.push({ pathname: "/workspace/[role]/[screen]" as never, params: { role: mode, screen: id } } as never);
  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background"><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <MyHobeeHeader title="HOSPITALITY" onBack={() => goBackOr(router, "/my-hobee")} />
    <RoleWorkspaceHero role={role} title={mode === "hotel" ? "Hotel Operations" : "Tour Operations"} subtitle={mode === "hotel" ? "บริหารการจอง ห้องพัก แขก และงานหน้าที่พักจากพื้นที่เดียว" : "จัดการแพ็กเกจ รอบเดินทาง ผู้โดยสาร และงานภาคสนามจากพื้นที่เดียว"} />
    <View style={styles.modeControl}>{(["hotel", "tour"] as HospitalityMode[]).map((item) => <Pressable key={item} onPress={() => setMode(item)} style={({ pressed }) => [styles.modeButton, mode === item && styles.modeButtonActive, pressed && styles.pressed]}><MaterialIcons name={item === "hotel" ? "hotel" : "luggage"} size={17} color={mode === item ? HOBEE.colors.ink : HOBEE.colors.muted} /><Text style={[styles.modeText, mode === item && styles.modeTextActive]}>{item === "hotel" ? "โรงแรม" : "ทัวร์"}</Text></Pressable>)}</View>
    <View style={styles.summary}><Summary icon={mode === "hotel" ? "calendar-month" : "event"} title={mode === "hotel" ? "Booking Calendar" : "Departure Schedule"} subtitle="พร้อมเปิดมุมมองตารางและรายการรายละเอียด" onPress={() => toScreen(mode === "hotel" ? "calendar" : "departures")} /><Summary icon="groups" title={mode === "hotel" ? "Guest Operations" : "Passenger Operations"} subtitle="จัดการข้อมูลผู้เข้าพักหรือผู้ร่วมเดินทาง" onPress={() => toScreen(mode === "hotel" ? "guests" : "passengers")} /></View>
    <View style={styles.body}>{groups.map((group) => <View key={group.title} style={styles.group}><WorkspaceSectionHeading title={group.title} />{group.screens.map((id) => { const screen = role.screens.find((entry) => entry.id === id); return screen ? <WorkspaceNavigationCard key={id} screen={screen} onPress={() => toScreen(id)} /> : null; })}</View>)}</View>
  </ScrollView></ScreenContainer>;
}

function Summary({ icon, title, subtitle, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; subtitle: string; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.summaryCard, pressed && styles.pressed]}><MaterialIcons name={icon} size={22} color={HOBEE.colors.travelTeal} /><Text style={styles.summaryTitle}>{title}</Text><Text style={styles.summaryText}>{subtitle}</Text><MaterialIcons name="arrow-forward" size={17} color={HOBEE.colors.travelTeal} /></Pressable>; }

const styles = StyleSheet.create({ content: { gap: HOBEE.space.loose, paddingBottom: 42 }, modeControl: { flexDirection: "row", gap: 8, marginHorizontal: HOBEE.space.page }, modeButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 14, backgroundColor: HOBEE.colors.surface, paddingVertical: 11, ...HOBEE.elevation.surface }, modeButtonActive: { backgroundColor: HOBEE.colors.gold }, modeText: { color: HOBEE.colors.muted, fontSize: 12, fontWeight: "900" }, modeTextActive: { color: HOBEE.colors.ink }, summary: { flexDirection: "row", gap: 8, paddingHorizontal: HOBEE.space.page }, summaryCard: { flex: 1, minHeight: 128, gap: 7, borderRadius: HOBEE.radius.card, backgroundColor: HOBEE.atmosphere.skyMist, padding: HOBEE.space.regular }, summaryTitle: { color: HOBEE.colors.ink, fontSize: 12, fontWeight: "900" }, summaryText: { color: HOBEE.colors.muted, fontSize: 10, fontWeight: "600", lineHeight: 15 }, body: { gap: HOBEE.space.section, paddingHorizontal: HOBEE.space.page }, group: { gap: HOBEE.space.compact }, pressed: { opacity: 0.78, transform: [{ scale: HOBEE.motion.pressScale }] } });
