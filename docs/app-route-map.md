# HOBEE MOBILE — APP ROUTE MAP

**Audit baseline:** `ae7c48aa`  
**Inventory method:** Expo Router file routes, root stack registrations, static navigation targets, safe-back rules, and module entry points.  
**Total route files:** 132 user, system, and development routes.

> Expo Router resolves file routes automatically. Explicit root-stack entries are used where custom presentation, nested flows, or header behaviour needs to be controlled; absence of an explicit entry is not itself an orphan condition.

## Route hierarchy

```text
Home /(tabs)
├── Shop /(tabs)/shop → /product/[id] → /cart → /checkout → /payment/[orderId]
├── Discover /(tabs)/discover → /story/[id]
├── Stores /stores → /stores/[id] → preorder, saved, order status/review
├── Food /travel/food → menu/preorder, cart, reservation, queue, orders, map, saved
├── Travel /travel → province, trip, booking, voucher, My Trips, planner, visitor, safety
├── Learning /(tabs)/learn → catalogue, course/player, library, events, live, 1-on-1
├── Community /community → search, stories, clubs, activities, jobs, trips, profiles
└── My HOBEE /my-hobee → roles, work, earnings, notifications, specialist workspaces
    ├── Organization /organization
    ├── Seller /seller
    ├── Hotel and Tour /hospitality
    ├── Creator, Affiliate, Teacher /creative
    ├── Guide, Service Provider /field-service
    ├── Employee /employee
    └── Admin /admin → workspaces, commerce, travel, role approvals, after-sales
```

## Customer and commerce routes

| Route pattern | Screen / purpose | Primary entry | Gate | Safe-back fallback | Notification allow-list | Source state |
|---|---|---|---|---|---|---|
| `/(tabs)`, `/(tabs)/discover` | Home and discovery | Floating navigation | Public | Root | No | Mixed live/presentation |
| `/(tabs)/shop`, `/product/[id]` | Catalogue and product detail | Tab, cards, recently viewed | Public; customer action is authenticated | Shop | No | Catalogue live fallback |
| `/cart`, `/checkout`, `/checkout/address`, `/payment/[orderId]`, `/payment/callback` | Purchase presentation and payment return | Product/cart CTA | Checkout authenticated | Shop → cart → checkout | Payment callback only | Existing commerce contracts |
| `/orders`, `/orders/[id]`, `/orders/[id]/delivery`, `/orders/[id]/buy-again`, `/orders/[id]/help` | Customer order lifecycle | Account, notifications, order CTA | Authenticated | Account or order parent | Yes | Existing order contracts |
| `/claims`, `/claims/new`, `/claims/[id]` | After-sales cases | Order help and notification | Authenticated | Orders / claims parent | Yes | Existing case contracts |
| `/favorites`, `/rewards`, `/support`, `/notification/[id]` | Customer saved, loyalty, support and notification detail | Account, notification center | Mostly authenticated | Account / notification parent | Notification detail validates destination | Existing plus presentation states |
| `/auth`, `/auth/forgot-password`, `/auth/reset-password`, `/oauth/callback` | Password authentication and reset | Protected-route redirect | Public | Auth or callback owner | No | Supabase password flow |

## Local Stores and Food routes

| Route pattern | Screen / purpose | Primary entry | Gate | Safe-back fallback | Notification allow-list | Source state |
|---|---|---|---|---|---|---|
| `/stores`, `/stores/[id]`, `/stores/saved` | Local store directory, detail, saved stores | Home category, discovery, maps | Public; saved action authenticated when live | Stores | Saved only | Presentation repository / local preferences |
| `/stores/[id]/preorder`, `/stores/orders/[reference]`, `/stores/orders/[reference]/review` | Store pre-order and local order follow-up | Store detail / order route | Customer action authenticated | Store / local order parent | Local order only | Presentation boundary |
| `/travel/food`, `/travel/restaurant/[id]`, `/travel/food/preorder/[id]` | Food discovery, restaurant detail, pre-order | Home Food category / Travel | Public browse; order actions gated at execution | Food hub | No | Food presentation contracts |
| `/travel/food/cart`, `/travel/food/orders`, `/travel/food/orders/[reference]`, `/travel/food/review/[id]` | Food cart, orders and review | Food hub / cart | Authenticated when live | Food hub / food orders | Yes | Separate FoodCart local state |
| `/travel/food/reservation/[id]`, `/travel/food/reservation/success/[id]`, `/travel/food/reservations`, `/travel/food/queue/[id]` | Reservation and queue flows | Restaurant detail | Presentation until reservation backend | Food / reservations parent | Reservations only | Presentation boundary |
| `/travel/food/map`, `/travel/food/search`, `/travel/food/saved`, `/travel/food/collections`, `/travel/food/safety` | Food utility and safety surfaces | Food hub | Public, location optional | Food hub | Saved only | Presentation / local preferences |
| `/restaurant-merchant` | Restaurant merchant workspace | My HOBEE role routing | Role / organization context | My HOBEE | No | Presentation workspace |

## Travel and Learning routes

