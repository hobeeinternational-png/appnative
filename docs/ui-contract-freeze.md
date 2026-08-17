# HOBEE MOBILE — UI CONTRACT FREEZE — BEFORE BACKEND WIRING

## Freeze principle

Backend wiring must conform to the UI contracts and route parameters already used by the application. This freeze does **not** change Supabase schema, authentication, Order, Payment, Loyalty, or Vercel API contracts.

## Identity, role and organization

| Domain | Stable identifier / contract | UI rule |
|---|---|---|
| User and profile | Supabase UUID string | User-owned screens require an authenticated session before any protected action. |
| Role | `customer`, `seller`, `admin`, plus `WorkspaceRole` strings | One user may have multiple roles; role availability must be evaluated before workspace action execution. |
| Organization | String organization ID with membership and permission context | Screens must tolerate no organization, one organization, multiple organizations, pending, and suspended access. |
| Workspace | `WorkspaceRole`, `WorkspaceScreenMode`, `WorkspaceRoleContract` | Generic role routes resolve through the central presentation contract instead of creating duplicate role entities. |

## Commerce, after-sales and local domains

| Domain | Contract convention | Status / money convention |
|---|---|---|
| Product / Store | String IDs and dynamic route params | Product amount is formatted centrally with Thai locale; unknown price remains unknown rather than synthesized. |
| Order / delivery | Existing order ID and route family `/orders/[id]` | Server authority owns financial total and fulfilment status. |
| Payment | Existing payment intent / return contract | Provider cards and secrets remain server-only; no client amount authority. |
| Claim | Existing case ID and `/claims/[id]` | Lifecycle remains server/RPC controlled. |
| Food | Distinct FoodCart presentation state | Food cart is not merged into e-commerce cart; order/reservation statuses are presentation until backend source is connected. |
| Travel | String listing/booking IDs | Booking uses explicit start/end and Thai-local display labels; policy and payment remain backend-owned. |

## Learning and Community

| Domain | Contract convention | Presentation boundary |
|---|---|---|
| Learning | Course, teacher, event, live and session IDs are strings | Local notes/bookmarks are device persistence; enrollment, content files, memberships and tickets need backend sources. |
| Community | `CommunityPerson`, `CommunityClub`, `CommunityActivity`, `CommunityJob`, `CommunityStory`, `CommunityPost`, `CommunityRecommendation` | Local presentation repository only. Do not infer verified followers, member counts, payments, job compensation, or moderation outcome. |

## Dates, money and statuses

Storage timestamps remain ISO-compatible strings where an operational source provides them. User display must use explicit Thai locale formatting and preserve the originating timezone; backend timestamps should be transmitted in UTC/ISO and displayed in `Asia/Bangkok` context where relevant.

Money presentation uses `THB` and Thai locale formatters. Payment, earnings, compensation, and unspecified prices must not be invented by UI. Existing common formatter implementations are reused rather than calculating totals in JSX.

Status is domain-specific. Internal statuses are mapped to a Thai label and UI tone at their domain helper/screen boundary. New backend status values must be added to a central mapping for the owning module before they are rendered.

## Entity relationship boundaries

Store and Restaurant Merchant are related but not interchangeable: stores cover local discovery while Restaurant Merchant operates Food-specific menus, queue, and reservations. Travel listings, Community trips, and Learning events retain source-module ownership and only link to their original module route. Community Profile and Creator Profile are views over the same identity direction but do not imply separate user records. Saved/favorite storage remains domain-bound until a shared backend taxonomy is explicitly approved.
