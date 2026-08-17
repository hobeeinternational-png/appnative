# HOBEE QA Branch — RLS and RPC Verification Matrix

> **Execution boundary:** Run these checks only after the disposable QA Auth identities have been provisioned and `seed_identity_qa.sql` has completed on branch `islisdlzuadwvxsocozj`. The branch contains no production data. The verification suite must use authenticated user sessions or an authenticated-role JWT context; a service-role query does not prove RLS behavior.[1]

The current authorization model uses `public.user_roles` for platform administration, `public.organization_memberships` for active organization access, and `public.organization_member_permissions` for granular scope. The RLS helpers evaluate database rows rather than user-editable Auth metadata. This is intentional because mutable `user_metadata` is not appropriate for authorization decisions.[1]

| Case | Persona | Target | Expected result | Enforcement to verify | Status |
|---|---|---|---|---|---|
| Unauthenticated profile read | No session | `profiles` | Deny | `profiles_select_own` is restricted to `authenticated` | Pending QA Auth provisioning |
| Own profile | CUSTOMER_BASIC | Own `profiles` row | Allow read/update | `auth.uid()` equals profile ID | Pending QA Auth provisioning |
| Cross-user profile | CUSTOMER_BASIC | HOBEE_ADMIN profile | Deny | Profile RLS must not expose another user | Pending QA Auth provisioning |
| Customer role escalation | CUSTOMER_BASIC | `user_roles` update | Deny | No client role-write policy | Pending QA Auth provisioning |
| Own role application | CUSTOMER_BASIC | Teacher application | Allow own insert/read | Application RPC and own/app-admin policies | Pending QA Auth provisioning |
| Duplicate open application | CUSTOMER_BASIC | Second Teacher request | Update/idempotent result, no duplicate open row | Partial unique index plus application RPC | Pending QA Auth provisioning |
| Admin review | HOBEE_ADMIN | Pending Teacher application | Allow approve/reject with audit row | `private.is_platform_admin()` and review RPC | Pending QA Auth provisioning |
| Non-admin review | CUSTOMER_BASIC | Review RPC | Deny | `private.is_platform_admin()` | Pending QA Auth provisioning |
| Store owner | SELLER_OWNER | QA Local Store members and operational scope | Allow | Active owner membership / owner authority | Pending QA Auth provisioning |
| Store manager | SELLER_MANAGER | QA Local Store product/order scope | Allow only mapped permissions | `MANAGE_PRODUCTS`, `MANAGE_ORDERS` | Pending QA Auth provisioning |
| Fulfilment | SELLER_FULFILMENT | Staff-management or owner settings | Deny | Lacks `MANAGE_STAFF`; role is not owner/admin | Pending QA Auth provisioning |
| Finance | SELLER_FINANCE | Earnings across assigned QA organizations | Allow earnings only | `VIEW_EARNINGS` per organization | Pending QA Auth provisioning |
| Suspended member | CUSTOMER_BASIC | QA Restaurant organization scope | Deny | Membership status is not `active` | Pending QA Auth provisioning |
| Multi-organization switch | MULTI_ROLE_USER | QA Local Store then QA Hotel | Allow each own scope; no cross-org data bleed | Active membership and permission helper evaluated per organization | Pending QA Auth provisioning |
| Hotel vs Store isolation | HOTEL_STAFF | QA Local Store data | Deny | No membership in target organization | Pending QA Auth provisioning |
| Revoked admin | HOBEE_ADMIN after removing branch `admin` role | Admin route/API refresh | Deny and clear cached dashboard state | Fresh `isCurrentUserAdmin()` query + `useAdmin` cache clearing | Pending QA Auth provisioning |

## RPC surface review

| RPC | Intended caller | Verification requirement | Result before persona execution |
|---|---|---|---|
| `apply_for_hobee_role` | Authenticated applicant | Reject unauthenticated/unsupported role; prevent duplicate open applications | Static contract verified |
| `review_my_hobee_role_application` | Platform admin only | Require admin; write audit record and synchronize role profile | Static contract verified |
| `create_my_hobee_organization` | Authenticated owner | Require supported organization type and shop ownership where linked | Static contract verified |
| `set_my_hobee_organization_member` | Owner/admin or `MANAGE_STAFF` grantee | Reject role/permission values outside current contract; upsert membership and permissions | Static contract verified |

## Execution protocol

1. Provision only the disposable `qa.hobee.invalid` identities in the QA branch, then run the guarded idempotent seed.
2. Authenticate the app with one persona at a time against the QA branch URL and publishable key in a local-only configuration.
3. Execute the matrix through normal UI, direct route, and allowed deep link. Where an RPC is invoked, record allow/deny, returned error class, and the relevant audit row without copying user credentials into logs.
4. Reset data with `reset_identity_qa.sql`, or delete the non-persistent QA branch after testing. Never run either script against `tfqrykzqvdqxjnhzevvn`.

## References

[1]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase Row Level Security guide"