| Route pattern | Screen / purpose | Primary entry | Gate | Safe-back fallback | Notification allow-list | Source state |
|---|---|---|---|---|---|---|
| `/travel`, `/travel/[id]`, `/travel/province/[id]`, `/travel/local-life`, `/travel/my-province` | Travel hub, listing, province and local life | Home Travel / discovery | Public | Travel | No | Presentation contracts / existing listing source |
| `/travel/book/[id]`, `/travel/voucher/[id]`, `/travel/preorder/[id]` | Booking and preview flows | Trip / travel detail | Authenticated at booking execution | Travel / My Trips | No | Presentation; reuse payment boundary |
| `/travel/my-trips`, `/travel/bookings/[id]`, `/travel/review/[id]`, `/travel/trip-builder` | Trip library, booking detail, review and planner | Travel hub | Authenticated for user-owned data | Travel / My Trips | Booking routes only | Presentation and retained booking contract |
| `/travel/restaurants`, `/travel/search`, `/travel/safety`, `/travel/visitor` | Travel discovery utilities | Travel hub | Public | Travel | No | Presentation |
| `/(tabs)/learn`, `/learning/[id]`, `/learning/my-learning`, `/learning/catalogue`, `/learning/search`, `/learning/category/[id]` | Learning home, player, library and catalogue | Learn tab | Public browse; library authenticated/local state | Learning / catalogue | Catalogue and library subset | Presentation + local library |
| `/learning/membership`, `/learning/teacher/[id]`, `/learning/events/*`, `/learning/live/[id]`, `/learning/sessions/[id]`, `/learning/calendar` | Membership, teacher, event, live and 1-on-1 flows | Learning hub | Access evaluated from presentation contract | Learning / events parent | Recognised event, live, session and teacher routes | Presentation boundary |

## Community routes

| Route pattern | Screen / purpose | Primary entry | Gate | Safe-back fallback | Notification allow-list | Source state |
|---|---|---|---|---|---|---|
| `/community`, `/community/search`, `/community/topics/[id]`, `/community/stories`, `/community/create` | Community discovery, search, topic, story and draft preview | Home Community category | Public browse; creation is preview | Community | Browse destinations only | Local presentation contract |
| `/community/clubs`, `/community/clubs/[id]`, `/community/clubs/create` | Club discovery, detail and create preview | Community home | Public browse; membership is preview | Community / clubs | Club destinations only | Local presentation contract |
| `/community/activities`, `/community/activities/[id]`, `/community/activities/create`, `/community/my-activities` | Activity discovery and participation preview | Community home | Public browse; join is preview | Community / activities | Activity destinations only | Local presentation contract |
| `/community/jobs`, `/community/jobs/[id]`, `/community/trips`, `/community/people/[id]` | Opportunities, trips and public people | Community feed and quick intents | Public browse | Community / list parent | Jobs, trips and people only | Local presentation contract |
| `/community/profile`, `/community/profile/network`, `/community/profile/privacy`, `/community/moderation` | Community profile, privacy and moderation presentation | Profile controls | Profile/moderation role boundary when backend is connected | Community / profile parent | Profile safe subset; moderation excluded | Local presentation contract |

## My HOBEE, role, organization and admin routes

| Route pattern | Screen / purpose | Primary entry | Gate | Safe-back fallback | Notification allow-list | Source state |
|---|---|---|---|---|---|---|
| `/my-hobee`, `/my-hobee/roles`, `/my-hobee/work`, `/my-hobee/earnings`, `/my-hobee/after-sales` | Personal command center and multi-role work | Center HOBEE navigation | Authenticated | My HOBEE | Yes | Existing role / work data + presentation |
| `/my-hobee/notifications`, `/my-hobee/notification-preferences`, `/notification/[id]` | Notification center, preferences and destination validation | Account / My HOBEE | Authenticated | My HOBEE notifications | Yes | Existing notification contract |
| `/organization`, `/seller`, `/hospitality`, `/creative`, `/field-service`, `/employee` | Specialist role hubs | Role marketplace and generic workspace router | Role and organization context | My HOBEE | No direct notification route | Presentation workspaces |
| `/workspace/[role]`, `/workspace/[role]/[screen]` | Generic role-screen resolver | Specialist hubs and role cards | Role context; unknown roles show empty state | My HOBEE | No | Central role presentation contract |
| `/admin`, `/admin/products`, `/admin/product/[id]`, `/admin/product/new`, `/admin/orders`, `/admin/stores`, `/admin/travel`, `/admin/travel/[id]`, `/admin/travel/new` | Admin commerce and travel operations | Admin entry on Account when allowed | Admin required | Admin parent | No direct notification route | Existing admin data and presentation |
| `/admin/role-approvals`, `/admin/after-sales`, `/admin/after-sales/[id]`, `/admin/workspace/[workspace]` | Admin approvals, cases and utility workspaces | Admin portal | Admin required | Admin parent | After-sales list only | Existing authorization + presentation |

## Intentional non-product routes

| Route | Classification | Rationale |
|---|---|---|
| `/oauth/callback`, `/payment/callback` | Intentional internal | Provider return/callback routes; not end-user navigation entries. |
| `/dev/theme-lab` | Development only | Visual token verification; excluded from customer navigation. |
| Generic `/workspace/[role]` routes | Intentional internal bridge | Resolves a role and routes to a specialist hub or role-screen contract. |

No user-facing duplicate screen was identified. Role hubs and generic role workspaces serve different routing responsibilities and are intentionally related rather than duplicates.
