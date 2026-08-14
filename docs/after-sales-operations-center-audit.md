# HOBEE After-Sales Operations Center — Audit

## Existing system reused

| Area | Existing source of truth | Reuse decision |
|---|---|---|
| Case | `after_sales_cases`, events, messages, evidence, refunds, returns, replacements | Reuse all tables; extend fields, policy and trusted procedures only |
| Customer lifecycle | `orders`, `payments`, `shipments`, `order_lifecycle_events` | Retain contracts and add generic event ledger rather than new order statuses |
| Work inbox | `work_inbox_items` with source key/idempotency | Reuse as execution queue for seller/admin; mobile never creates primary claim tasks |
| Notifications | `user_notifications` and Expo push bootstrap | Reuse in-app source of truth; add preferences and outbox delivery boundary |
| Organization | organization/shop links and membership permissions | Reuse ownership links; add claim-specific permissions to existing permission table |
| Evidence | private `after-sales-evidence` storage bucket | Reuse private bucket; improve signed access path and event notifications |
| Admin | `/admin/after-sales` | Extend current minimal queue; do not create a second case table or dashboard source |
| Seller native | `/my-hobee/work` | Extend existing Work Center with a case dashboard/queue and protected quick actions |

## Gaps identified

1. Current message RLS exposes `internal` only to platform admin. The Operations Center requires an explicit seller/admin internal-note permission rather than client-side filtering.
2. The current case trigger creates seller work items only at `CLAIM_SUBMITTED`; later statuses, evidence, return, finance and replacement events do not consistently generate recipient-specific work.
3. Existing notifications are idempotent in-app records but have no preferences, outbox state, badge aggregation or event taxonomy beyond local strings.
4. Existing case statuses are sufficient as the main workflow. `RETURN_PENDING`, `REFUND_PENDING` and `REPLACEMENT_PENDING` should be derived from linked process records to avoid duplicate case status state.
5. SLA has policy windows for claims/returns but lacks target timestamps, breach calculation, queue ordering and notification escalation.
6. Existing after-sales actions expose only generic status changes, refund authorization, return tracking and replacement shipping. Assignment, priority, internal note, inspection and process-specific approval actions are absent.

## Security baseline confirmed

All audited case, evidence, refund, return/replacement, work inbox, notification and organization-permission tables have RLS enabled. Protected procedures already own customer receipt, claim submission, refund limits and replacement shipping; this remains the correct write boundary.

## Event architecture decision

The requested workflow is deterministic and triggered by database state changes. Phase implementation will use database event rows/triggers/protected procedures inside the existing Supabase source of truth, then create work/notification records idempotently. Push delivery remains best-effort and cannot roll back the originating case or financial transaction.
