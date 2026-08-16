import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { HOBEE } from "@/components/hobee/design-tokens";
import { MyHobeeHeader } from "@/components/hobee/my-hobee-ui";
import { RoleWorkspaceHero, WorkspaceNavigationCard, WorkspaceSectionHeading } from "@/components/hobee/role-workspace-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useToast } from "@/contexts/toast-context";
import { getWorkspaceRole } from "@/lib/presentation-data/role-workspaces";
import { ORGANIZATION_ACTIVITY, ORGANIZATION_PERMISSION_GROUPS, ORGANIZATION_PRESENTATION_MEMBERS, ORGANIZATION_TABS, type OrganizationTab } from "@/lib/presentation-data/organization-ui";

export default function OrganizationWorkspaceScreen() {
  const [tab, setTab] = useState<OrganizationTab>("overview");
  const [invitationPrepared, setInvitationPrepared] = useState(false);
  const { showToast } = useToast();
  const role = getWorkspaceRole("organization")!;
  const invite = () => { setInvitationPrepared(true); showToast("เปิด presentation state สำหรับคำเชิญทีมแล้ว", "success"); };
  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background"><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <MyHobeeHeader title="ORGANIZATION" onBack={() => router.back()} />
    <RoleWorkspaceHero role={role} title="องค์กรและทีมงาน" subtitle="ศูนย์กลางการจัดการกิจการ บทบาท ทีม และสิทธิ์ในโหมด UI COMPLETE FIRST" />
    <View style={styles.tabs}>{ORGANIZATION_TABS.map((item) => <Pressable key={item.id} onPress={() => setTab(item.id)} style={({ pressed }) => [styles.tab, tab === item.id && styles.tabActive, pressed && styles.pressed]}><Text style={[styles.tabText, tab === item.id && styles.tabTextActive]}>{item.label}</Text></Pressable>)}</View>
    <View style={styles.body}>{tab === "overview" ? <Overview onInvite={invite} invitationPrepared={invitationPrepared} /> : null}{tab === "team" ? <Team onInvite={invite} /> : null}{tab === "permissions" ? <Permissions /> : null}{tab === "activity" ? <Activity /> : null}{tab === "settings" ? <Settings /> : null}</View>
  </ScrollView></ScreenContainer>;
}

function Overview({ onInvite, invitationPrepared }: { onInvite: () => void; invitationPrepared: boolean }) {
  return <><WorkspaceSectionHeading title="สถานะองค์กร" subtitle="ข้อมูลจริงขององค์กรจะเชื่อมจาก membership และ permissions ใน Phase ถัดไป" /><View style={styles.statusGrid}><Status icon="domain" label="บริบทปัจจุบัน" value="Organization workspace" /><Status icon="workspace-premium" label="สถานะผู้ดูแล" value="Owner / Manager UI" /><Status icon="groups" label="ทีมงาน" value="พร้อมจัดการสมาชิก" /></View><WorkspaceSectionHeading title="ทางลัดทีม" /><WorkspaceNavigationCard screen={{ id: "invite", title: "เชิญสมาชิกใหม่", subtitle: invitationPrepared ? "เตรียมคำเชิญแล้ว — พร้อมเชื่อม backend" : "ส่งคำเชิญและเลือกบทบาทเริ่มต้น", icon: "person-add", mode: "form", emptyTitle: "", emptyDescription: "" }} onPress={onInvite} /><WorkspaceNavigationCard screen={{ id: "permissions", title: "กำหนดสิทธิ์ทีม", subtitle: "Orders, Products, Inventory, Booking, Customers, Claims, Earnings, Staff และ Settings", icon: "admin-panel-settings", mode: "directory", emptyTitle: "", emptyDescription: "" }} onPress={() => undefined} /></>;
}

function Team({ onInvite }: { onInvite: () => void }) {
  return <><WorkspaceSectionHeading title="สมาชิกทีม" subtitle="Presentation roster — จะไม่สร้างสมาชิกจริงจนกว่าจะเชื่อม organization API" />{ORGANIZATION_PRESENTATION_MEMBERS.map((member) => <View key={member.id} style={styles.member}><View style={styles.memberIcon}><MaterialIcons name={member.icon as keyof typeof MaterialIcons.glyphMap} size={20} color={HOBEE.colors.goldDark} /></View><View style={styles.memberCopy}><Text style={styles.memberName}>{member.name}</Text><Text style={styles.memberMeta}>{member.role} · {member.status}</Text></View><MaterialIcons name="chevron-right" size={22} color={HOBEE.colors.muted} /></View>)}<Pressable onPress={onInvite} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}><MaterialIcons name="person-add" size={18} color={HOBEE.colors.ink} /><Text style={styles.primaryText}>เชิญสมาชิก</Text></Pressable></>;
}

