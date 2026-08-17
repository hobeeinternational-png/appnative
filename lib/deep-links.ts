export const HOBEE_SCHEME = "manushobeemobile";

export type PaymentReturn = { orderId: string | null; status: "success" | "pending" | "cancelled" | "failed" | "unknown" };

export function parsePaymentReturn(url: string): PaymentReturn | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== `${HOBEE_SCHEME}:` || parsed.hostname !== "payment" || parsed.pathname !== "/callback") return null;
    const rawStatus = parsed.searchParams.get("status")?.toLowerCase();
    const status = rawStatus === "success" || rawStatus === "pending" || rawStatus === "cancelled" || rawStatus === "failed" ? rawStatus : "unknown";
    return { orderId: parsed.searchParams.get("order_id"), status };
  } catch {
    return null;
  }
}

export function isOrderNotificationRoute(route: unknown): route is string {
  return typeof route === "string" && /^\/orders(?:\/[A-Za-z0-9_-]+(?:\/(?:delivery|help|buy-again))?)?$/.test(route);
}

export function isMyHobeeNotificationRoute(route: unknown): route is string {
  return typeof route === "string" && /^\/my-hobee(?:\/(?:roles|work|earnings|notifications))?$/.test(route);
}

export function isAfterSalesNotificationRoute(route: unknown): route is string {
  return typeof route === "string" && (/^\/claims(?:\/[A-Za-z0-9_-]+)?$/.test(route) || route === "/admin/after-sales");
}

export function isFoodNotificationRoute(route: unknown): route is string {
  return typeof route === "string" && /^\/travel\/food(?:\/(?:orders(?:\/[A-Za-z0-9_-]+)?|reservations|saved|cart))?$/.test(route);
}

export function isLearningNotificationRoute(route: unknown): route is string {
  return typeof route === "string" && /^\/learning(?:\/(?:my-learning|catalogue|membership|calendar|events(?:\/[A-Za-z0-9_-]+(?:\/(?:ticket|success))?)?|live\/[A-Za-z0-9_-]+|sessions\/[A-Za-z0-9_-]+|teacher\/[A-Za-z0-9_-]+))?$/.test(route);
}

export function isCommunityNotificationRoute(route: unknown): route is string {
  return typeof route === "string" && /^\/community(?:\/(?:stories|clubs(?:\/[A-Za-z0-9_-]+)?|activities(?:\/[A-Za-z0-9_-]+)?|my-activities|jobs(?:\/[A-Za-z0-9_-]+)?|trips|profile(?:\/(?:network|privacy))?|people\/[A-Za-z0-9_-]+))?$/.test(route);
}

export function isHobeeNotificationRoute(route: unknown): route is string {
  return isOrderNotificationRoute(route) || isMyHobeeNotificationRoute(route) || isAfterSalesNotificationRoute(route) || isFoodNotificationRoute(route) || isLearningNotificationRoute(route) || isCommunityNotificationRoute(route);
}
