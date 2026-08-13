import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { BrandMark } from "@/components/hobee/brand-mark";
import { PrimaryButton } from "@/components/hobee/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/contexts/toast-context";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { configured, signInWithPassword, user } = useSupabaseAuth();
  const { showToast } = useToast();
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();

  const requestPasswordSignIn = async () => {
    if (!emailPattern.test(email.trim()) || !password) {
      showToast("กรุณากรอกอีเมลและรหัสผ่าน", "error");
      return;
    }
    setSubmitting(true);
    try {
      await signInWithPassword(email, password);
      showToast("เข้าสู่ระบบสำเร็จ", "success");
      router.replace(redirectTo === "/admin" ? "/admin" : "/(tabs)/account");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "ไม่สามารถเข้าสู่ระบบได้", "error");
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
      <View style={styles.authContent}>
        <BrandMark />
        <Text className="mt-9 text-3xl font-black leading-10 text-foreground">ทุกสิทธิพิเศษ{`\n`}เริ่มต้นที่บัญชี HOBEE</Text>
        <Text className="mt-3 text-base leading-6 text-muted">เข้าสู่ระบบด้วยอีเมลและรหัสผ่านของบัญชี HOBEE</Text>
        <View className="mt-8 rounded-2xl border border-border bg-surface p-5">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#F5EBCF]">
              <MaterialIcons name="lock-outline" size={22} color="#C98716" />
            </View>
            <View className="flex-1">
              <Text className="font-black text-foreground">เข้าสู่ระบบ</Text>
              <Text className="mt-0.5 text-xs leading-5 text-muted">ใช้บัญชีเดียวกันบน web, iOS และ Android</Text>
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
            returnKeyType="next"
            editable={configured && !submitting}
            onSubmitEditing={() => undefined}
            className="mt-5 h-13 rounded-xl border border-border bg-background px-4 text-base text-foreground"
          />
          <View style={styles.passwordBlock}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholder="รหัสผ่าน"
              placeholderTextColor="#8A978E"
              editable={configured && !submitting}
              onSubmitEditing={() => void requestPasswordSignIn()}
              style={styles.passwordInput}
            />
            <PrimaryButton label="เข้าสู่ระบบ" icon="login" loading={submitting} disabled={!configured} onPress={() => void requestPasswordSignIn()} style={styles.passwordButton} />
          </View>
          {!configured ? <Text className="mt-3 text-center text-xs leading-5 text-error">ยังไม่ได้ตั้งค่า Supabase สำหรับแอปนี้</Text> : null}
        </View>
        <PrimaryButton label="กลับไปเลือกชมสินค้า" icon="shopping-bag" variant="outline" onPress={() => router.replace("/(tabs)/shop")} style={styles.button} />
        <Text className="mt-4 text-center text-xs leading-5 text-muted">หากยังไม่มีรหัสผ่าน โปรดติดต่อผู้ดูแลระบบเพื่อสร้างบัญชีใน Supabase</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  authContent: { flex: 1, justifyContent: "center", width: "100%", maxWidth: Platform.OS === "web" ? 620 : undefined, alignSelf: "center", paddingBottom: 80, marginTop: 32 },
  back: { height: 44, width: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E8E0D0", borderRadius: 22, backgroundColor: "#FFFFFF" },
  button: { marginTop: 16 },
  passwordBlock: { marginTop: 12 },
  passwordInput: { height: 50, marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: "#E8E0D0", backgroundColor: "#FFFDF7", paddingHorizontal: 14, color: "#17352A", fontSize: 15 },
  passwordButton: { marginTop: 10 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
});
