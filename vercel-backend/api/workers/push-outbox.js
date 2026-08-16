import { createServiceSupabaseClient } from "../../lib/auth.js";
import { getServerConfig } from "../../lib/env.js";
import { ApiError, getBearerToken, requireMethod, sendApiError, sendJson } from "../../lib/http.js";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const MAX_ATTEMPTS = 3;

function requireCronSecret(request, config) {
  if (!config.cronSecret) throw new ApiError(500, "cron_secret_missing", "ยังไม่ได้ตั้งค่า CRON_SECRET บน Vercel");
  if (getBearerToken(request) !== config.cronSecret) throw new ApiError(401, "worker_unauthorized", "worker authorization ไม่ถูกต้อง");
}

async function resolvePushMessages(service, userId, notification) {
  const { data: tokens } = await service.from("device_push_tokens").select("expo_push_token").eq("user_id", userId);
  return (tokens ?? []).map((token) => ({
    to: token.expo_push_token,
    sound: "default",
    title: notification.title,
    body: notification.body ?? "",
    data: notification.route ? { url: notification.route } : {},
  }));
}

export default async function handler(request, response) {
  try {
    requireMethod(request, response, "POST");
    const config = getServerConfig();
    requireCronSecret(request, config);
    const service = createServiceSupabaseClient(config);
    const { data: queued, error: queuedError } = await service.from("notification_delivery_outbox")
      .select("id,notification_id,user_id,attempts")
      .eq("delivery_status", "queued")
      .order("created_at", { ascending: true })
      .limit(50);
    if (queuedError) throw new ApiError(500, "outbox_query_failed", "ไม่สามารถอ่าน push outbox ได้");

    const summary = { processed: 0, sent: 0, suppressed: 0, failed: 0 };
    for (const item of queued ?? []) {
      summary.processed += 1;
      const { data: notification } = await service.from("user_notifications")
        .select("id,title,body,route")
        .eq("id", item.notification_id)
        .maybeSingle();
      if (!notification) {
        await service.from("notification_delivery_outbox").update({ delivery_status: "suppressed", last_error: "notification_missing" }).eq("id", item.id);
        summary.suppressed += 1;
        continue;
      }
      const messages = await resolvePushMessages(service, item.user_id, notification);
      if (!messages.length) {
        await service.from("notification_delivery_outbox").update({ delivery_status: "suppressed", last_error: "no_device_tokens" }).eq("id", item.id);
        summary.suppressed += 1;
        continue;
      }
      try {
        const pushResponse = await fetch(EXPO_PUSH_URL, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(messages),
        });
        const payload = await pushResponse.json().catch(() => null);
        const hasTicketError = Array.isArray(payload?.data) && payload.data.some((ticket) => ticket?.status === "error");
        if (!pushResponse.ok || hasTicketError) throw new Error("expo_push_delivery_failed");
        await service.from("notification_delivery_outbox").update({ delivery_status: "sent", attempts: item.attempts + 1, sent_at: new Date().toISOString(), last_error: null }).eq("id", item.id);
        summary.sent += 1;
      } catch (error) {
        const attempts = item.attempts + 1;
        await service.from("notification_delivery_outbox").update({
          delivery_status: attempts >= MAX_ATTEMPTS ? "failed" : "queued",
          attempts,
          last_error: error instanceof Error ? error.message : "push_delivery_failed",
        }).eq("id", item.id);
        summary.failed += 1;
      }
    }
    return sendJson(response, 200, summary);
  } catch (error) {
    return sendApiError(response, error);
  }
}
