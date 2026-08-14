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
  return typeof route === "string" && /^\/orders(?:\/[A-Za-z0-9_-]+)?$/.test(route);
}

export function isMyHobeeNotificationRoute(route: unknown): route is string {
  return typeof route === "string" && /^\/my-hobee(?:\/(?:roles|work|earnings|notifications))?$/.test(route);
}

export function isHobeeNotificationRoute(route: unknown): route is string {
  return isOrderNotificationRoute(route) || isMyHobeeNotificationRoute(route);
}
