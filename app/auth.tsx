import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { BrandMark } from "@/components/hobee/brand-mark";
import { PrimaryButton } from "@/components/hobee/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/contexts/toast-context";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { configured, sendMagicLink, user } = useSupabaseAuth();
  const { showToast } = useToast();

  const requestMagicLink = async () => {
    if (!emailPattern.test(email.trim())) {
      showToast("กรุณากรอกอีเมลที่ถูกต้อง", "error");
      return;
    }
    setSubmitting(true);
    try {
      await sendMagicLink(email);
      showToast("ส่งลิงก์เข้าสู่อีเมลของคุณแล้ว", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "ไม่สามารถส่งลิงก์เข้าสู่ระบบได้", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (user) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center px-5">
        <View className="w-full max-w-sm rounded-[28px] border border-border bg-surface p-6">
          <MaterialIcons name="verified-user" size={32} color="#317A50" />
          <Text className="mt-4 text-2xl font-black text-foreground">เข้าสู่ระบบแล้ว</Text>
          <Text className="mt-2 text-sm leading-6 text-muted">{user.email}</Text>
          <PrimaryButton label="ไปที่บัญชีของฉัน" icon="arrow-forward" onPress={() => router.replace("/(tabs)/account")} style={styles.button} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5" safeAreaClassName="pt-3">
      <Pressable accessibilityRole="button" accessibilityLabel="ย้อนกลับ" onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
        <MaterialIcons name="arrow-back" size={22} color="#17352A" />
      </Pressable>
      <View className="mt-8 flex-1 justify-center pb-20">
        <BrandMark />
        <Text className="mt-9 text-3xl font-black leading-10 text-foreground">ทุกสิทธิพิเศษ{`\n`}เริ่มต้นที่บัญชี HOBEE</Text>
        <Text className="mt-3 text-base leading-6 text-muted">กรอกอีเมลของคุณ เราจะส่ง Magic Link ที่ปลอดภัยสำหรับเข้าสู่ระบบหรือสร้างบัญชีใหม่</Text>
        <View className="mt-8 rounded-2xl border border-border bg-surface p-5">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#F5EBCF]">
              <MaterialIcons name="mail-outline" size={22} color="#C98716" />
            </View>
            <View className="flex-1">
              <Text className="font-black text-foreground">เข้าสู่ระบบด้วยอีเมล</Text>
              <Text className="mt-0.5 text-xs leading-5 text-muted">ไม่ต้องตั้งหรือจดจำรหัสผ่าน</Text>
            </View>
          </View>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="อีเมลของคุณ"
            placeholderTextColor="#8A978E"
            returnKeyType="send"
            editable={configured && !submitting}
            onSubmitEditing={() => void requestMagicLink()}
            className="mt-5 h-13 rounded-xl border border-border bg-background px-4 text-base text-foreground"
          />
          <PrimaryButton
            label="ส่ง Magic Link"
            icon="send"
            loading={submitting}
            disabled={!configured}
            onPress={() => void requestMagicLink()}
            style={styles.button}
          />
          {!configured ? <Text className="mt-3 text-center text-xs leading-5 text-error">ยังไม่ได้ตั้งค่า Supabase สำหรับแอปนี้</Text> : null}
        </View>
        <PrimaryButton label="กลับไปเลือกชมสินค้า" icon="shopping-bag" variant="outline" onPress={() => router.replace("/(tabs)/shop")} style={styles.button} />
        <Text className="mt-4 text-center text-xs leading-5 text-muted">Magic Link ต้องทดสอบใน development build หรือ release build เนื่องจาก Expo Go ไม่รองรับ custom deep link ที่เสถียร</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  back: { height: 44, width: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E8E0D0", borderRadius: 22, backgroundColor: "#FFFFFF" },
  button: { marginTop: 16 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
});

