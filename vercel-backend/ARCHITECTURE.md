# HOBEE Order and Payment API Design

The mobile client only sends a list of product identifiers, quantities, and an address identifier. It must not send a subtotal, discount, shipping charge, or final total. The Vercel API verifies the Supabase bearer token, loads the owned delivery address, and asks a server-only Supabase procedure to read the current product price and decrement stock atomically.

| Endpoint | Client authorization | Server responsibility |
|---|---|---|
| `POST /api/orders` | Supabase user bearer token | Validate input, confirm address ownership, calculate the order from database values, reserve stock, and create immutable order item snapshots. |
| `POST /api/payments/intent` | Supabase user bearer token | Confirm order ownership and create a pending payment record. No provider charge is initiated until a provider adapter is configured. |
| `POST /api/payments/webhook` | HMAC signature | Verify raw payload signature, deduplicate provider event ID, and transition payment/order state. |

The service-role key and payment/webhook secrets are Vercel-only values. They are never exposed as `EXPO_PUBLIC_*` variables or embedded in the mobile package.
