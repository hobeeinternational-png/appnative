import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { LearningDiscoveryExtension } from "@/components/hobee/learning-discovery-extension";
import { HOBEE } from "@/components/hobee/design-tokens";
import { coursesForWorld, formatCourseDuration, learningCourses, learningWorlds, levelLabel, type LearningCourse, type LearningWorld } from "@/lib/learning-data";

const FEATURED_IDS: Record<LearningWorld, string> = {
  business_skills: "meta-ads-mastery",
  islamic_wisdom: "halal-business-ethics",
};

export default function LearningScreen() {
  const [world, setWorld] = useState<LearningWorld>("business_skills");
  const worldCourses = useMemo(() => coursesForWorld(world), [world]);
  const featured = learningCourses.find((course) => course.id === FEATURED_IDS[world]) ?? learningCourses[0];
  const continueCourse = worldCourses[0];

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-[#0C0A09]" safeAreaClassName="bg-[#0C0A09]">
      <View style={[styles.screen, { backgroundColor: HOBEE.colors.darkBase }]}>
        <LearningHeader />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.worldTabs}>
            {learningWorlds.map((item) => {
              const active = item.id === world;
              return (
                <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`เลือกโลก${item.label}`} onPress={() => setWorld(item.id)} style={({ pressed }) => [styles.worldTab, active && styles.worldTabActive, pressed && styles.pressed]}>
                  <MaterialIcons name={item.icon} size={17} color={active ? "#1B1813" : "#A8A7A3"} />
                  <Text style={[styles.worldTabText, active && styles.worldTabTextActive]}>{item.label}</Text>
                  <View style={[styles.worldCount, active && styles.worldCountActive]}><Text style={[styles.worldCountText, active && styles.worldCountTextActive]}>{world === item.id ? worldCourses.length : coursesForWorld(item.id).length}</Text></View>
                </Pressable>
              );
            })}
          </ScrollView>

          <FeaturedCourse course={featured} />
          <LearningDiscoveryExtension />
          <SectionTitle title="แนะนำสำหรับคุณ" eyebrow="RECOMMENDED" />
          <Text style={styles.sectionSubtext}>คอร์สเรียนยอดนิยมคัดสรรจากผู้สอน HOBEE Academy</Text>
          <CourseRail courses={worldCourses} showProgress />

          <SectionTitle title="คอร์สยอดนิยมประจำสัปดาห์" eyebrow="TOP 10" />
          <CourseRail courses={[...worldCourses].filter((course) => course.isTrending).concat(worldCourses).slice(0, 5)} rank />

          <SectionTitle title="คอร์สพร้อมใบรับรอง" eyebrow="CERTIFIED" />
          <CourseRail courses={worldCourses.filter((course) => course.hasCertificate)} />

          <SectionTitle title="เรียนต่อจากที่ค้างไว้" eyebrow="CONTINUE" />
          {continueCourse ? <ContinueCard course={continueCourse} /> : null}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

