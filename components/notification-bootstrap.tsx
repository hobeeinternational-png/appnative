import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";

import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { registerPushToken } from "@/lib/notifications";
import { isHobeeNotificationRoute } from "@/lib/deep-links";

export function NotificationBootstrap({ children }: { children: React.ReactNode }) {
  const { user } = useSupabaseAuth();
  useEffect(() => {
    if (!user) return;
    void registerPushToken(user.id);
    const listener = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url;
      if (isHobeeNotificationRoute(url)) router.push(url as never);
    });
    return () => listener.remove();
  }, [user]);
  return <>{children}</>;
}
