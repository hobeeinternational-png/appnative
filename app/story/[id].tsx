import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";

import { PrimaryButton } from "@/components/hobee/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { hobeeStories } from "@/lib/hobee-data";
import { HOBEE } from "@/components/hobee/design-tokens";
import { useCommunityPreferences } from "@/contexts/community-preferences-context";
import { COMMUNITY_REPORT_REASONS, COMMUNITY_STORIES } from "@/lib/community-hub";

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = hobeeStories.find((item) => item.id === id) ?? hobeeStories[0];
  const communityStory = COMMUNITY_STORIES.find((item) => item.id === story.id);
  const { savedIds, toggleSaved } = useCommunityPreferences();
  const [showReport, setShowReport] = useState(false);
  const [comment, setComment] = useState("");
  const saved = savedIds.includes(story.id);

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View className="relative">
          <Image source={{ uri: story.image }} className="h-[330px] w-full bg-[#EEE6D6]" resizeMode="cover" />
          <Pressable accessibilityRole="button" accessibilityLabel="ย้อนกลับ" onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
            <MaterialIcons name="arrow-back" size={23} color="#17352A" />
          </Pressable>
          <View style={styles.heroActions}><Pressable onPress={() => toggleSaved(story.id)} style={styles.heroAction}><MaterialIcons name={saved ? "bookmark" : "bookmark-border"} size={21} color={HOBEE.colors.ink} /></Pressable><Pressable onPress={() => setShowReport((current) => !current)} style={styles.heroAction}><MaterialIcons name="more-horiz" size={22} color={HOBEE.colors.ink} /></Pressable></View>
        </View>
        <View className="-mt-5 rounded-t-[28px] bg-background px-5 pb-9 pt-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-[10px] font-bold tracking-[1.2px] text-primary">{story.label}</Text>
            <Text className="text-xs text-muted">{story.readTime}</Text>
          </View>
          <Text className="mt-3 text-[27px] font-black leading-9 text-foreground">{story.title}</Text>
          <Text className="mt-4 text-base leading-7 text-muted">{story.description}</Text>
          <Text className="mt-5 text-base leading-7 text-muted">
            HOBEE ตั้งใจเชื่อมต่อผู้คนกับของดีและผู้ผลิตในท้องถิ่น ผ่านเรื่องราวที่ทำให้การเลือกซื้อมีความหมายมากขึ้น ทุกการสนับสนุนช่วยให้ความรู้และงานฝีมือในชุมชนเดินหน้าต่อได้อย่างยั่งยืน
          </Text>
          {communityStory ? <><View style={styles.author}><Image source={{ uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=85" }} style={styles.authorAvatar} /><View style={styles.authorCopy}><Text style={styles.authorName}>HOBEE Community Contributor</Text><Text style={styles.authorMeta}>{communityStory.tags.join(" ")}</Text></View><Pressable onPress={() => router.push("/community/people/creator-nisa" as never)} style={styles.follow}><Text style={styles.followText}>ติดตาม</Text></Pressable></View><View style={styles.related}><Text style={styles.relatedTitle}>เชื่อมต่อกับ HOBEE</Text>{communityStory.references.map((reference) => <Pressable key={reference.id} onPress={() => router.push(reference.route as never)} style={styles.relatedRow}><MaterialIcons name="north-east" size={17} color={HOBEE.colors.goldDark} /><Text style={styles.relatedText}>{reference.label}</Text><MaterialIcons name="chevron-right" size={19} color={HOBEE.colors.muted} /></Pressable>)}</View></> : null}
          <View className="mt-7 rounded-2xl border border-border bg-surface p-4">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#F5EBCF]">
                <MaterialIcons name="volunteer-activism" size={23} color="#C98716" />
              </View>
              <View className="flex-1">
                <Text className="font-black text-foreground">เลือกซื้อเพื่อสนับสนุนชุมชน</Text>
                <Text className="mt-1 text-sm leading-5 text-muted">พบสินค้าที่คัดสรรโดย HOBEE ได้ในร้านค้า</Text>
              </View>
            </View>
          </View>
          <PrimaryButton label="เลือกชมสินค้า" icon="shopping-bag" onPress={() => router.push("/(tabs)/shop")} style={styles.button} />
          <View style={styles.engagement}><View style={styles.engagementHeader}><Text style={styles.engagementTitle}>ความคิดเห็น</Text><Text style={styles.engagementBoundary}>เปิดเมื่อ Community backend พร้อม</Text></View><View style={styles.commentRow}><TextInput value={comment} onChangeText={setComment} placeholder="แสดงความคิดเห็นอย่างสุภาพ" placeholderTextColor={HOBEE.colors.muted} style={styles.commentInput} /><Pressable onPress={() => setComment("")} style={styles.send}><MaterialIcons name="send" size={18} color={HOBEE.colors.ink} /></Pressable></View></View>
          {showReport ? <View style={styles.report}><Text style={styles.reportTitle}>รายงานเนื้อหา</Text><Text style={styles.reportText}>เลือกเหตุผลเพื่อดู presentation ของ moderation workflow</Text><View style={styles.reportChoices}>{COMMUNITY_REPORT_REASONS.slice(0, 4).map((reason) => <Pressable key={reason.id} onPress={() => setShowReport(false)} style={styles.reportChoice}><Text style={styles.reportChoiceText}>{reason.label}</Text></Pressable>)}</View></View> : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 12 },
  back: { position: "absolute", top: 16, left: 20, height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: "rgba(255,255,255,0.94)" },
  heroActions: { position: "absolute", top: 16, right: 20, flexDirection: "row", gap: 8 }, heroAction: { height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: "rgba(255,255,255,0.94)" },
  button: { marginTop: 20 },
  author: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 20, borderRadius: 16, backgroundColor: HOBEE.atmosphere.warmCream, padding: 12 }, authorAvatar: { width: 40, height: 40, borderRadius: 20 }, authorCopy: { flex: 1 }, authorName: { color: HOBEE.colors.ink, fontSize: 12, fontWeight: "900" }, authorMeta: { color: HOBEE.colors.muted, fontSize: 10, fontWeight: "700", marginTop: 3 }, follow: { borderRadius: 14, backgroundColor: HOBEE.colors.gold, paddingHorizontal: 10, paddingVertical: 7 }, followText: { color: HOBEE.colors.ink, fontSize: 11, fontWeight: "900" }, related: { gap: 7, marginTop: 18 }, relatedTitle: { color: HOBEE.colors.ink, fontSize: 15, fontWeight: "900" }, relatedRow: { flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 14, borderWidth: 1, borderColor: HOBEE.colors.border, backgroundColor: HOBEE.colors.surface, padding: 11 }, relatedText: { flex: 1, color: HOBEE.colors.ink, fontSize: 12, fontWeight: "800" }, engagement: { gap: 9, marginTop: 20 }, engagementHeader: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 10 }, engagementTitle: { color: HOBEE.colors.ink, fontSize: 15, fontWeight: "900" }, engagementBoundary: { flex: 1, color: HOBEE.colors.muted, fontSize: 9, fontWeight: "700", textAlign: "right" }, commentRow: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 19, backgroundColor: HOBEE.colors.surface, paddingLeft: 13, ...HOBEE.elevation.surface }, commentInput: { flex: 1, color: HOBEE.colors.ink, fontSize: 12, fontWeight: "600", paddingVertical: 12 }, send: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: HOBEE.colors.gold }, report: { gap: 9, marginTop: 16, borderRadius: 17, backgroundColor: HOBEE.atmosphere.peachMist, padding: 13 }, reportTitle: { color: HOBEE.colors.ink, fontSize: 14, fontWeight: "900" }, reportText: { color: HOBEE.colors.muted, fontSize: 11, fontWeight: "600" }, reportChoices: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, reportChoice: { borderRadius: 14, backgroundColor: HOBEE.colors.surface, paddingHorizontal: 9, paddingVertical: 7 }, reportChoiceText: { color: HOBEE.colors.ink, fontSize: 10, fontWeight: "800" },
  pressed: { opacity: 0.76, transform: [{ scale: 0.96 }] },
});
