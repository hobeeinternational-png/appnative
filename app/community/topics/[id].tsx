import { router, useLocalSearchParams, type Href } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { CommunityRecommendationCard } from "@/components/hobee/community-ui";
import { HOBEE } from "@/components/hobee/design-tokens";
import { ScreenContainer } from "@/components/screen-container";
import { COMMUNITY_RECOMMENDATIONS } from "@/lib/community-hub";

export default function CommunityTopicScreen() { const { id } = useLocalSearchParams<{ id: string }>(); const topic = decodeURIComponent(id ?? "topic"); return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background"><View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><MaterialIcons name="arrow-back" size={22} color={HOBEE.colors.ink} /></Pressable><View><Text style={styles.eyebrow}>COMMUNITY TOPIC</Text><Text style={styles.title}>#{topic}</Text></View></View><FlatList data={COMMUNITY_RECOMMENDATIONS} keyExtractor={(item) => item.id} contentContainerStyle={styles.content} renderItem={({ item }) => <CommunityRecommendationCard item={item} onPress={() => router.push(item.route as Href)} />} /></ScreenContainer>; }
const styles = StyleSheet.create({ header: { flexDirection: "row", alignItems: "center", gap: 11, padding: HOBEE.space.page }, back: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 21, backgroundColor: HOBEE.colors.surface }, eyebrow: { color: HOBEE.colors.goldDark, fontSize: 9, fontWeight: "900", letterSpacing: 0.7 }, title: { color: HOBEE.colors.ink, fontSize: 20, fontWeight: "900", marginTop: 2 }, content: { paddingHorizontal: HOBEE.space.page, paddingBottom: 42 } });
