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

type CreativeRole = Extract<WorkspaceRole, "creator" | "affiliate" | "teacher">;

const ROLE_LABELS: Record<CreativeRole, string> = { creator: "ครีเอเตอร์", affiliate: "Affiliate", teacher: "ผู้สอน" };
const CREATIVE_GROUPS: Record<CreativeRole, Array<{ title: string; screens: string[] }>> = {
  creator: [{ title: "งานสร้างสรรค์", screens: ["jobs", "job-offers", "job-detail", "brief", "work-progress", "upload", "submit", "revisions", "approved"] }, { title: "ผลงานและการเติบโต", screens: ["portfolio", "analytics", "earnings", "profile", "settings"] }],
  affiliate: [{ title: "โปรโมตและแชร์", screens: ["products", "product-detail", "generate-link", "generate-code", "share-center", "campaigns"] }, { title: "ผลลัพธ์", screens: ["clicks", "orders", "commission", "performance", "profile"] }],
  teacher: [{ title: "คอร์สและการสอน", screens: ["courses", "course-detail", "course-form", "lessons", "students", "enrollment", "schedule", "class-detail"] }, { title: "ผลการเรียน", screens: ["attendance", "assignments", "progress", "reviews", "earnings", "profile", "settings"] }],
};

export default function CreativeWorkspaceScreen() {
  const [active, setActive] = useState<CreativeRole>("creator");
  const role = getWorkspaceRole(active)!;
  const toScreen = (screen: string) => router.push({ pathname: "/workspace/[role]/[screen]" as never, params: { role: active, screen } } as never);
  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background"><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <MyHobeeHeader title="CREATIVE" onBack={() => goBackOr(router, "/my-hobee")} />
    <RoleWorkspaceHero role={role} title={role.title} subtitle={role.description} />
    <View style={styles.switcher}>{(["creator", "affiliate", "teacher"] as CreativeRole[]).map((item) => <Pressable key={item} onPress={() => setActive(item)} style={({ pressed }) => [styles.switcherButton, active === item && styles.switcherActive, pressed && styles.pressed]}><MaterialIcons name={getWorkspaceRole(item)!.icon as keyof typeof MaterialIcons.glyphMap} size={16} color={active === item ? HOBEE.colors.ink : HOBEE.colors.muted} /><Text style={[styles.switcherText, active === item && styles.switcherTextActive]}>{ROLE_LABELS[item]}</Text></Pressable>)}</View>
    <View style={styles.summary}><Summary icon="task-alt" title={active === "creator" ? "Work Flow" : active === "affiliate" ? "Promotion Flow" : "Learning Flow"} subtitle="ทุกขั้นมี navigation และ presentation state" /><Summary icon="account-balance-wallet" title="Earnings" subtitle="ไม่มีการแสดงยอดจำลองจนกว่าจะมี ledger จริง" /></View>
    <View style={styles.body}>{CREATIVE_GROUPS[active].map((group) => <View key={group.title} style={styles.group}><WorkspaceSectionHeading title={group.title} />{group.screens.map((id) => { const screen = role.screens.find((entry) => entry.id === id); return screen ? <WorkspaceNavigationCard key={id} screen={screen} onPress={() => toScreen(id)} /> : null; })}</View>)}</View>
  </ScrollView></ScreenContainer>;
}

function Summary({ icon, title, subtitle }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; subtitle: string }) { return <View style={styles.summaryCard}><MaterialIcons name={icon} size={21} color={HOBEE.colors.goldDark} /><Text style={styles.summaryTitle}>{title}</Text><Text style={styles.summaryText}>{subtitle}</Text></View>; }

const styles = StyleSheet.create({ content: { gap: HOBEE.space.loose, paddingBottom: 42 }, switcher: { flexDirection: "row", gap: 6, marginHorizontal: HOBEE.space.page, padding: 4, borderRadius: HOBEE.radius.medium, backgroundColor: HOBEE.atmosphere.warmCream }, switcherButton: { flex: 1, alignItems: "center", gap: 4, borderRadius: 12, paddingVertical: 9 }, switcherActive: { backgroundColor: HOBEE.colors.surface, ...HOBEE.elevation.surface }, switcherText: { color: HOBEE.colors.muted, fontSize: 10, fontWeight: "800" }, switcherTextActive: { color: HOBEE.colors.ink }, summary: { flexDirection: "row", gap: 8, paddingHorizontal: HOBEE.space.page }, summaryCard: { flex: 1, minHeight: 116, gap: 7, borderRadius: HOBEE.radius.card, backgroundColor: HOBEE.atmosphere.peachMist, padding: HOBEE.space.regular }, summaryTitle: { color: HOBEE.colors.ink, fontSize: 12, fontWeight: "900" }, summaryText: { color: HOBEE.colors.muted, fontSize: 10, fontWeight: "600", lineHeight: 15 }, body: { gap: HOBEE.space.section, paddingHorizontal: HOBEE.space.page }, group: { gap: HOBEE.space.compact }, pressed: { opacity: 0.78, transform: [{ scale: HOBEE.motion.pressScale }] } });
