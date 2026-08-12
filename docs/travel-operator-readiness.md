# HOBEE Travel Operator Workspace Readiness

## Current capability boundary

The mobile travel UI currently displays only a **preview travel catalogue**. It does not create live bookings, reserve inventory, accept payment proof, issue an authoritative voucher, or settle funds. An operator workspace must remain server-backed and operator-scoped before those functions are enabled.

| Workspace area | Required server data | Current mobile status | Production gate |
|---|---|---:|---|
| Room and rate management | Travel listing, room type, seasonal rate and availability tables | Not connected | Operator RLS + inventory validation |
| Booking center | Confirmed travel bookings, payment verification and cancellation audit | Not connected | Server booking API + payment webhook |
| Check-in / check-out | Confirmed voucher reference and check-in audit | Preview-only voucher | Signed voucher validation service |
| Traveler manifest | Consent-protected traveller profiles and travel documents | Not collected | Encryption, retention policy and operator RLS |
| Finance settlement | Payout ledger, fee policy and bank account verification | Not connected | Settlement engine + financial reconciliation |

## Required roles

The existing `user_roles` model should be extended only after server enforcement exists. Recommended roles are `travel_operator`, `travel_manager` and `travel_finance`. A role alone is insufficient: every travel query and mutation must additionally scope to the operator that owns the listing.

## Booking integrity rules

The booking API must atomically validate the current availability, price, selected room/departure, add-ons and payment amount. The app must send a draft only; it must never calculate an authoritative final amount or convert a preview voucher into a valid check-in token.

## Settlement rules

Settlement should be calculated server-side after trip completion or check-out, using a separately versioned fee policy. The app must display a payout status but must never expose bank-account information, traveller documents or payment-provider secrets.
