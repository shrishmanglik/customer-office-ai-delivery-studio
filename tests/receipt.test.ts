import { describe, expect, it } from "vitest";
import { createReleaseReceipt } from "@/src/lib/domain/receipt";
import { evaluateReadiness } from "@/src/lib/domain/policy-engine";
import { runWorkflowScenario } from "@/src/lib/domain/workflow-engine";
import { connectorContracts, knowledgeSources, syntheticUseCase } from "@/src/lib/fixtures/synthetic-risk-brief";

const checks = evaluateReadiness(syntheticUseCase, knowledgeSources, connectorContracts);
const runs = [runWorkflowScenario("golden", knowledgeSources, connectorContracts)];
const approvals = [
  { role: "SERVICES_MANAGER" as const, decision: "APPROVED" as const, actor: "SYNTHETIC_REVIEWER" as const },
  { role: "SECURITY_DATA_REVIEWER" as const, decision: "APPROVED" as const, actor: "SYNTHETIC_REVIEWER" as const },
];

describe("release receipt", () => {
  it("is stable for identical inputs", async () => {
    const input = { useCaseId: syntheticUseCase.id, workflowVersion: 3, approvals, checks, runs };
    expect(await createReleaseReceipt(input)).toEqual(await createReleaseReceipt(input));
  });

  it("uses a 64-character SHA-256 digest", async () => {
    expect((await createReleaseReceipt({ useCaseId: syntheticUseCase.id, workflowVersion: 3, approvals, checks, runs })).digest).toMatch(/^[a-f0-9]{64}$/);
  });

  it("blocks release when a human approval is pending", async () => {
    const receipt = await createReleaseReceipt({
      useCaseId: syntheticUseCase.id,
      workflowVersion: 3,
      approvals: approvals.map((approval) => ({ ...approval, decision: "PENDING" as const })),
      checks,
      runs,
    });
    expect(receipt.status).toBe("BLOCKED");
  });

  it("invalidates the digest when workflow version changes", async () => {
    const first = await createReleaseReceipt({ useCaseId: syntheticUseCase.id, workflowVersion: 3, approvals, checks, runs });
    const second = await createReleaseReceipt({ useCaseId: syntheticUseCase.id, workflowVersion: 4, approvals, checks, runs });
    expect(second.digest).not.toBe(first.digest);
  });
});
