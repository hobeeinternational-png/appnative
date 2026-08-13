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

const adminProductStatus = z.enum(["draft", "published", "archived"]);

export const createAdminProductSchema = z.object({
  shopId: uuid,
  categoryId: uuid.nullable().optional(),
  name: z.string().trim().min(2).max(180),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
  description: z.string().trim().max(5000).nullable().optional(),
  price: z.number().nonnegative().max(1_000_000),
  stockQuantity: z.number().int().min(0).max(1_000_000),
  sku: z.string().trim().max(120).nullable().optional(),
  origin: z.string().trim().max(300).nullable().optional(),
  status: adminProductStatus,
}).strict();

export const updateAdminProductSchema = z.object({
  price: z.number().nonnegative().max(1_000_000),
  stockQuantity: z.number().int().min(0).max(1_000_000),
  status: adminProductStatus,
  description: z.string().trim().max(5000).nullable().optional(),
}).strict();

export function parseSchema(schema, input) {
  const parsed = schema.safeParse(input);
  if (parsed.success) return parsed.data;
  const details = parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
  throw new ApiError(400, "validation_error", "ข้อมูลคำขอไม่ถูกต้อง", details);
}
