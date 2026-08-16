# HOBEE Mobile — Production Operational Runbook

## Daily operating controls

| Surface | Check | Expected action |
|---|---|---|
| Vercel | Deployment health and function errors | Investigate before enabling payment/refund or push campaign |
| Payment webhook | Signature failures, amount mismatch, duplicate event handling | Keep payment in safe pending state; do not manually mark paid without provider evidence |
| Refund workflow | Requested/approved/processing/completed/failed counts | Finance/admin resolves failed callback with provider reference and audit note |
| Push outbox | Queued, sent, failed, suppressed, retry count | Retry only through worker policy; do not re-run source order/case mutation |
| After-sales SLA | At-risk/breached cases and unassigned queue | Assign staff and log action via protected workspace operation |
| Evidence storage | Upload failures and signed access denial | Confirm customer ownership and case linkage before retrying upload/access |
| Auth | Login/reset failures and suspicious error trends | Check provider/redirect configuration; never disable RLS or role checks to bypass a failure |

## Incident priority

| Priority | Examples | Immediate response |
|---|---|---|
| P0 | Secret exposed, payment/refund duplicate, cross-account data access | Disable affected integration/route, preserve logs, rotate secret, investigate before resuming |
| P1 | Payment webhook delivery failure, refund blocked, all push delivery failing | Pause automation for affected operation, retain queue state, escalate owner/provider |
| P2 | Single shipment tracking failure, non-critical notification delay | Create after-sales/work item and resolve within SLA |

## Safe replay rules

1. Replaying a webhook must retain the identical provider event identifier and pass the idempotency check.
2. Replaying a push job must reuse the outbox job identity; it must not recreate an order, case, refund or work event.
3. Provider refunds may be retried only after checking provider reference, current refund status and line allocation totals.
4. Manual status correction must go through a protected admin operation and leave an immutable case/order event. Direct database edits are prohibited except incident recovery with an approved audit record.

## Configuration change checklist

Before a change to payment, push, auth or shipping configuration, record environment, owner, secret rotation impact, rollback path and retest evidence. Production and sandbox secrets must remain isolated, server-only and absent from Expo public configuration.
