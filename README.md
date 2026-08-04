# Customer Office AI Delivery Studio

A governed operating workspace for turning a service-team AI use case into a traceable workflow, connector contract, test record, human approval gate, and reproducible release receipt.

This is an independent candidate-built product. It is not an employer product, internal roadmap, customer implementation, Amazon Quick integration, or Proofpoint/Satori integration. Every included person, account, system, event, and decision is explicitly synthetic.

## The problem

AI workflow delivery usually fragments across discovery notes, connector settings, prompt demos, test results, security review, champion guidance, and production operations. A successful demo can therefore sit beside missing owners, stale context, excess tool permissions, untested failure paths, or no rollback authority.

The studio keeps those seams in one reviewable operating record. Its first vertical is a synthetic weekly account-risk brief for a customer-office team.

## Who it serves

- AI integration specialists defining context, connector, workflow, and test contracts.
- Program champions testing approved sandbox workflows without changing access.
- Services managers owning outcome and pilot decisions.
- Security/data reviewers owning classification, permissions, and retention.
- Platform administrators owning credentials outside the product.

## Real implemented workflow

1. Inspect a versioned synthetic use case with named owners, outcome, fallback, and stop condition.
2. Qualify source freshness and connector completeness with deterministic rules.
3. Review read-only synthetic CRM, success, issue, and warehouse contracts.
4. Run four reproducible fixtures: golden completion, stale source, denied write, and timeout/fallback.
5. Record two explicitly synthetic human approval decisions.
6. Generate a stable SHA-256 release receipt over checks, approvals, source versions, and run IDs.

The same typed service powers the interface and `POST /api/v1/evaluations`.

## Architecture and authority split

```text
Next.js 16 UI + versioned API
           |
Typed evaluation service
           |
Deterministic readiness + permission policy + workflow state machine
           |
Synthetic fixtures -> named run receipts -> human gate -> SHA-256 release receipt
```

| Decision class | Authority |
|---|---|
| Required fields, source freshness, allowlists, retries, outcomes, digest | Deterministic code |
| Mapping or troubleshooting suggestions | Proposed AI boundary; not implemented at runtime |
| Access, scope expansion, pilot promotion, destructive retry, incident closure | Named human owner |

See [architecture](docs/ARCHITECTURE.md) for service boundaries, recovery, and the unapplied Supabase schema.

## Implemented versus proposed

### Implemented

- Responsive Next.js 16 / React 19 / TypeScript / Tailwind v4 interface using code-owned shadcn primitives.
- Typed use case, context, connector, workflow, test, approval, trace, and evidence boundaries.
- Deterministic validation before any AI boundary.
- Exact `BLOCKED_SOURCE`, `BLOCKED_PERMISSION`, and `MANUAL_FALLBACK` paths.
- Stable synthetic run identifiers, correlation IDs, source versions, owners, and next actions.
- SHA-256 release receipts invalidated by changed inputs.
- Focused tests, critical mutation control, production build, and Playwright journey.

### Proposed, not connected

- Supabase persistence and authentication. The RLS migration is source-only and unapplied.
- Real CRM, success, issue, warehouse, Amazon Quick, or Satori adapters.
- Provider-owned credential references and sandbox certification.
- Runtime AI suggestions, monitoring, analytics, customer use, and production deployment.

Provider state, applied schema, authentication, customers, demand, revenue, performance, and commercial outcomes remain `UNKNOWN`.

## Security and privacy

- Synthetic identifiers and payload shapes only; no employer, customer, employee, policyholder, case, threat, or account data.
- No credentials, provider SDK calls, scraping, telemetry, autonomous submission, external messaging, or production mutation.
- Least-privilege boundary by environment, action, object, and field.
- A connector being available never grants an action.
- `supabase/migrations/001_governed_delivery_schema.sql` enables RLS on every proposed table and makes run, approval, and evidence records append-only for authenticated clients.

## Commercial hypothesis

Hypothesis, not demand proof: services organizations may pay for a governed delivery layer when their AI integration work spans business discovery, connectors, testing, security review, champion enablement, and operations. The falsification test is whether integration specialists adopt the evidence packet without duplicating it in separate project-management and security systems. No customer discovery, willingness-to-pay, user, or revenue evidence is claimed.

## Local setup

Requirements: Node.js 20.9+ and npm.

```powershell
git clone https://github.com/shrishmanglik/customer-office-ai-delivery-studio.git
cd customer-office-ai-delivery-studio
npm.cmd ci
npm.cmd run dev
```

Open `http://localhost:3000`. No environment variable, account, or credential is needed.

## Tests and proof controls

```powershell
npm.cmd run check:synthetic
npm.cmd test
npm.cmd run test:critical
npm.cmd run control:mutation
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run test:e2e
```

The raw `npm.cmd run test:mutation:disabled` command must fail: it replaces the permission detector with an allow-all mutant while retaining the denial assertion. `control:mutation` is green only when that disabled-detector run is red.

See the [operator guide](docs/OPERATOR-GUIDE.md) for the reproducible demo path.

## Roadmap

1. Persist versioned records behind the proposed Supabase/RLS boundary and add role-separated authentication.
2. Add champion guide generation from accepted evidence only.
3. Add incident/remediation closure with dependent rerun invalidation.
4. Bind one authorized provider sandbox to the connector certification suite.
5. Measure adoption, workflow cycle time, fallback, and failure slices only after owners, formulas, sources, thresholds, and cadence are defined.

## Evidence boundary

Local tests prove source behavior on synthetic fixtures. GitHub proves only committed repository state. A pull request proves proposed code, not merge, deployment, provider configuration, customer use, or commercial success. No deployment is part of this build.
