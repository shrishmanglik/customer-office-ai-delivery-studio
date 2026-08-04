import { describe, expect, it } from "vitest";
import { evaluateReadiness, evaluateToolRequest } from "@/src/lib/domain/policy-engine";
import { connectorContracts, knowledgeSources, syntheticUseCase } from "@/src/lib/fixtures/synthetic-risk-brief";

describe("policy engine", () => {
  it("passes a complete synthetic intake", () => {
    expect(evaluateReadiness(syntheticUseCase, knowledgeSources, connectorContracts)).toHaveLength(3);
    expect(evaluateReadiness(syntheticUseCase, knowledgeSources, connectorContracts).every((check) => check.state === "PASS")).toBe(true);
  });

  it("blocks a missing owner", () => {
    const checks = evaluateReadiness({ ...syntheticUseCase, businessOwner: "" }, knowledgeSources, connectorContracts);
    expect(checks.find((check) => check.id === "OWNERS_AND_OUTCOME")?.state).toBe("BLOCK");
  });

  it("blocks stale context without collapsing it into empty data", () => {
    const sources = knowledgeSources.map((source) => ({ ...source, ageHours: 96 }));
    expect(evaluateReadiness(syntheticUseCase, sources, connectorContracts).find((check) => check.id === "SOURCE_FRESHNESS")?.reason).toContain("96h old");
  });

  it("blocks an incomplete connector", () => {
    const connectors = [{ ...connectorContracts[0]!, manualFallback: "" }];
    expect(evaluateReadiness(syntheticUseCase, knowledgeSources, connectors).find((check) => check.id === "CONNECTOR_CONTRACTS")?.state).toBe("BLOCK");
  });

  it.each([
    ["missing connector", { connectorId: "UNKNOWN", action: "READ", object: "synthetic_account", fields: ["health"], purpose: "Read", environment: "SYNTHETIC_SANDBOX" }],
    ["wrong object", { connectorId: "SYNTHETIC_CONNECTOR_CRM", action: "READ", object: "real_account", fields: ["health"], purpose: "Read", environment: "SYNTHETIC_SANDBOX" }],
    ["wrong field", { connectorId: "SYNTHETIC_CONNECTOR_CRM", action: "READ", object: "synthetic_account", fields: ["secret"], purpose: "Read", environment: "SYNTHETIC_SANDBOX" }],
    ["missing purpose", { connectorId: "SYNTHETIC_CONNECTOR_CRM", action: "READ", object: "synthetic_account", fields: ["health"], purpose: "", environment: "SYNTHETIC_SANDBOX" }],
  ] as const)("denies %s", (_label, request) => {
    expect(evaluateToolRequest(request, connectorContracts).allowed).toBe(false);
  });

  it("allows an exact read contract", () => {
    expect(
      evaluateToolRequest(
        { connectorId: "SYNTHETIC_CONNECTOR_CRM", action: "READ", object: "synthetic_account", fields: ["health"], purpose: "Build brief", environment: "SYNTHETIC_SANDBOX" },
        connectorContracts,
      ).allowed,
    ).toBe(true);
  });
});
