import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HOBEE } from "@/components/hobee/design-tokens";
import { MyHobeeEmptyState } from "@/components/hobee/my-hobee-ui";
import type { WorkspaceRoleContract, WorkspaceScreenContract } from "@/lib/presentation-data/role-workspaces";

type IconName = keyof typeof MaterialIcons.glyphMap;

const roleColors = {
  gold: { surface: HOBEE.atmosphere.warmCream, accent: HOBEE.colors.goldDark },
  green: { surface: HOBEE.atmosphere.botanicalMist, accent: HOBEE.colors.botanical },
  blue: { surface: HOBEE.atmosphere.skyMist, accent: HOBEE.colors.info },
  peach: { surface: HOBEE.atmosphere.peachMist, accent: HOBEE.colors.orangeSun },
  violet: { surface: HOBEE.atmosphere.rewards, accent: "#6D5BD0" },
};

export function RoleWorkspaceHero({ role, title, subtitle }: { role: WorkspaceRoleContract; title?: string; subtitle?: string }) {
  const palette = roleColors[role.color];
  return <View style={[styles.hero, { backgroundColor: palette.surface }]}>
    <View style={[styles.heroIcon, { backgroundColor: palette.accent }]}><MaterialIcons name={role.icon as IconName} size={24} color="#FFFFFF" /></View>
    <View style={styles.heroCopy}><Text style={[styles.eyebrow, { color: palette.accent }]}>{role.shortTitle.toUpperCase()}</Text><Text style={styles.heroTitle}>{title ?? role.title}</Text><Text style={styles.heroSubtitle}>{subtitle ?? role.description}</Text></View>
  </View>;
}

export function WorkspaceScreenState({ screen, onPrimaryAction }: { screen: WorkspaceScreenContract; onPrimaryAction?: () => void }) {
  return <MyHobeeEmptyState icon={screen.icon as IconName} title={screen.emptyTitle} description={screen.emptyDescription} actionLabel={screen.primaryAction} onAction={onPrimaryAction} />;
}

export function WorkspaceNavigationCard({ screen, onPress }: { screen: WorkspaceScreenContract; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={screen.title} onPress={onPress} style={({ pressed }) => [styles.navigationCard, pressed && styles.pressed]}>
    <View style={styles.navigationIcon}><MaterialIcons name={screen.icon as IconName} size={21} color={HOBEE.colors.goldDark} /></View>
    <View style={styles.navigationCopy}><Text style={styles.navigationTitle}>{screen.title}</Text><Text numberOfLines={2} style={styles.navigationSubtitle}>{screen.subtitle}</Text></View>
    <MaterialIcons name="chevron-right" size={22} color={HOBEE.colors.muted} />
  </Pressable>;
}

export function WorkspaceFormPreview({ screen, onSuccess }: { screen: WorkspaceScreenContract; onSuccess?: () => void }) {
  return <View style={styles.formCard}><View style={styles.formRow}><Text style={styles.formLabel}>ชื่อรายการ</Text><Text style={styles.formValue}>กรอกข้อมูลในขั้นตอนถัดไป</Text></View><View style={styles.divider} /><View style={styles.formRow}><Text style={styles.formLabel}>รายละเอียด</Text><Text style={styles.formValue}>Presentation contract พร้อมเชื่อมข้อมูลจริง</Text></View>{screen.primaryAction ? <Pressable onPress={onSuccess} style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}><Text style={styles.primaryActionText}>{screen.primaryAction}</Text><MaterialIcons name="arrow-forward" size={17} color={HOBEE.colors.ink} /></Pressable> : null}</View>;
}

export function WorkspaceSectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>{title}</Text>{subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}</View>;
}

const styles = StyleSheet.create({
  hero: { flexDirection: "row", gap: 12, alignItems: "flex-start", marginHorizontal: HOBEE.space.page, borderRadius: HOBEE.radius.hero, padding: HOBEE.space.loose, ...HOBEE.elevation.surface },
  heroIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 18 },
  heroCopy: { flex: 1 }, eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1 }, heroTitle: { marginTop: 3, color: HOBEE.colors.ink, fontSize: 20, fontWeight: "900" }, heroSubtitle: { marginTop: 4, color: HOBEE.colors.muted, fontSize: 12, fontWeight: "600", lineHeight: 18 },
  navigationCard: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 72, borderRadius: HOBEE.radius.card, backgroundColor: HOBEE.colors.surface, padding: HOBEE.space.regular, ...HOBEE.elevation.surface },
  navigationIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: HOBEE.atmosphere.warmCream }, navigationCopy: { flex: 1 }, navigationTitle: { color: HOBEE.colors.ink, fontSize: 14, fontWeight: "900" }, navigationSubtitle: { marginTop: 3, color: HOBEE.colors.muted, fontSize: 11, fontWeight: "600", lineHeight: 16 },
  formCard: { borderRadius: HOBEE.radius.hero, backgroundColor: HOBEE.colors.surface, padding: HOBEE.space.loose, ...HOBEE.elevation.card }, formRow: { gap: 5 }, formLabel: { color: HOBEE.colors.ink, fontSize: 13, fontWeight: "900" }, formValue: { color: HOBEE.colors.muted, fontSize: 12, fontWeight: "600", lineHeight: 18 }, divider: { height: StyleSheet.hairlineWidth, marginVertical: 14, backgroundColor: HOBEE.colors.border },
  primaryAction: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 18, borderRadius: 14, backgroundColor: HOBEE.colors.gold, paddingVertical: 12 }, primaryActionText: { color: HOBEE.colors.ink, fontSize: 13, fontWeight: "900" },
  sectionHeading: { gap: 3 }, sectionTitle: { color: HOBEE.colors.ink, fontSize: 17, fontWeight: "900" }, sectionSubtitle: { color: HOBEE.colors.muted, fontSize: 12, fontWeight: "600" }, pressed: { opacity: 0.78, transform: [{ scale: HOBEE.motion.pressScale }] },
});
