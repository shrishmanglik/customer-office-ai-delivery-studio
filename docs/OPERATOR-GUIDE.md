# Operator guide

## Run locally

```powershell
npm.cmd ci
npm.cmd run dev
```

Open `http://localhost:3000`. No account or environment variable is required.

## Primary journey

1. Inspect the complete synthetic intake and deterministic readiness checks.
2. Review each read-only connector contract.
3. Run the stale-source fixture and confirm `BLOCKED_SOURCE`.
4. Run the denied-write fixture and confirm `BLOCKED_PERMISSION`.
5. Run the timeout fixture and confirm `MANUAL_FALLBACK` plus retry evidence.
6. Return to the golden task and confirm `COMPLETED`.
7. Record both explicitly synthetic human decisions.
8. Generate the release candidate receipt and inspect its SHA-256 digest.

## Recovery

- Refresh the page to restore the canonical versioned fixtures.
- No user or provider data is persisted by the implemented demo.
- A failed fixture is expected evidence, not an application error.
- If a real adapter is later added, its credential must stay in the owning provider. Only a reference and verification state may enter this product.

## Validation

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

`npm.cmd run test:mutation:disabled` is intentionally red. It proves the critical suite detects a disabled permission boundary. The wrapper `control:mutation` passes only when that mutant is killed.
