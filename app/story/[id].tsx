import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { PrimaryButton } from "@/components/hobee/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { hobeeStories } from "@/lib/hobee-data";

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = hobeeStories.find((item) => item.id === id) ?? hobeeStories[0];

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View className="relative">
          <Image source={{ uri: story.image }} className="h-[330px] w-full bg-[#EEE6D6]" resizeMode="cover" />
          <Pressable accessibilityRole="button" accessibilityLabel="ย้อนกลับ" onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
            <MaterialIcons name="arrow-back" size={23} color="#17352A" />
          </Pressable>
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
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 12 },
  back: { position: "absolute", top: 16, left: 20, height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: "rgba(255,255,255,0.94)" },
  button: { marginTop: 20 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.96 }] },
});

