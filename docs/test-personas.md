# HOBEE Controlled QA Personas

> **Scope:** This catalogue applies only to the disposable Supabase branch `hobee-qa-identity` (`islisdlzuadwvxsocozj`). Every account uses the reserved `qa.hobee.invalid` email namespace, contains no personal customer data, and must never be seeded into the production project.

The branch intentionally starts without production rows. Auth identities must be provisioned through Supabase Auth on the branch before `supabase/qa/seed_identity_qa.sql` runs. The seed then upserts profiles, personal roles, role profiles, applications, organizations, memberships, and permission grants. It is idempotent and its reset script removes application and organization data without deleting Auth identities.

| Persona | Auth identifier | Personal roles | Organizations | Organization role | Expected access |
|---|---|---|---|---|---|
| CUSTOMER_BASIC | `qa+customer-basic@qa.hobee.invalid` | Customer only | QA Restaurant | Suspended staff | Account, My HOBEE role marketplace, one pending Teacher application; no organization access |
| CUSTOMER_MULTIROLE | `qa+customer-multirole@qa.hobee.invalid` | Customer, Creator, Affiliate, Employee | — | — | Multiple approved personal workspaces without organization context |
| SELLER_OWNER | `qa+seller-owner@qa.hobee.invalid` | Seller | QA Local Store, QA Restaurant | Owner | Store membership and owner-level permissions |
| SELLER_MANAGER | `qa+seller-manager@qa.hobee.invalid` | — | QA Local Store | Manager | Product and order operations only |
| SELLER_FULFILMENT | `qa+seller-fulfilment@qa.hobee.invalid` | — | QA Local Store | Fulfilment | View/manage order operations only |
| SELLER_CUSTOMER_SERVICE | `qa+seller-cs@qa.hobee.invalid` | — | QA Local Store | Staff | Read order context only; claims remain a backend gap |
| SELLER_FINANCE | `qa+seller-finance@qa.hobee.invalid` | — | QA Local Store, QA Hotel, QA Tour Company | Finance | Earnings scope only |
| HOTEL_OWNER / HOTEL_STAFF | `qa+hotel-owner…` / `qa+hotel-staff…` | Hotel owner / — | QA Hotel | Owner / Reception | Booking, rooms, staff or booking operational scope respectively |
| TOUR_OPERATOR_OWNER / STAFF | `qa+tour-owner…` / `qa+tour-staff…` | Tour operator / — | QA Tour Company | Owner / Operations staff | Booking, staff, earnings or booking operations respectively |
| CREATOR, AFFILIATE, TEACHER, GUIDE, SERVICE_PROVIDER | matching `qa+…@qa.hobee.invalid` | Named approved role | QA Tour / QA Service where relevant | Staff or Owner | Personal role workspace plus granted organization scope |
| HOBEE_EMPLOYEE / HOBEE_MANAGER / HOBEE_ADMIN | `qa+employee…`, `qa+manager…`, `qa+admin…` | Employee / Employee / Admin | QA HOBEE Internal | Staff / Manager / Admin | Internal restricted, management, and admin-gated views |
| MULTI_ROLE_USER | `qa+multi-role@qa.hobee.invalid` | Customer, Creator, Affiliate, Employee | QA Local Store, QA Hotel | Staff in both | One session switching personal role and organization context without data bleed |

## Controlled acceptance paths

| Journey | Test persona | Expected result |
|---|---|---|
| Role application | CUSTOMER_BASIC → HOBEE_ADMIN | Pending Teacher application becomes approved through the existing approval RPC, audit row is recorded, and the role profile refreshes |
| Staff limitation | SELLER_FULFILMENT | Direct owner or staff-management route is denied; only order-operation scope is exposed |
| Organization isolation | MULTI_ROLE_USER | Switching from QA Local Store to QA Hotel changes available permission scope without leaking the prior organization context |
| Suspended access | CUSTOMER_BASIC | The suspended QA Restaurant membership cannot satisfy member or permission helpers |
| Admin revocation | HOBEE_ADMIN | Removing the `admin` user role in branch data must deny admin route/API access after a session refresh |

## Provisioning and cleanup protocol

1. Keep the app pointed at production by default. Use the branch URL/key only in a local QA configuration, never an `EXPO_PUBLIC_*` production setting.
2. Create the named Auth identities in the QA branch with disposable credentials via the Auth administration surface; do not insert `auth.users` directly and do not commit passwords.
3. Run the seed only after setting the explicit session guard. The script aborts if any expected Auth identity is missing.
4. Rerun the seed to reset contract state. For a complete reset, discard the disposable branch; never merge its data or seed script into the production migration history.
