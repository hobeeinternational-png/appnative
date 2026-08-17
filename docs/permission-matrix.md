# HOBEE Identity and Organization Permission Matrix

The current schema recognizes exactly these organization permissions: `VIEW_ORDERS`, `MANAGE_ORDERS`, `VIEW_BOOKINGS`, `MANAGE_BOOKINGS`, `VIEW_EARNINGS`, `MANAGE_STAFF`, `MANAGE_PRODUCTS`, `MANAGE_ROOMS`, and `APPROVE_ACTIONS`. The matrix below maps the UI’s intended operations only to the existing contract; it does not invent permissions such as `VIEW_CLAIMS` or `MANAGE_SETTINGS`.

| Context | Route or action | Enforcement source | Required role or permission | QA verifier |
|---|---|---|---|---|
| Personal identity | My HOBEE role marketplace / application | `apply_for_hobee_role` RPC plus `role_applications` RLS | Authenticated owner of the application | CUSTOMER_BASIC |
| Personal role | Creator, Affiliate, Teacher, Guide, Service Provider, Employee workspaces | `user_roles` / `user_role_profiles` RLS | Own approved profile | Matching persona |
| Admin | Role approval list and review action | `private.is_platform_admin()` and review RPC | `admin` platform role | HOBEE_ADMIN; denied for CUSTOMER_BASIC |
| Organization membership | Organization overview and member list | `organization_memberships_member_or_admin_read` | Active membership or platform admin | Owner, Manager, Staff variants |
| Store operations | Seller order inbox and operation RPCs | `organization_has_permission` | `VIEW_ORDERS` / `MANAGE_ORDERS` | Owner, Manager, Fulfilment |
| Store catalogue | Product-management workspace | Organization helper / UI gate | `MANAGE_PRODUCTS` | Owner, Manager |
| Hotel and tour | Booking operations | Organization helper | `VIEW_BOOKINGS` / `MANAGE_BOOKINGS` | Hotel Owner/Reception, Tour Owner/Operations |
| Finance | Earnings views | Organization helper | `VIEW_EARNINGS` | Finance and owner |
| Staff administration | Membership update RPC | `set_my_hobee_organization_member` | `MANAGE_STAFF`, or owner/admin implicit authority | Owner / HOBEE Manager |
| Cross-organization | Switch Local Store ↔ Hotel | RLS helper evaluates organization id per query | Active membership plus current data scope | MULTI_ROLE_USER |
| Suspension | Any organization route | `private.is_organization_member` | Membership status must equal `active` | CUSTOMER_BASIC suspended membership |

> **Security rule:** Hiding UI is never an authorization control. The server-side RLS policies and the protected RPC functions remain the security boundary. Any future claims, inventory, customer, or settings feature must map to an existing permission only after the backend contract explicitly introduces it.
