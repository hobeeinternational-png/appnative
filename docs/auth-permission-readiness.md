# Supabase Auth & Authorization Readiness

## Current database coverage

The production audit found one profile, two `user_roles` entries (`admin` and `customer`), three organizations, **zero active organization memberships**, zero organization permission grants, and zero after-sales cases. This confirms that the schema exists but does not yet provide live persona coverage for seller, manager, fulfilment, support, finance or customer after-sales E2E testing.

| Flow | Source readiness | Runtime evidence | Remaining evidence |
|---|---|---|---|
| Email + password sign-in | Code complete | Not verified | Existing and new customer login, invalid password, logout, session restore |
| Phone + password sign-in | Code complete | Blocked | Enable Supabase Phone Auth/SMS provider, then verify Thai normalization and errors |
| Password reset | Code complete | Not verified | Verify email delivery and `manushobeemobile://auth/reset-password` on cold start |
| Admin session | Code complete | Not verified | Use real admin session, reload portal, verify logout and privilege denial after role removal |
| Customer order/case isolation | RLS/procedure complete | Not verified | Two customer accounts must prove cross-order/cross-case denial |
| Seller operations | RLS/procedure complete | Blocked | Create organization membership and only the minimum role permissions needed for test user |
| Organization permissions | Schema complete | Blocked | Verify Owner, Manager, Fulfilment, Support and Finance allow/deny matrix |
| After-sales approval/refund | Protected RPC complete | Blocked | Requires active admin and test case; payment provider integration is separate blocker |

No user, role, membership, permission, order or case data was inserted during the audit. This preserves production data integrity but means E2E authorization remains blocked until the owner provisions dedicated non-production or controlled test personas.
