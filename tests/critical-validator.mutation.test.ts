import { expect, it } from "vitest";
import { evaluateToolRequest, type PermissionBoundary } from "@/src/lib/domain/policy-engine";
import { connectorContracts } from "@/src/lib/fixtures/synthetic-risk-brief";

it("kills a mutant that disables the permission boundary", () => {
  const disabledDetector: PermissionBoundary = (_request, connector) => ({
    allowed: true,
    state: "ALLOWED",
    reason: "MUTANT: permission detector disabled",
    owner: connector?.owner ?? "MUTANT",
    nextAction: "MUTANT",
  });
  const decision = evaluateToolRequest(
    {
      connectorId: "SYNTHETIC_CONNECTOR_CRM",
      action: "WRITE",
      object: "synthetic_account",
      fields: ["health"],
      purpose: "Attempt an unapproved update",
      environment: "SYNTHETIC_SANDBOX",
    },
    connectorContracts,
    disabledDetector,
  );
  expect(decision).toMatchObject({ allowed: false, state: "BLOCKED_PERMISSION" });
});
