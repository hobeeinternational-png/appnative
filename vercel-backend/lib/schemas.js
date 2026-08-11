import { z } from "zod";
import { ApiError } from "./http.js";

const uuid = z.string().uuid();

export const createOrderSchema = z.object({
  addressId: uuid,
  items: z.array(z.object({
    productId: uuid,
    variantId: uuid.optional(),
    quantity: z.number().int().min(1).max(99),
  }).strict()).min(1).max(50),
}).strict();

export const createPaymentIntentSchema = z.object({
  orderId: uuid,
  method: z.enum(["mock_promptpay", "mock_card", "opn_promptpay", "opn_card"]),
  cardToken: z.string().min(8).max(200).optional(),
}).strict();

export const paymentWebhookSchema = z.object({
  eventId: z.string().min(8).max(200),
  providerReference: z.string().min(8).max(200),
  status: z.enum(["authorized", "paid", "failed", "refunded"]),
  amount: z.number().nonnegative().optional(),
}).strict();

export function parseSchema(schema, input) {
  const parsed = schema.safeParse(input);
  if (parsed.success) return parsed.data;
  const details = parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
  throw new ApiError(400, "validation_error", "ข้อมูลคำขอไม่ถูกต้อง", details);
}
