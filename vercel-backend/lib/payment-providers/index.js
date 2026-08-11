import { createMockPaymentProvider } from "./mock.js";
import { createOpnPaymentProvider } from "./opn.js";
import { assertPaymentAdapter, PaymentMethod } from "./provider.js";

export { PaymentMethod, mapProviderStatus, toSubunits } from "./provider.js";

export function getPaymentProvider(method, config) {
  if ([PaymentMethod.MOCK_PROMPTPAY, PaymentMethod.MOCK_CARD].includes(method)) {
    return createMockPaymentProvider();
  }
  if ([PaymentMethod.OPN_PROMPTPAY, PaymentMethod.OPN_CARD].includes(method)) {
    return assertPaymentAdapter(createOpnPaymentProvider({ secretKey: config.opnSecretKey }));
  }
  return assertPaymentAdapter(null);
}