function LearningHeader() {
  return (
    <View style={[styles.header, { borderBottomColor: HOBEE.colors.darkBorder }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="กลับหน้าหลัก HOBEE" onPress={() => router.replace("/(tabs)")} style={({ pressed }) => [styles.brand, pressed && styles.pressed]}>
        <View style={[styles.brandMark, { borderColor: HOBEE.colors.gold, backgroundColor: HOBEE.colors.darkCard }]}><MaterialIcons name="auto-awesome" size={20} color={HOBEE.colors.gold} /></View>
        <Text style={styles.wordmark}>HOBEE</Text><Text style={styles.learningLabel}>LEARNING</Text>
      </Pressable>
      <View style={styles.headerActions}>
        <Pressable accessibilityRole="button" accessibilityLabel="ค้นหาคอร์ส" onPress={() => router.push("/learning/search" as never)} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><MaterialIcons name="search" size={25} color="#EEEDE8" /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="ปฏิทินการเรียน" onPress={() => router.push("/learning/calendar" as never)} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><MaterialIcons name="calendar-month" size={22} color="#EEEDE8" /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="การแจ้งเตือนการเรียน" style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><MaterialIcons name="notifications-none" size={25} color="#EEEDE8" /><View style={styles.notificationDot} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="การเรียนของฉัน" onPress={() => router.push("/learning/my-learning" as never)} style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}><Text style={styles.avatarText}>พ</Text></Pressable>
      </View>
    </View>
  );
}

function FeaturedCourse({ course }: { course: LearningCourse }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`เปิดคอร์ส ${course.title}`} onPress={() => router.push({ pathname: "/learning/[id]", params: { id: course.id } } as never)} style={({ pressed }) => [styles.featured, pressed && styles.pressed]}>
      <ImageBackground source={course.image} resizeMode="cover" style={styles.featuredImage} imageStyle={styles.featuredImageRadius}>
        <View style={styles.featuredOverlay}>
          <View style={styles.badgeRow}><Text style={styles.brandBadge}>HOBEE ACADEMY</Text><Text style={styles.rankBadge}>✣ คอร์สแนะนำอันดับ 1</Text></View>
          <Text style={styles.featuredTitle}>{course.title}</Text>
          <View style={styles.metaRow}><Text style={styles.rating}>★ {course.rating.toFixed(1)}</Text><Text style={styles.meta}>({course.ratingsCount} รีวิว)</Text><Text style={styles.meta}>◷ {formatCourseDuration(course.durationMinutes)}</Text></View>
          <View style={styles.certified}><MaterialIcons name="verified-user" size={14} color={HOBEE.colors.success} /><Text style={styles.certifiedText}>มีประกาศนียบัตร</Text></View>
          <View style={styles.actionRow}><View style={[styles.primaryAction, { backgroundColor: HOBEE.colors.gold, borderRadius: HOBEE.radius.small }]}><MaterialIcons name="play-arrow" size={21} color={HOBEE.colors.darkBase} /><Text style={[styles.primaryActionText, { color: HOBEE.colors.darkBase }]}>เริ่มเข้าสู่บทเรียน</Text></View><View style={styles.detailAction}><MaterialIcons name="info-outline" size={20} color="#F5F3EE" /><Text style={styles.detailActionText}>ดูรายละเอียด</Text></View><View style={styles.addAction}><MaterialIcons name="add" size={24} color="#F5F3EE" /></View></View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

function SectionTitle({ title, eyebrow }: { title: string; eyebrow: string }) { return <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { fontSize: HOBEE.type.h2 }]}>{title}</Text><Text style={[styles.eyebrow, { color: HOBEE.colors.gold }]}>{eyebrow}</Text></View>; }

function CourseRail({ courses, showProgress = false, rank = false }: { courses: LearningCourse[]; showProgress?: boolean; rank?: boolean }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>{courses.map((course, index) => <CourseTile key={`${course.id}-${index}`} course={course} progress={showProgress ? Math.max(22, 68 - index * 12) : undefined} rank={rank ? index + 1 : undefined} />)}</ScrollView>;
}

function CourseTile({ course, progress, rank }: { course: LearningCourse; progress?: number; rank?: number }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`เปิดคอร์ส ${course.title}`} onPress={() => router.push({ pathname: "/learning/[id]", params: { id: course.id } } as never)} style={({ pressed }) => [styles.courseTile, pressed && styles.pressed]}>
    {rank ? <Text style={styles.rankNumber}>{rank}</Text> : null}
    <Image source={course.image} resizeMode="cover" style={styles.courseImage} />
    {course.isNew ? <View style={[styles.newBadge, { backgroundColor: HOBEE.colors.error }]}><Text style={styles.newBadgeText}>NEW</Text></View> : null}
    {progress ? <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: HOBEE.colors.error }]} /></View> : null}
    <Text numberOfLines={2} style={styles.courseTitle}>{course.title}</Text><Text style={styles.courseMeta}>{levelLabel(course.level)} • {course.episodesCount} บทเรียน</Text>
  </Pressable>;
}

