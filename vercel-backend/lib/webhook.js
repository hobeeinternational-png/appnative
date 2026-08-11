import { createHmac, timingSafeEqual } from "node:crypto";

export function signWebhookPayload(rawBody, secret) {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

export function verifyWebhookSignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const expected = Buffer.from(signWebhookPayload(rawBody, secret), "utf8");
  const supplied = Buffer.from(signature, "utf8");
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

