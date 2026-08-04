import { describe, expect, it } from "vitest";
import { evaluateSyntheticScenario } from "@/src/lib/service/evaluation-service";

describe("evaluation service boundary", () => {
  it.each([
    ["golden", "COMPLETED"],
    ["stale-source", "BLOCKED_SOURCE"],
    ["denied-write", "BLOCKED_PERMISSION"],
    ["jira-timeout", "MANUAL_FALLBACK"],
  ] as const)("returns the declared outcome for %s", (scenario, outcome) => {
    expect(evaluateSyntheticScenario(scenario).run.outcome).toBe(outcome);
  });

  it("preserves stale context as a readiness blocker", () => {
    const check = evaluateSyntheticScenario("stale-source").readiness.find(
      (candidate) => candidate.id === "SOURCE_FRESHNESS",
    );
    expect(check).toMatchObject({ state: "BLOCK" });
    expect(check?.reason).toContain("72h old");
  });
});
