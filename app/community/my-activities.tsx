import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, type Href } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { CommunityActivityCard } from "@/components/hobee/community-ui";
import { AppStatusState } from "@/components/hobee/error-screens";
import { HOBEE } from "@/components/hobee/design-tokens";
import { ScreenContainer } from "@/components/screen-container";
import { COMMUNITY_ACTIVITIES } from "@/lib/community-hub";

export default function CommunityMyActivitiesScreen() { const joined = COMMUNITY_ACTIVITIES.filter((item) => item.joinState === "joined" || item.joinState === "waitlist"); return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background"><View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><MaterialIcons name="arrow-back" size={22} color={HOBEE.colors.ink} /></Pressable><Text style={styles.title}>กิจกรรมของฉัน</Text><View style={styles.back} /></View>{joined.length ? <FlatList data={joined} keyExtractor={(item) => item.id} contentContainerStyle={styles.content} renderItem={({ item }) => <CommunityActivityCard activity={item} onPress={() => router.push(`/community/activities/${item.id}` as Href)} />} /> : <AppStatusState title="ยังไม่มีกิจกรรมที่บันทึกไว้" description="กิจกรรมที่เข้าร่วมและคิวรอจะแสดงที่นี่เมื่อ Community event source พร้อม" actionLabel="ดูกิจกรรม" onAction={() => router.replace("/community/activities" as Href)} />}</ScreenContainer>; }
const styles = StyleSheet.create({ header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: HOBEE.space.page }, back: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 21, backgroundColor: HOBEE.colors.surface }, title: { color: HOBEE.colors.ink, fontSize: 18, fontWeight: "900" }, content: { paddingHorizontal: HOBEE.space.page, paddingBottom: 42 } });
