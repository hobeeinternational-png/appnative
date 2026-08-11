const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export async function sendOrderPushNotifications(service, buyerId, { title, body, orderId }, fetchImpl = fetch) {
  const { data: tokens, error } = await service.from("device_push_tokens").select("expo_push_token").eq("user_id", buyerId);
  if (error || !tokens?.length) return { sent: 0, skipped: true };
  const messages = tokens.map((entry) => ({
    to: entry.expo_push_token,
    sound: "default",
    title,
    body,
    channelId: "orders",
    data: { url: `/orders/${orderId}` },
  }));
  try {
    const response = await fetchImpl(EXPO_PUSH_URL, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(messages) });
    if (!response.ok) return { sent: 0, skipped: true };
    return { sent: messages.length, skipped: false };
  } catch {
    return { sent: 0, skipped: true };
  }
}

