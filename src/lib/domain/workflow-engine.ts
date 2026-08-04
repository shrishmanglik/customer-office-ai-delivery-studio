import { evaluateToolRequest } from "@/src/lib/domain/policy-engine";
import type {
  ConnectorContract,
  KnowledgeSource,
  ScenarioId,
  WorkflowRun,
  WorkflowStepReceipt,
} from "@/src/lib/domain/types";

const runIds: Record<ScenarioId, string> = {
  golden: "SYNTHETIC_RUN_GOLDEN_001",
  "stale-source": "SYNTHETIC_RUN_STALE_001",
  "denied-write": "SYNTHETIC_RUN_DENIED_001",
  "jira-timeout": "SYNTHETIC_RUN_TIMEOUT_001",
};

function step(
  name: string,
  state: WorkflowStepReceipt["state"],
  detail: string,
  nextAction: string,
): WorkflowStepReceipt {
  return { step: name, state, detail, owner: "SYNTHETIC_INTEGRATION_SPECIALIST", nextAction };
}

export function runWorkflowScenario(
  scenarioId: ScenarioId,
  sources: readonly KnowledgeSource[],
  connectors: readonly ConnectorContract[],
): WorkflowRun {
  const receipts: WorkflowStepReceipt[] = [
    step("Validate context contract", "PASS", "Source owner, scope, and provenance are present", "Evaluate freshness"),
  ];

  if (scenarioId === "stale-source") {
    receipts.push(
      step(
        "Evaluate source freshness",
        "BLOCKED_SOURCE",
        "Synthetic success source exceeds its declared freshness window",
        "Refresh the fixture or keep the run blocked",
      ),
    );
    return finish(scenarioId, "BLOCKED_SOURCE", 0, false, receipts, sources);
  }

  receipts.push(step("Evaluate source freshness", "PASS", "Every source is current", "Apply connector policy"));
  const toolRequest = {
    connectorId: "SYNTHETIC_CONNECTOR_CRM",
    action: scenarioId === "denied-write" ? ("WRITE" as const) : ("READ" as const),
    object: "synthetic_account",
    fields: ["health", "stage"],
    purpose: "Assemble the versioned weekly synthetic risk brief",
    environment: "SYNTHETIC_SANDBOX" as const,
  };
  const policy = evaluateToolRequest(toolRequest, connectors);
  receipts.push(
    step(
      "Enforce connector permission",
      policy.allowed ? "PASS" : "BLOCKED_PERMISSION",
      policy.reason,
      policy.nextAction,
    ),
  );
  if (!policy.allowed) return finish(scenarioId, "BLOCKED_PERMISSION", 0, false, receipts, sources);

  if (scenarioId === "jira-timeout") {
    receipts.push(
      step("Read synthetic issue tracker", "TIMEOUT", "Two bounded attempts exhausted", "Enter the declared manual fallback"),
      step(
        "Manual fallback",
        "MANUAL_FALLBACK",
        "Static issue review checklist attached to the incomplete receipt",
        "Owner reviews the incomplete evidence before retry",
      ),
    );
    return finish(scenarioId, "MANUAL_FALLBACK", 1, true, receipts, sources);
  }

  receipts.push(
    step("Normalize deterministic facts", "PASS", "Allowlisted fixture fields mapped without an AI call", "Open human gate"),
    step("Human approval gate", "PASS", "Synthetic specialist prepared the brief for owner review", "Record owner decision"),
    step("Complete workflow", "COMPLETED", "Versioned output and trace receipt preserved", "Evaluate pilot release"),
  );
  return finish(scenarioId, "COMPLETED", 0, false, receipts, sources);
}

function finish(
  scenarioId: ScenarioId,
  outcome: WorkflowRun["outcome"],
  retryCount: number,
  fallbackUsed: boolean,
  steps: readonly WorkflowStepReceipt[],
  sources: readonly KnowledgeSource[],
): WorkflowRun {
  return {
    id: runIds[scenarioId],
    correlationId: `SYNTHETIC_CORRELATION_${scenarioId.toUpperCase().replaceAll("-", "_")}`,
    scenarioId,
    outcome,
    retryCount,
    fallbackUsed,
    sourceVersions: sources.map((source) => `${source.id}@${source.version}`),
    steps,
  };
}
