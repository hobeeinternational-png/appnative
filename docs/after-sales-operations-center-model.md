# HOBEE After-Sales Operations Center — Operating Model

## Unified event taxonomy

| Event family | Event types | Entity | Primary recipients |
|---|---|---|---|
| Commerce | `ORDER_CREATED`, `PAYMENT_PAID`, `ORDER_ACCEPTED`, `ORDER_SHIPPED`, `SHIPMENT_UPDATED`, `DELIVERED`, `CUSTOMER_RECEIVED` | order/shipment | customer and permitted seller operations |
| Claims | `CLAIM_SUBMITTED`, `CLAIM_UPDATED`, `CLAIM_NEED_INFO`, `CLAIM_APPROVED`, `CLAIM_REJECTED`, `CLAIM_ESCALATED` | after-sales case | customer, seller queue, admin when escalation/approval applies |
| Return | `RETURN_SHIPPED`, `RETURN_RECEIVED`, `RETURN_INSPECTED` | return shipment | customer, inspection queue, seller/admin |
| Refund | `REFUND_APPROVED`, `REFUND_PROCESSING`, `REFUND_COMPLETED`, `REFUND_FAILED` | refund | customer and finance/admin queue |
| Replacement | `REPLACEMENT_CREATED`, `REPLACEMENT_SHIPPED`, `REPLACEMENT_DELIVERED` | replacement shipment | customer and fulfilment queue |
| Workspace | `ROLE_APPROVED`, `WORK_ASSIGNED` | role/work item | affected user |

Each event row has a stable `event_key` made from source entity and transition, actor, optional organization, entity type/id, metadata and created timestamp. The unique `event_key` is the idempotency boundary. A trusted procedure emits the event then builds Work Inbox and notification records in the same database transaction; retries do not duplicate either recipient record.

## SLA model

`after_sales_cases` retains the only case status. SLA is represented as target timestamps and derived condition, not duplicate workflow statuses.

| SLA target | Starts | Target policy field | Queue consequence |
|---|---|---|---|
| First response | case submitted | `first_response_hours` | case work item is urgent when near/breached |
| Request for more information | `need_more_info` | `customer_response_hours` | customer reminder notification; case visible in follow-up queue |
| Refund processing | refund approved | `refund_processing_hours` | finance/admin work item |
| Return inspection | return received | `return_inspection_hours` | inspection work item |

The default policy deliberately has no active deadline until a platform admin configures hours. With an active policy, `normal`, `at_risk` and `breached` derive from server time plus target timestamp. No mobile client decides SLA state.

## Queue model

`after_sales_cases` will expose a trusted queue feed ordered by: SLA breached, SLA at risk, priority, newest activity. Derived process queues are based on linked records:

| Queue label | Predicate |
|---|---|
| New | `submitted` |
| Waiting review | `under_review` |
| Need customer information | `need_more_info` |
| Return pending | approved/in-progress case with return resolution and return status before `received` |
| Refund pending | linked refund status in `requested`, `approved` or `processing` |
| Replacement pending | replacement resolution without a delivered/received replacement shipment |
| In progress | `in_progress` |
| Closed | `closed` |

## Permission matrix

Existing organization membership and permission table remain authoritative. The following grant names are additive and checked by trusted routines.

| Permission | Scope |
|---|---|
| `VIEW_CLAIMS` | Read organization cases, non-internal customer conversation and evidence metadata |
| `MANAGE_CLAIMS` | Accept case, request information, communicate with customer, update permitted operational statuses |
| `VIEW_INTERNAL_NOTES` | Read seller/admin internal notes for the organization |
| `MANAGE_ASSIGNMENT` | Assign case staff and set operational priority |
| `APPROVE_RETURN` | Approve return instructions and record inspection result |
| `APPROVE_REPLACEMENT` | Approve/release replacement fulfilment |
| `APPROVE_REFUND` | Reserved for platform finance/admin; seller cannot create financial authorization |

Platform admin retains global review authority. Customer remains owner-only. Seller staff must satisfy both active organization membership and shop linkage before a row is visible.

## Notification preferences

Preferences are user-owned, keyed by `orders`, `claims`, `payments`, `shipping`, `earnings`, `work`, and `marketing`. Critical notifications (`security`, payment critical, order critical and claim decision/resolution) bypass marketing preferences but still remain idempotent in `user_notifications`. Push is placed in an outbox and failure never rolls back the source case or financial transition.

## Conversation and audit

Customer-visible conversation keeps `customer`, `seller` and `support` message types. `internal` note is exposed only to platform admin or active organization member with `VIEW_INTERNAL_NOTES`; customer RLS never sees it. Every protected status, assignment, priority, refund/return/replacement action writes an immutable case event with actor, prior state, next state, reason and source key.
