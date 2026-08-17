# HOBEE MOBILE — BACKEND INTEGRATION READINESS

**Scope:** UI and contract readiness only. This document does not authorize production provider connection, schema migration, or live transaction creation.

| Module | UI | Data contract | Current source | Supabase/API needed | Priority | Risk |
|---|---|---|---|---|---|---|
| Auth and Profile | Complete | Password, profile, role contracts exist | Supabase auth and profile hooks | Phone Auth enablement; real-device reset verification | P0 | Configuration / test personas |
| Organization and roles | Complete presentation | `WorkspaceRole`, memberships and permission models exist | Existing role and organization contracts | Controlled memberships and permission matrix | P0 | Authorization evidence |
| Shop and Product | Complete | Catalogue, cart and order hand-off retained | Supabase catalogue with fallback | Stable production API and inventory authority | P0 | Pricing/stock correctness |
| Orders, Payment and After-Sales | Complete UI | Existing order/payment/claim contracts retained | Supabase and Vercel source foundation | Vercel deployment, server-only secrets, Opn sandbox and webhooks | P0 | Financial / idempotency |
| Local Stores | Complete presentation | Local store and pre-order contracts isolated | Local presentation repository/preferences | Store catalog, availability, fulfilment source | P1 | Source ownership |
| Food | Complete presentation | Separate FoodCart and reservation/queue contracts | Local presentation contract | Restaurant, menu, availability, reservation/order APIs | P1 | Operational timing |
| Travel | Complete presentation | Travel listing, booking and planner contracts isolated | Presentation contracts plus legacy source | Booking inventory, policy, map and operator APIs | P1 | Booking authority |
| Learning | Complete presentation | Catalogue, access, library, teacher, event contracts | Presentation plus local learning library | Catalogue/enrollment/content storage and access policy | P1 | Access enforcement |
| Community | Complete presentation | Stories, clubs, activities, jobs, profile and report contracts | Local `community-hub` contract | Posts, comments, follows, moderation, memberships and RLS | P1 | Trust and moderation |
| My HOBEE / workspaces | Complete presentation | Central role workspace contract | Existing roles/work data + presentation screens | Role-specific work feeds and organization context | P1 | Permission matrix |
| Admin | Complete UI | Existing admin and workspace contracts | Admin role gate and current data layers | Vercel/Admin API deployment and live audit surface | P0 | Privileged access |
| Notifications | Complete route handling | Route allow-list and notification detail contract | Existing notification foundation | Push token delivery, worker deployment and device proof | P1 | Delivery evidence |

## Integration order

The first backend-wiring tranche should establish controlled test personas, verify the authentication and authorization matrix, deploy the existing server-only backend, and prove order/payment webhook idempotency in sandbox. Store, Food, Travel, Learning, and Community integrations should then be connected module by module behind their existing presentation contracts.

> UI contract changes are not required before this work begins. Any backend response that needs a new UI field, status, route parameter, or action should be proposed against the contract-freeze document before implementation.
