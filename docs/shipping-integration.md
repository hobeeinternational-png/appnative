# HOBEE Shipping Integration

SHIPPOP provides a shipping gateway that can compare delivery rates, create shipments, generate shipping labels, and track shipment status through one integration. Its developer page states that the gateway connects to more than 15 logistics companies.[1] HOBEE will keep the API key server-side on Vercel and will never expose it to the mobile app.

The implementation uses a provider abstraction. The first safe release includes a manual/mock fulfilment adapter, a `shipments` record linked to the order, and customer-facing tracking in My Orders. A SHIPPOP adapter is intentionally activated only after a merchant API key and the provider’s sandbox/test requirements are confirmed. This avoids fabricating shipping labels or requests against an undocumented merchant account.

## Server-only variables

```text
SHIPPOP_API_KEY=<merchant API key>
SHIPPOP_API_BASE_URL=<provider endpoint confirmed by SHIPPOP documentation/account>
```

## Reference

[1] [SHIPPOP — For Developers](https://www.shippop.com/en/for-developers)
