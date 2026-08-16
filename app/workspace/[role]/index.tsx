import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { RoleWorkspaceHero, WorkspaceNavigationCard, WorkspaceSectionHeading } from "@/components/hobee/role-workspace-ui";
import { ScreenContainer } from "@/components/screen-container";
import { MyHobeeHeader, MyHobeeEmptyState } from "@/components/hobee/my-hobee-ui";
import { HOBEE } from "@/components/hobee/design-tokens";
import { getWorkspaceRole } from "@/lib/presentation-data/role-workspaces";
import { goBackOr } from "@/lib/back-navigation";

export default function RoleWorkspaceIndexScreen() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const workspace = getWorkspaceRole(role);
  if (!workspace) return <ScreenContainer><MyHobeeEmptyState title="ไม่พบบทบาทนี้" description="กรุณาเลือกพื้นที่ทำงานจาก My HOBEE อีกครั้ง" actionLabel="กลับไป My HOBEE" onAction={() => router.replace("/my-hobee" as never)} /></ScreenContainer>;
  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background"><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><MyHobeeHeader title={workspace.shortTitle} onBack={() => goBackOr(router, "/my-hobee")} /><RoleWorkspaceHero role={workspace} /><View style={styles.section}><WorkspaceSectionHeading title="เครื่องมือการทำงาน" subtitle="ทุกหน้าพร้อม navigation และ presentation states" />{workspace.screens.map((screen) => <WorkspaceNavigationCard key={screen.id} screen={screen} onPress={() => workspace.id === "organization" ? router.push("/organization" as never) : workspace.id === "seller" ? router.push("/seller" as never) : workspace.id === "hotel" || workspace.id === "tour" ? router.push("/hospitality" as never) : workspace.id === "creator" || workspace.id === "affiliate" || workspace.id === "teacher" ? router.push("/creative" as never) : workspace.id === "guide" || workspace.id === "service" ? router.push("/field-service" as never) : workspace.id === "employee" ? router.push("/employee" as never) : router.push({ pathname: "/workspace/[role]/[screen]" as never, params: { role: workspace.id, screen: screen.id } } as never)} />)}</View></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { gap: HOBEE.space.loose, paddingBottom: 42 }, section: { gap: HOBEE.space.compact, paddingHorizontal: HOBEE.space.page } });
