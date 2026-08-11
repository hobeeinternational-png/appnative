import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";

/** Return target for a 3DS or provider-hosted payment page. Final payment state is always verified server-side. */
export default function PaymentCallbackScreen() {
  useEffect(() => {
    const timer = setTimeout(() => router.replace("/(tabs)/account"), 900);
    return () => clearTimeout(timer);
  }, []);
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center px-6"><View className="items-center rounded-3xl border border-border bg-surface p-7"><ActivityIndicator size="large" color="#C98716" /><Text className="mt-5 text-center text-lg font-black text-foreground">กำลังตรวจสอบการชำระเงิน</Text><Text className="mt-2 text-center text-sm leading-5 text-muted">เราจะอ้างอิงสถานะจากระบบผู้ให้บริการก่อนแสดงผลในคำสั่งซื้อของคุณ</Text></View></ScreenContainer>;
}
