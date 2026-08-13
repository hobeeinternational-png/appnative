# HOBEE Admin Web Portal

## Scope

The portal is a desktop-first admin experience available at the existing Expo Router route `/admin`. It reads and writes through the existing Supabase client and relies on the existing `user_roles.role = 'admin'` gate and database RLS policies. It does not introduce a service-role key, payment credential, or schema change.

## Information architecture

| Workspace | Current data contract | Purpose |
|---|---|---|
| Overview | `products`, `orders` | Operational metrics, low-stock attention, and latest orders. |
| Products | `products`, `shops` | Search, status and stock filtering, then edit an existing product. |
| Inventory | `products.stock_quantity` | Surface low-stock products and route to the same product editor. |
| Orders | `orders`, `profiles` | Review payment/order status and move orders through the existing status flow. |

## Deployment boundary

The portal is currently a web route in the same project. A separate production URL such as `admin.hobee.co.th` can point to the same web build and route `/admin`, or later to a separate admin-only web build. Both approaches must preserve Supabase RLS and server-only secrets remain outside the browser.
