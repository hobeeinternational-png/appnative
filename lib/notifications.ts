import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import { supabase } from "@/lib/supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export async function registerPushToken(userId: string): Promise<{ token: string | null; reason?: string }> {
  if (Platform.OS === "web") return { token: null, reason: "Push notifications require a native build" };
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("orders", { name: "คำสั่งซื้อ HOBEE", importance: Notifications.AndroidImportance.HIGH, vibrationPattern: [0, 250, 200, 250], lightColor: "#C98716" });
  }
  const existing = await Notifications.getPermissionsAsync();
  const permission = existing.status === "granted" ? existing : await Notifications.requestPermissionsAsync();
  if (permission.status !== "granted") return { token: null, reason: "Notification permission was not granted" };
  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    const { error } = await supabase.from("device_push_tokens").upsert({ user_id: userId, expo_push_token: token, platform: Platform.OS }, { onConflict: "expo_push_token" });
    if (error) throw error;
    return { token };
  } catch (error) {
    return { token: null, reason: error instanceof Error ? error.message : "Unable to register device" };
  }
}

