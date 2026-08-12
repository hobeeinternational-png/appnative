# HOBEE Travel & Accommodations — MVP Architecture

## Scope and data status

The supplied specification defines a full marketplace for trips and accommodations. The current Supabase project contains product-commerce tables but no travel listing, room, itinerary, booking, traveller or operator tables. The first implementation therefore uses a **clearly isolated preview data layer** in `lib/travel-data.ts`; all preview listings say they require an availability and price confirmation from the operator. It must not be treated as live inventory.

## Travel MVP routes

| Route | Purpose | Data state |
|---|---|---|
| `/travel` | Travel home, province filters, quick intents and featured discovery | Preview layer, Supabase-ready boundary |
| `/travel/local-life` | Province/community local-life hub | Preview layer, stories boundary |
| `/travel/[id]` | Trip or accommodation gallery, details, rooms/itinerary, map boundary | Preview layer |
| `/travel/book/[id]` | Five-step booking flow | Local booking draft until server route is deployed |
| `/travel/voucher/[id]` | Digital voucher presentation | Derived from confirmed booking only |

## Server model to add before live bookings

The future Supabase implementation needs separate tables for `travel_listings`, `travel_listing_images`, `travel_room_types`, `travel_itinerary_days`, `travel_departures`, `travel_add_ons`, `travel_bookings`, `travel_booking_travelers`, `travel_booking_add_ons`, `travel_payment_proofs` and operator-controlled availability/rates. These tables must use RLS; passengers, passport/identity values, dietary and emergency-contact details must never be exposed through a public listing query.

## Payment and privacy boundary

The existing HOBEE payment system remains the only payment integration. The mobile app may create a travel booking draft but the backend must calculate availability, deposit, full-price discount and payable amount before it creates a payment intent. Card data remains tokenized at the provider. A payment-proof upload flow is a future server/storage feature, and traveller passport or identity fields require explicit consent, encryption-at-rest policy, retention policy and operator-scoped RLS before collection.
