import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { HOBEE } from "@/components/hobee/design-tokens";
import { MyHobeeHeader } from "@/components/hobee/my-hobee-ui";
import { RoleWorkspaceHero, WorkspaceNavigationCard, WorkspaceSectionHeading } from "@/components/hobee/role-workspace-ui";
import { ScreenContainer } from "@/components/screen-container";
import { getWorkspaceRole } from "@/lib/presentation-data/role-workspaces";
import { goBackOr } from "@/lib/back-navigation";

const GROUPS = [
  { title: "วันนี้และงาน", screens: ["attendance", "shifts", "tasks", "task-detail", "projects", "project-detail"] },
  { title: "คำขอและสวัสดิการ", screens: ["leave", "overtime", "advance", "expenses", "approvals", "salary"] },
  { title: "การพัฒนาและข้อมูล", screens: ["performance", "training", "announcements", "documents", "profile", "settings"] },
];

export default function EmployeeWorkspaceScreen() {
  const role = getWorkspaceRole("employee")!;
  const toScreen = (screen: string) => router.push({ pathname: "/workspace/[role]/[screen]" as never, params: { role: "employee", screen } } as never);
  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background"><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <MyHobeeHeader title="HOBEE STAFF" onBack={() => goBackOr(router, "/my-hobee")} />
    <RoleWorkspaceHero role={role} title="Employee Home" subtitle="เริ่มวันทำงาน ติดตามกะ งาน และคำขอของคุณได้จากพื้นที่เดียว" />
    <View style={styles.statusCard}><View style={styles.statusTop}><View style={styles.statusIcon}><MaterialIcons name="schedule" size={20} color={HOBEE.colors.info} /></View><View style={styles.statusText}><Text style={styles.statusTitle}>เวลาเข้างาน</Text><Text style={styles.statusSubtitle}>สถานะเชื่อมกับ attendance policy เมื่อเปิดใช้ข้อมูลจริง</Text></View></View><Pressable onPress={() => toScreen("attendance")} style={({ pressed }) => [styles.statusAction, pressed && styles.pressed]}><Text style={styles.statusActionText}>ไปที่เวลาเข้างาน</Text><MaterialIcons name="arrow-forward" size={17} color={HOBEE.colors.surface} /></Pressable></View>
    <View style={styles.quick}><Quick icon="task-alt" label="งาน" onPress={() => toScreen("tasks")} /><Quick icon="event-busy" label="ลา" onPress={() => toScreen("leave")} /><Quick icon="receipt" label="เบิก" onPress={() => toScreen("expenses")} /><Quick icon="folder" label="เอกสาร" onPress={() => toScreen("documents")} /></View>
    <View style={styles.body}>{GROUPS.map((group) => <View key={group.title} style={styles.group}><WorkspaceSectionHeading title={group.title} />{group.screens.map((id) => { const screen = role.screens.find((entry) => entry.id === id); return screen ? <WorkspaceNavigationCard key={id} screen={screen} onPress={() => toScreen(id)} /> : null; })}</View>)}</View>
  </ScrollView></ScreenContainer>;
}

function Quick({ icon, label, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}><MaterialIcons name={icon} size={20} color={HOBEE.colors.info} /><Text style={styles.quickText}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({ content: { gap: HOBEE.space.loose, paddingBottom: 42 }, statusCard: { gap: HOBEE.space.regular, marginHorizontal: HOBEE.space.page, borderRadius: HOBEE.radius.card, backgroundColor: HOBEE.atmosphere.skyMist, padding: HOBEE.space.regular }, statusTop: { flexDirection: "row", alignItems: "center", gap: 12 }, statusIcon: { alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: 21, backgroundColor: HOBEE.colors.surface }, statusText: { flex: 1, gap: 3 }, statusTitle: { color: HOBEE.colors.ink, fontSize: 14, fontWeight: "900" }, statusSubtitle: { color: HOBEE.colors.muted, fontSize: 11, fontWeight: "600", lineHeight: 16 }, statusAction: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7, borderRadius: HOBEE.radius.pill, backgroundColor: HOBEE.colors.info, paddingVertical: 11 }, statusActionText: { color: HOBEE.colors.surface, fontSize: 12, fontWeight: "900" }, quick: { flexDirection: "row", gap: 8, paddingHorizontal: HOBEE.space.page }, quickCard: { flex: 1, alignItems: "center", gap: 6, borderRadius: HOBEE.radius.medium, backgroundColor: HOBEE.colors.surface, paddingVertical: 13, ...HOBEE.elevation.surface }, quickText: { color: HOBEE.colors.ink, fontSize: 10, fontWeight: "800" }, body: { gap: HOBEE.space.section, paddingHorizontal: HOBEE.space.page }, group: { gap: HOBEE.space.compact }, pressed: { opacity: 0.78, transform: [{ scale: HOBEE.motion.pressScale }] } });