function Permissions() {
  return <><WorkspaceSectionHeading title="สิทธิ์การทำงาน" subtitle="แสดง contract ของสิทธิ์ที่ Owner และ Manager จะกำหนดได้" />{ORGANIZATION_PERMISSION_GROUPS.map((group) => <View key={group.title} style={styles.permissionCard}><Text style={styles.permissionTitle}>{group.title}</Text><View style={styles.chips}>{group.permissions.map((permission) => <View key={permission} style={styles.chip}><Text style={styles.chipText}>{permission}</Text></View>)}</View><Text style={styles.permissionCaption}>การบันทึกสิทธิ์จริงจะผ่าน protected organization procedure</Text></View>)}</>;
}

function Activity() {
  return <><WorkspaceSectionHeading title="กิจกรรมทีม" subtitle="Audit trail จะปรากฏเมื่อมีข้อมูลจริงจากองค์กร" />{ORGANIZATION_ACTIVITY.map((item) => <View key={item.id} style={styles.activity}><View style={styles.memberIcon}><MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={20} color={HOBEE.colors.botanical} /></View><View style={styles.memberCopy}><Text style={styles.memberName}>{item.title}</Text><Text style={styles.memberMeta}>{item.description}</Text></View></View>)}</>;
}

function Settings() {
  const items = ["ข้อมูลองค์กร", "สถานะ Owner และ Manager", "นโยบายสมาชิก", "การแจ้งเตือนทีม"];
  return <><WorkspaceSectionHeading title="ตั้งค่าองค์กร" subtitle="ตั้งค่าจริงจะถูกเชื่อมหลังยืนยัน owner permission" />{items.map((item) => <View key={item} style={styles.settingsRow}><Text style={styles.memberName}>{item}</Text><MaterialIcons name="chevron-right" size={22} color={HOBEE.colors.muted} /></View>)}</>;
}

function Status({ icon, label, value }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string }) { return <View style={styles.status}><MaterialIcons name={icon} size={20} color={HOBEE.colors.goldDark} /><Text style={styles.statusLabel}>{label}</Text><Text style={styles.statusValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  content: { gap: HOBEE.space.loose, paddingBottom: 42 }, body: { gap: HOBEE.space.regular, paddingHorizontal: HOBEE.space.page }, tabs: { flexDirection: "row", marginHorizontal: HOBEE.space.page, borderRadius: HOBEE.radius.medium, backgroundColor: HOBEE.atmosphere.warmCream, padding: 4 }, tab: { flex: 1, alignItems: "center", borderRadius: 12, paddingVertical: 9 }, tabActive: { backgroundColor: HOBEE.colors.surface, ...HOBEE.elevation.surface }, tabText: { color: HOBEE.colors.muted, fontSize: 11, fontWeight: "800" }, tabTextActive: { color: HOBEE.colors.ink },
  statusGrid: { flexDirection: "row", gap: HOBEE.space.compact }, status: { flex: 1, minHeight: 112, gap: 7, borderRadius: HOBEE.radius.card, backgroundColor: HOBEE.colors.surface, padding: HOBEE.space.regular, ...HOBEE.elevation.surface }, statusLabel: { color: HOBEE.colors.muted, fontSize: 10, fontWeight: "800" }, statusValue: { color: HOBEE.colors.ink, fontSize: 12, fontWeight: "900", lineHeight: 17 },
  member: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: HOBEE.radius.card, backgroundColor: HOBEE.colors.surface, padding: HOBEE.space.regular, ...HOBEE.elevation.surface }, memberIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: HOBEE.atmosphere.warmCream }, memberCopy: { flex: 1, gap: 3 }, memberName: { color: HOBEE.colors.ink, fontSize: 13, fontWeight: "900" }, memberMeta: { color: HOBEE.colors.muted, fontSize: 11, fontWeight: "600", lineHeight: 16 },
  primary: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, backgroundColor: HOBEE.colors.gold, paddingVertical: 13 }, primaryText: { color: HOBEE.colors.ink, fontSize: 13, fontWeight: "900" }, permissionCard: { gap: 10, borderRadius: HOBEE.radius.card, backgroundColor: HOBEE.colors.surface, padding: HOBEE.space.loose, ...HOBEE.elevation.surface }, permissionTitle: { color: HOBEE.colors.ink, fontSize: 14, fontWeight: "900" }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, chip: { borderRadius: HOBEE.radius.pill, backgroundColor: HOBEE.atmosphere.botanicalMist, paddingHorizontal: 10, paddingVertical: 6 }, chipText: { color: HOBEE.colors.botanical, fontSize: 10, fontWeight: "800" }, permissionCaption: { color: HOBEE.colors.muted, fontSize: 10, fontWeight: "600", lineHeight: 15 }, activity: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderRadius: HOBEE.radius.card, backgroundColor: HOBEE.colors.surface, padding: HOBEE.space.regular, ...HOBEE.elevation.surface }, settingsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: HOBEE.radius.card, backgroundColor: HOBEE.colors.surface, padding: HOBEE.space.loose, ...HOBEE.elevation.surface }, pressed: { opacity: 0.78, transform: [{ scale: HOBEE.motion.pressScale }] },
});
