# Opn Payments Adapter Notes

The adapter uses the Opn Payments Charges API and is intended for a Thailand merchant account with PromptPay enabled. PromptPay uses a server-side secret key to create a charge with `source[type]=promptpay`; the response contains a QR download URL and stays pending until the provider reports completion. The provider documentation recommends retrieving the charge after receiving a completion event to verify its final state.[1]

For cards, the mobile client must use an approved provider client SDK or hosted component with a **public key** to turn card details into a single-use `tokn_...` token. The HOBEE API accepts only that token and creates the charge with its server-only secret key. It never accepts a PAN, CVV, expiry date, or raw cardholder record.[2]

The real adapter requires the following Vercel-only variable:

```text
OPN_SECRET_KEY=skey_test_...     # sandbox first; replace with live secret only after approval
```

PromptPay must be enabled for the merchant account by the provider. A real provider webhook endpoint must be configured in the provider dashboard. The generic HMAC webhook endpoint remains useful for providers that sign HMAC payloads; the future Opn-specific endpoint will retrieve the referenced charge before accepting a status transition.

## References

[1] [Opn Payments, PromptPay integration](https://www.omise.co/promptpay)

[2] [Opn Payments, Tokens API](https://www.omise.co/tokens-api)
