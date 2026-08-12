# Travel Integration and Privacy Boundary

## Maps

Travel Home and Listing Detail open an external Google Maps search URL built only from validated latitude and longitude. The app does not embed a Google Maps SDK or collect live location in the Travel MVP. A native interactive map requires an approved Maps integration, provider key configuration and a separate location-permission UX.

## Share and referral

The listing share sheet uses a canonical `https://hobee.app/travel/{slug}` URL. The link builder accepts an optional `ref` value but the app does not create, validate, reward or persist referral codes until a server-side referral program exists.

## Personal and payment data

The preview booking flow accepts contact fields only for UI validation. It intentionally does not collect passport number, national ID, emergency contacts, insurance details or payment proof. These fields require an explicit consent record, encryption and retention policy, operator-scoped RLS and a server-side write endpoint before they may be enabled.

## Authoritative booking state

The booking preview, voucher and map content must not be interpreted as live inventory, a confirmed reservation or a payment receipt. A live implementation needs an authenticated server mutation that atomically checks availability, rates and booking state before invoking the existing payment adapter.
