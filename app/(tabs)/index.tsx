import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { ProductCard } from "@/components/hobee/product-card";
import { ScreenHeader } from "@/components/hobee/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import { hobeeProducts, hobeeStories } from "@/lib/hobee-data";
import { useCatalog } from "@/hooks/use-catalog";

export default function HomeScreen() {
  const { products } = useCatalog();

  return (
    <ScreenContainer className="px-5" safeAreaClassName="pt-3">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ScreenHeader />

        <View className="overflow-hidden rounded-[28px] bg-[#17352A] px-5 pb-5 pt-6">
          <View className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-primary/20" />
          <Text className="text-[11px] font-bold tracking-[1.8px] text-primary">FROM COMMUNITY TO YOU</Text>
          <Text className="mt-2 max-w-[230px] text-[30px] font-black leading-9 text-white">
            ของดีจากชุมชน{`\n`}ที่คุณเลือกได้
          </Text>
          <Text className="mt-3 max-w-[245px] text-sm leading-5 text-white/75">
            ค้นพบสินค้าและเรื่องราวท้องถิ่น ที่ตั้งใจคัดสรรโดย HOBEE
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(tabs)/shop")}
            style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}
          >
            <Text className="font-bold text-[#17352A]">เลือกชมสินค้า</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#17352A" />
          </Pressable>
        </View>

        <View className="mt-7 flex-row items-end justify-between">
          <View>
            <Text className="text-xl font-black text-foreground">คัดสรรเพื่อคุณ</Text>
            <Text className="mt-1 text-sm text-muted">เริ่มต้นกับสินค้าที่ HOBEE แนะนำ</Text>
          </View>
          <Pressable onPress={() => router.push("/(tabs)/shop")} style={({ pressed }) => pressed && styles.textPressed}>
            <Text className="text-sm font-bold text-primary">ดูทั้งหมด</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </ScrollView>

        <View className="mt-8 flex-row items-end justify-between">
          <View>
            <Text className="text-xl font-black text-foreground">เรื่องเล่าจาก HOBEE</Text>
            <Text className="mt-1 text-sm text-muted">คน สถานที่ และรสชาติที่น่าจดจำ</Text>
          </View>
          <Pressable onPress={() => router.push("/(tabs)/discover")} style={({ pressed }) => pressed && styles.textPressed}>
            <Text className="text-sm font-bold text-primary">สำรวจ</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/(tabs)/discover")}
          style={({ pressed }) => [styles.storyCard, pressed && styles.pressed]}
        >
          <Image source={{ uri: hobeeStories[0].image }} className="h-44 w-full" resizeMode="cover" />
          <View className="gap-1 p-4">
            <Text className="text-[10px] font-bold tracking-[1px] text-primary">{hobeeStories[0].label}</Text>
            <Text className="text-base font-bold leading-6 text-foreground">{hobeeStories[0].title}</Text>
            <Text numberOfLines={2} className="text-sm leading-5 text-muted">{hobeeStories[0].description}</Text>
            <Text className="mt-1 text-xs font-semibold text-foreground">{hobeeStories[0].readTime}</Text>
          </View>
        </Pressable>

        <View className="mt-4 rounded-2xl border border-border bg-[#F5EBCF] p-4">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <MaterialIcons name="verified" size={22} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-foreground">ซื้อด้วยความมั่นใจ</Text>
              <Text className="mt-0.5 text-xs leading-4 text-[#617266]">สนับสนุนผู้ผลิตและเรื่องราวท้องถิ่นในทุกคำสั่งซื้อ</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
  horizontalList: { gap: 12, paddingTop: 16, paddingRight: 20 },
  heroButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: "#FFFFFF",
  },
  storyCard: { marginTop: 16, overflow: "hidden", borderRadius: 20, borderWidth: 1, borderColor: "#E8E0D0", backgroundColor: "#FFFFFF" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  textPressed: { opacity: 0.62 },
});
