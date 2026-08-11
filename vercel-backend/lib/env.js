const required = (name, value) => {
  if (!value) throw new Error(`Missing required server environment variable: ${name}`);
  return value;
};

export function getServerConfig(env = /** @type {Record<string, string | undefined>} */ (process.env)) {
  return {
    supabaseUrl: required("SUPABASE_URL", env.SUPABASE_URL),
    supabasePublishableKey: required("SUPABASE_PUBLISHABLE_KEY", env.SUPABASE_PUBLISHABLE_KEY),
    supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY", env.SUPABASE_SERVICE_ROLE_KEY),
    paymentWebhookSecret: required("PAYMENT_WEBHOOK_SECRET", env.PAYMENT_WEBHOOK_SECRET),
    opnSecretKey: env.OPN_SECRET_KEY ?? "",
    paymentReturnUrl: env.PAYMENT_RETURN_URL ?? "",
  };
}
