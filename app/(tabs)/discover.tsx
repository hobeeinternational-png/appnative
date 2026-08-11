import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { ScreenHeader } from "@/components/hobee/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import { hobeeStories } from "@/lib/hobee-data";

export default function DiscoverScreen() {
  return (
    <ScreenContainer className="px-5" safeAreaClassName="pt-3">
      <FlatList
        data={hobeeStories}
        keyExtractor={(story) => story.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <ScreenHeader title="ค้นพบ" subtitle="เรื่องราวที่พาคุณเข้าใกล้ผู้คนและท้องถิ่น" />
            <View className="mb-5 rounded-2xl bg-[#F5EBCF] p-4">
              <View className="flex-row gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary">
                  <MaterialIcons name="auto-stories" size={22} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-foreground">มากกว่าการซื้อสินค้า</Text>
                  <Text className="mt-1 text-sm leading-5 text-muted">ทุกเรื่องราวคัดสรรเพื่อเชื่อมคุณกับต้นทางของของดีและชุมชน</Text>
                </View>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" accessibilityLabel={`อ่านเรื่องราว ${item.title}`} onPress={() => router.push({ pathname: "/story/[id]", params: { id: item.id } } as Href)} style={({ pressed }) => [styles.story, pressed && styles.pressed]}>
            <Image source={{ uri: item.image }} className="h-48 w-full bg-[#EEE6D6]" resizeMode="cover" />
            <View className="gap-1.5 p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-[10px] font-bold tracking-[1.1px] text-primary">{item.label}</Text>
                <Text className="text-xs text-muted">{item.readTime}</Text>
              </View>
              <Text className="text-lg font-black leading-6 text-foreground">{item.title}</Text>
              <Text className="text-sm leading-5 text-muted">{item.description}</Text>
              <View className="mt-2 flex-row items-center gap-1">
                <Text className="text-sm font-bold text-primary">อ่านเรื่องราว</Text>
                <MaterialIcons name="arrow-forward" size={17} color="#C98716" />
              </View>
            </View>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingBottom: 32 },
  story: { overflow: "hidden", borderWidth: 1, borderColor: "#E8E0D0", borderRadius: 20, backgroundColor: "#FFFFFF" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.987 }] },
});
