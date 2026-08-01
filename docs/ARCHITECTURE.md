# Architecture

## Implemented vertical

The application implements one complete synthetic workflow: an account-risk brief assembled from versioned mocked CRM, success, issue, and warehouse contracts. The browser and `/api/v1/evaluations` route call the same typed service boundary.

```text
Next.js UI / API route
        |
Evaluation service
        |
Readiness rules -> Permission boundary -> Workflow state machine
        |                                  |
Synthetic repository                 Run receipts
        |                                  |
        +-------- SHA-256 release receipt -+
```

The application makes no runtime AI call. An AI system may later propose mappings or troubleshooting hypotheses, but those proposals cannot change access, evidence, approval, or incident state.

## Authority split

| Layer | Implemented authority |
|---|---|
| Deterministic | Required-field checks, freshness, connector allowlists, action and field permission, retry ceiling, named failure state, receipt digest |
| AI | Not implemented at runtime; proposed only for non-authoritative suggestions |
| Human | Services and security/data approvals; scope expansion; destructive retry; pilot promotion; incident closure |

## Persistence boundary

The running demo uses versioned synthetic fixtures in memory. `supabase/migrations/001_governed_delivery_schema.sql` is an unapplied production schema proposal. It enables RLS on every table, limits each record to its `auth.uid()` owner, and makes run, approval, and evidence records append-only for authenticated clients. Applied provider state is `UNKNOWN` because no Supabase project was touched.

## Failure and recovery

- Stale context exits `BLOCKED_SOURCE`; it is never displayed as current or empty.
- A write against a read-only connector exits `BLOCKED_PERMISSION` before a tool action.
- A timeout performs one bounded retry, then exits `MANUAL_FALLBACK` with owner and next action.
- Every step preserves its source versions, correlation ID, retry count, fallback state, owner, and next action.
- Changing a versioned receipt input changes its SHA-256 digest.

## Security boundary

Fixtures carry `SYNTHETIC_*` identifiers only. Connector credentials are represented by a non-secret reference. There is no provider SDK call, telemetry, external message, production mutation, or employer integration.
