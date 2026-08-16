import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { HOBEE } from "@/components/hobee/design-tokens";
import { MyHobeeHeader } from "@/components/hobee/my-hobee-ui";
import { RoleWorkspaceHero, WorkspaceFormPreview, WorkspaceScreenState, WorkspaceSectionHeading } from "@/components/hobee/role-workspace-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useToast } from "@/contexts/toast-context";
import { getWorkspaceRole, getWorkspaceScreen } from "@/lib/presentation-data/role-workspaces";

export default function RoleWorkspaceDetailScreen() {
  const { role, screen } = useLocalSearchParams<{ role?: string; screen?: string }>();
  const workspace = getWorkspaceRole(role);
  const contract = getWorkspaceScreen(role, screen);
  const [interactionConfirmed, setInteractionConfirmed] = useState(false);
  const { showToast } = useToast();
  if (!workspace || !contract) return <ScreenContainer><Text style={styles.missing}>ไม่พบหน้าที่เลือก</Text></ScreenContainer>;
  const handlePrimaryAction = () => { setInteractionConfirmed(true); showToast(`${contract.primaryAction ?? "การดำเนินการ"} ถูกบันทึกเป็น presentation state แล้ว`, "success"); };
  const isForm = contract.mode === "form";
  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background"><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><MyHobeeHeader title={workspace.shortTitle} onBack={() => router.back()} /><RoleWorkspaceHero role={workspace} title={contract.title} subtitle={contract.subtitle} /><View style={styles.body}><WorkspaceSectionHeading title={contract.mode === "analytics" ? "ภาพรวมแบบ Presentation" : "พื้นที่การทำงาน"} subtitle={contract.integrationNote} />{isForm ? <WorkspaceFormPreview screen={contract} onSuccess={handlePrimaryAction} /> : <WorkspaceScreenState screen={contract} onPrimaryAction={handlePrimaryAction} />}{interactionConfirmed ? <View style={styles.success}><Text style={styles.successTitle}>พร้อมเชื่อมข้อมูลจริง</Text><Text style={styles.successText}>UI interaction และ success state ทำงานแล้ว โดยจะไม่สร้างหรือแก้ข้อมูลธุรกิจจนกว่าจะเชื่อม backend ใน Phase ถัดไป</Text></View> : null}</View></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { gap: HOBEE.space.loose, paddingBottom: 42 }, body: { gap: HOBEE.space.regular, paddingHorizontal: HOBEE.space.page }, missing: { padding: 24, color: HOBEE.colors.ink }, success: { borderRadius: HOBEE.radius.card, backgroundColor: HOBEE.atmosphere.botanicalMist, padding: HOBEE.space.loose }, successTitle: { color: HOBEE.colors.botanical, fontSize: 14, fontWeight: "900" }, successText: { marginTop: 4, color: HOBEE.colors.ink, fontSize: 12, fontWeight: "600", lineHeight: 18 } });
