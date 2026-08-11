import { supabase } from "@/lib/supabase";

const rawBaseUrl = process.env.EXPO_PUBLIC_HOBEE_API_BASE_URL?.trim() ?? "";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export class HobeeApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "HobeeApiError";
  }
}

function hasConfiguredApiBaseUrl(): boolean {
  return API_BASE_URL.startsWith("https://");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!hasConfiguredApiBaseUrl()) throw new HobeeApiError("ยังไม่ได้กำหนด HTTPS API ของ HOBEE สำหรับแอปมือถือ");
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token ?? null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const rawBody = await response.text();
  let body: unknown = null;
  try { body = rawBody ? JSON.parse(rawBody) : null; } catch { /* controlled below */ }
  if (!response.ok) {
    const message = typeof body === "object" && body && "error" in body
      ? String((body as { error?: { message?: unknown } }).error?.message ?? "เกิดข้อผิดพลาดจากระบบ HOBEE")
      : `คำขอล้มเหลว (${response.status})`;
    throw new HobeeApiError(message, response.status);
  }
  if (!body) throw new HobeeApiError("เซิร์ฟเวอร์ตอบกลับในรูปแบบที่ไม่ถูกต้อง", response.status);
  return body as T;
}

export type RemoteProduct = Record<string, unknown>;
export type CreateOrderInput = { addressId: string; items: Array<{ productId: string; variantId?: string; quantity: number }> };
export type CreatedOrder = { order: { id: string; order_number: string; total: number; status: string; payment_status: string } };
export type PaymentAction = { type: "promptpay_qr"; qrImageUrl?: string; qrPayload?: string; expiresAt?: string | null; testMode?: boolean } | { type: "redirect"; url: string; testMode?: boolean } | { type: "card_token_required"; message?: string; testMode?: boolean } | { type: "await_confirmation"; testMode?: boolean };
export type CreatedPaymentIntent = { payment: { id: string; provider_reference: string; status: string }; action: PaymentAction };

export const hobeeApi = {
  isConfigured: hasConfiguredApiBaseUrl,
  products: () => request<RemoteProduct[] | { items: RemoteProduct[] }>("/api/products"),
  currentUser: () => request<Record<string, unknown>>("/api/auth/session"),
  orders: () => request<{ items: Record<string, unknown>[] }>("/api/orders?limit=25"),
  createOrder: (input: CreateOrderInput) => request<CreatedOrder>("/api/orders", { method: "POST", body: JSON.stringify(input) }),
  createPaymentIntent: (input: { orderId: string; method: "mock_promptpay" | "mock_card" | "opn_promptpay" | "opn_card"; cardToken?: string }) => request<CreatedPaymentIntent>("/api/payments/intent", { method: "POST", body: JSON.stringify(input) }),
};
