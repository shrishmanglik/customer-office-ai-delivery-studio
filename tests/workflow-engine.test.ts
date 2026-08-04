import { describe, expect, it } from "vitest";
import { runWorkflowScenario } from "@/src/lib/domain/workflow-engine";
import { connectorContracts, knowledgeSources } from "@/src/lib/fixtures/synthetic-risk-brief";

describe("workflow engine", () => {
  it.each([
    ["golden", "COMPLETED", false],
    ["stale-source", "BLOCKED_SOURCE", false],
    ["denied-write", "BLOCKED_PERMISSION", false],
    ["jira-timeout", "MANUAL_FALLBACK", true],
  ] as const)("routes %s to %s", (scenario, outcome, fallbackUsed) => {
    const run = runWorkflowScenario(scenario, knowledgeSources, connectorContracts);
    expect(run.outcome).toBe(outcome);
    expect(run.fallbackUsed).toBe(fallbackUsed);
    expect(run.steps.every((step) => step.owner && step.nextAction)).toBe(true);
  });

  it("is deterministic for the same versioned inputs", () => {
    expect(runWorkflowScenario("golden", knowledgeSources, connectorContracts)).toEqual(
      runWorkflowScenario("golden", knowledgeSources, connectorContracts),
    );
  });

  it("preserves source versions on every run", () => {
    expect(runWorkflowScenario("golden", knowledgeSources, connectorContracts).sourceVersions).toEqual([
      "SYNTHETIC_SOURCE_CRM@4",
      "SYNTHETIC_SOURCE_SUCCESS@2",
    ]);
  });
});
