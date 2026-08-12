import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { isMagicLinkCallback } from "@/lib/deep-links";

export default function AuthCallbackScreen() {
  const url = Linking.useURL();
  const { completeMagicLink } = useSupabaseAuth();
  const [message, setMessage] = useState("กำลังยืนยันการเข้าสู่ระบบ…");

  useEffect(() => {
    if (!url) return;
    if (!isMagicLinkCallback(url)) { setMessage("ลิงก์เข้าสู่ระบบไม่ถูกต้อง กรุณากลับไปขอลิงก์ใหม่อีกครั้ง"); return; }
    void completeMagicLink(url)
      .then(() => router.replace("/(tabs)/account"))
      .catch(() => setMessage("ลิงก์เข้าสู่ระบบไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่อีกครั้ง"));
  }, [completeMagicLink, url]);

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center px-6">
      <View className="items-center rounded-3xl border border-border bg-surface px-6 py-8">
        <ActivityIndicator color="#C98716" size="large" />
        <Text className="mt-5 text-center text-base font-bold leading-6 text-foreground">{message}</Text>
      </View>
    </ScreenContainer>
  );
}
