import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

function whenNative(effect: () => Promise<void>) {
  if (Platform.OS !== "web") void effect();
}

export const haptic = {
  light: () => whenNative(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () => whenNative(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  success: () => whenNative(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  error: () => whenNative(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
