import { describe, expect, it } from "vitest";
import { evaluateToolRequest } from "@/src/lib/domain/policy-engine";
import { connectorContracts } from "@/src/lib/fixtures/synthetic-risk-brief";

describe("critical connector permission validator", () => {
  it("denies a write even when the connector exists", () => {
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
    );
    expect(decision).toMatchObject({ allowed: false, state: "BLOCKED_PERMISSION" });
  });
});
