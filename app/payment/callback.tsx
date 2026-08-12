import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { router } from "expo-router";
import * as Linking from "expo-linking";

import { ScreenContainer } from "@/components/screen-container";
import { parsePaymentReturn } from "@/lib/deep-links";

/** Return target for a 3DS or provider-hosted payment page. Final payment state is always verified server-side. */
export default function PaymentCallbackScreen() {
  const url = Linking.useURL();
  const result = url ? parsePaymentReturn(url) : null;
  useEffect(() => {
    const destination = result?.orderId ? `/orders/${result.orderId}` : "/orders";
    const timer = setTimeout(() => router.replace(destination as never), 900);
    return () => clearTimeout(timer);
  }, [result?.orderId]);
  const title = result?.status === "cancelled" ? "การชำระเงินถูกยกเลิก" : result?.status === "failed" ? "ไม่สามารถยืนยันการชำระเงิน" : "กำลังตรวจสอบการชำระเงิน";
  const message = result?.status === "cancelled" ? "คุณยังสามารถกลับไปเลือกวิธีชำระเงินใหม่ในรายละเอียดคำสั่งซื้อได้" : "เราจะอ้างอิงสถานะจากระบบผู้ให้บริการก่อนแสดงผลในคำสั่งซื้อของคุณ";
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center px-6"><View className="items-center rounded-3xl border border-border bg-surface p-7"><ActivityIndicator size="large" color="#C98716" /><Text className="mt-5 text-center text-lg font-black text-foreground">{title}</Text><Text className="mt-2 text-center text-sm leading-5 text-muted">{message}</Text></View></ScreenContainer>;
}