function ContinueCard({ course }: { course: LearningCourse }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`ดูต่อ ${course.title}`} onPress={() => router.push({ pathname: "/learning/[id]", params: { id: course.id } } as never)} style={({ pressed }) => [styles.continueCard, pressed && styles.pressed]}><Image source={course.image} style={styles.continueImage} /><View style={styles.continueBody}><Text numberOfLines={2} style={styles.continueTitle}>{course.title}</Text><Text style={styles.continueMeta}>บทที่ 3 จาก {course.episodesCount} • เหลืออีก 12 นาที</Text><View style={styles.continueTrack}><View style={styles.continueFill} /></View><Text style={styles.continueCta}>ดูต่อ  ›</Text></View></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0C0D0D" }, header: { height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 17, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#2A2B2B" }, brand: { flexDirection: "row", alignItems: "center", gap: 7 }, brandMark: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 11, borderWidth: 2, borderColor: "#D9B441", backgroundColor: "#171815" }, wordmark: { color: "#FAF9F5", fontSize: 18, fontWeight: "900", letterSpacing: 0.1 }, learningLabel: { color: "#201C15", fontSize: 10, fontWeight: "900", letterSpacing: 1, borderRadius: 4, backgroundColor: "#D3AC40", paddingHorizontal: 5, paddingVertical: 3 }, headerActions: { flexDirection: "row", alignItems: "center", gap: 5 }, headerButton: { width: 34, height: 42, alignItems: "center", justifyContent: "center" }, notificationDot: { position: "absolute", top: 10, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: "#E2B442", borderWidth: 1, borderColor: "#0C0D0D" }, avatar: { width: 35, height: 35, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: "#D68E19", borderWidth: 2, borderColor: "#F3C24D" }, avatarText: { color: "#FFF9E6", fontSize: 13, fontWeight: "900" }, content: { paddingBottom: 150 }, worldTabs: { gap: 9, paddingHorizontal: 17, paddingVertical: 15 }, worldTab: { height: 43, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 22, borderWidth: 1, borderColor: "#2A2C2B", backgroundColor: "#161717", paddingHorizontal: 12 }, worldTabActive: { borderColor: "#CAA63D", backgroundColor: "#2B291E", shadowColor: "#D0A53D", shadowOpacity: 0.12, shadowRadius: 9, elevation: 3 }, worldTabText: { color: "#D7D5CF", fontSize: 12, fontWeight: "800" }, worldTabTextActive: { color: "#F3D673" }, worldCount: { minWidth: 19, height: 19, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#2D2F2E" }, worldCountActive: { backgroundColor: "#D0A83D" }, worldCountText: { color: "#E1DFD9", fontSize: 10, fontWeight: "900" }, worldCountTextActive: { color: "#201C15" }, featured: { height: 342, overflow: "hidden", marginHorizontal: 17, borderRadius: 24, borderWidth: 1, borderColor: "#3A3427", backgroundColor: "#201F1B" }, featuredImage: { flex: 1, justifyContent: "flex-end" }, featuredImageRadius: { borderRadius: 23 }, featuredOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(5,6,6,0.56)", padding: 18 }, badgeRow: { flexDirection: "row", gap: 7, marginBottom: 12 }, brandBadge: { color: "#EDC65A", fontSize: 10, fontWeight: "900", letterSpacing: 0.8, borderRadius: 9, backgroundColor: "rgba(62,50,18,0.94)", paddingHorizontal: 10, paddingVertical: 5 }, rankBadge: { color: "#F2D575", fontSize: 10, fontWeight: "800", borderRadius: 9, backgroundColor: "rgba(183,140,25,0.3)", paddingHorizontal: 10, paddingVertical: 5 }, featuredTitle: { maxWidth: "92%", color: "#FFFFFF", fontSize: 23, fontWeight: "900", lineHeight: 28, letterSpacing: -0.4 }, metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 12 }, rating: { color: "#F4C449", fontSize: 12, fontWeight: "900" }, meta: { color: "#E7E4DD", fontSize: 11, fontWeight: "700" }, certified: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, marginTop: 12, borderRadius: 7, backgroundColor: "rgba(22,46,39,0.9)", paddingHorizontal: 8, paddingVertical: 5 }, certifiedText: { color: "#E9F8ED", fontSize: 10, fontWeight: "800" }, actionRow: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 14 }, primaryAction: { height: 44, flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 12, backgroundColor: "#DCB548", paddingHorizontal: 14 }, primaryActionText: { color: "#18150F", fontSize: 12, fontWeight: "900" }, detailAction: { height: 44, flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 12, borderWidth: 1, borderColor: "#686864", backgroundColor: "rgba(28,29,29,0.75)", paddingHorizontal: 11 }, detailActionText: { color: "#F4F2EC", fontSize: 11, fontWeight: "800" }, addAction: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: "#77736C", backgroundColor: "rgba(24,25,25,0.8)" }, sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 27, paddingHorizontal: 17 }, sectionTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "900" }, eyebrow: { color: "#D6AF45", fontSize: 10, fontWeight: "900", letterSpacing: 0.9, borderRadius: 9, backgroundColor: "#2C271A", paddingHorizontal: 8, paddingVertical: 4 }, sectionSubtext: { color: "#A7A5A0", fontSize: 12, fontWeight: "600", marginTop: 8, paddingHorizontal: 17 }, rail: { gap: 12, paddingHorizontal: 17, paddingTop: 14 }, courseTile: { width: 150, position: "relative" }, courseImage: { width: 150, height: 88, borderRadius: 11, backgroundColor: "#292A29" }, courseTitle: { color: "#F4F2ED", fontSize: 12, fontWeight: "800", lineHeight: 16, marginTop: 8 }, courseMeta: { color: "#9A9994", fontSize: 10, fontWeight: "600", marginTop: 3 }, newBadge: { position: "absolute", top: 7, left: 7, borderRadius: 5, backgroundColor: "#DB4C42", paddingHorizontal: 6, paddingVertical: 3 }, newBadgeText: { color: "#FFFFFF", fontSize: 8, fontWeight: "900", letterSpacing: 0.4 }, progressTrack: { position: "absolute", top: 82, left: 7, right: 7, height: 3, overflow: "hidden", borderRadius: 2, backgroundColor: "rgba(255,255,255,0.24)" }, progressFill: { height: "100%", borderRadius: 2, backgroundColor: "#DD4B42" }, rankNumber: { position: "absolute", zIndex: 2, left: -5, bottom: 31, color: "#0C0D0D", fontSize: 57, fontWeight: "900", textShadowColor: "#D5AF48", textShadowRadius: 1, textShadowOffset: { width: 1, height: 1 } }, continueCard: { flexDirection: "row", overflow: "hidden", marginHorizontal: 17, marginTop: 13, borderRadius: 16, borderWidth: 1, borderColor: "#313230", backgroundColor: "#181A19" }, continueImage: { width: 126, minHeight: 106, backgroundColor: "#282926" }, continueBody: { flex: 1, padding: 12 }, continueTitle: { color: "#F6F4EE", fontSize: 13, fontWeight: "900", lineHeight: 17 }, continueMeta: { color: "#9B9995", fontSize: 10, fontWeight: "600", marginTop: 6 }, continueTrack: { height: 4, overflow: "hidden", borderRadius: 2, backgroundColor: "#393A38", marginTop: 11 }, continueFill: { width: "39%", height: "100%", borderRadius: 2, backgroundColor: "#E04D43" }, continueCta: { color: "#E2B745", fontSize: 11, fontWeight: "900", marginTop: 8 }, pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
