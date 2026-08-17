# HOBEE Mobile — Controlled Backend Wiring Phase 1

## Scope and environment

Phase 1 starts with identity, profile, personal role, organization, membership, and permission foundations only. The QA environment is the disposable Supabase branch **`hobee-qa-identity`** (`islisdlzuadwvxsocozj`) created from the production parent `tfqrykzqvdqxjnhzevvn` with no production data. Commerce, payment, refunds, shipping, travel bookings, learning, and community remain explicitly outside this phase.

| Domain | UI | Backend foundation | RLS / RPC | Test status | Phase 1 state |
|---|---|---|---|---|---|
| Auth | Email/phone password, signup, reset, session restore, logout | Supabase Auth client is present | Auth session used by client | Device tests pending QA branch configuration | Partial |
| Profile | Account and My HOBEE entry points | `profiles` table exists | Own-profile read/update policy | Adapter hardening pending | Partial |
| Personal roles | My HOBEE marketplace/workspaces | `user_roles`, `user_role_profiles` | Own/admin read plus review/application RPCs | QA seed and acceptance tests pending | Partial |
| Role applications | Customer/applicant and Admin approval UI | `role_applications`, audit logs | Own/admin policies and review RPC | Seed includes pending Teacher application | Ready to verify |
| Organizations | My HOBEE organization views | `organizations` and links exist | Member/admin read plus management RPC | QA seed supplies six organizations | Ready to verify |
| Memberships | Organization staff surfaces | membership and permission tables exist | Active-member helper and management RPC | QA seed supplies owner/staff/suspended cases | Ready to verify |
| Permissions | Role-aware workspace actions | Nine existing permission constants | `organization_has_permission` helper | Matrix documented; tests pending | Ready to verify |
| Admin authorization | Admin Portal/approval surface | `user_roles` with `admin` | `private.is_platform_admin()` | Revocation test pending | Partial |

## Safety controls

The QA seed lives outside `supabase/migrations` so it cannot join production migration history accidentally. It requires a session-scoped `app.hobee_qa_seed = 'allow'` guard and fails unless all disposable QA Auth identities already exist on the branch. Passwords, service-role keys, payment secrets, and webhook secrets are neither written to source nor exposed to the Expo client.

## Owner actions still required

| Action | Reason | Status |
|---|---|---|
| Provision disposable branch Auth accounts | Seed deliberately does not write to `auth.users` or store passwords | Required before seed execution |
| Configure a local QA app environment with branch URL and publishable key | Needed for native sign-in and session/device tests | Required; do not replace production app config |
| Enable Supabase Phone Auth | Required before phone/password journey can be tested | Blocked by Auth provider configuration |
| Enable leaked password protection | Security advisor reports it disabled | Required in Supabase Auth settings |
| Reconnect Vercel team and configure server-only secrets | Needed for later payment/webhook backend only | Deferred to subsequent phase |
