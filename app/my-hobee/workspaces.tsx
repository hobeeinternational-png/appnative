import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { HOBEE } from "@/components/hobee/design-tokens";
import { MyHobeeHeader } from "@/components/hobee/my-hobee-ui";
import { RoleWorkspaceHero, WorkspaceNavigationCard, WorkspaceSectionHeading } from "@/components/hobee/role-workspace-ui";
import { ScreenContainer } from "@/components/screen-container";
import { WORKSPACE_ROLES } from "@/lib/presentation-data/role-workspaces";

export default function MyHobeeWorkspacesScreen() {
  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background"><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><MyHobeeHeader title="WORKSPACES" onBack={() => router.back()} /><RoleWorkspaceHero role={WORKSPACE_ROLES[0]} title="พื้นที่การทำงาน" subtitle="เลือกบทบาทเพื่อดู flow การทำงานเต็มรูปแบบในโหมด UI COMPLETE FIRST" /><View style={styles.section}><WorkspaceSectionHeading title="บทบาททั้งหมด" subtitle="แต่ละ workspace มีหน้าจอ การนำทาง และ presentation states แยกชัดเจน" />{WORKSPACE_ROLES.map((role) => <WorkspaceNavigationCard key={role.id} screen={{ id: role.id, title: role.title, subtitle: role.description, icon: role.icon, mode: "dashboard", emptyTitle: "", emptyDescription: "" }} onPress={() => router.push({ pathname: "/workspace/[role]" as never, params: { role: role.id } } as never)} />)}</View></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { gap: HOBEE.space.loose, paddingBottom: 42 }, section: { gap: HOBEE.space.compact, paddingHorizontal: HOBEE.space.page } });
