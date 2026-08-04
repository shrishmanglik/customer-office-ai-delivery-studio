import type { ConnectorContract, KnowledgeSource, UseCase } from "@/src/lib/domain/types";

const timestamp = "2026-07-20T12:00:00.000Z";

export const syntheticUseCase: UseCase = {
  id: "SYNTHETIC_USE_CASE_001",
  version: 3,
  owner: "SYNTHETIC_SPECIALIST",
  createdAt: timestamp,
  updatedAt: timestamp,
  source: "SYNTHETIC_FIXTURE",
  status: "SANDBOX",
  title: "Weekly synthetic account-risk brief",
  businessOwner: "SYNTHETIC_SERVICES_MANAGER",
  technicalOwner: "SYNTHETIC_INTEGRATION_SPECIALIST",
  champion: "SYNTHETIC_CHAMPION",
  measurableOutcome: "Required evidence fields are complete and policy-safe",
  manualFallback: "Champion follows the static review checklist",
  stopCondition: "Stop after any denied action, stale source, or exhausted retry",
  synthetic: true,
};

export const knowledgeSources: readonly KnowledgeSource[] = [
  {
    id: "SYNTHETIC_SOURCE_CRM",
    version: 4,
    owner: "SYNTHETIC_DATA_OWNER",
    createdAt: timestamp,
    updatedAt: timestamp,
    source: "SYNTHETIC_FIXTURE",
    status: "CURRENT",
    name: "Synthetic CRM health snapshot",
    classification: "CONFIDENTIAL",
    freshnessHours: 24,
    ageHours: 4,
    retrievalScope: ["synthetic_account.health", "synthetic_account.stage"],
    provenance: "fixtures/synthetic-risk-brief.ts#crm",
  },
  {
    id: "SYNTHETIC_SOURCE_SUCCESS",
    version: 2,
    owner: "SYNTHETIC_DATA_OWNER",
    createdAt: timestamp,
    updatedAt: timestamp,
    source: "SYNTHETIC_FIXTURE",
    status: "CURRENT",
    name: "Synthetic success milestone snapshot",
    classification: "INTERNAL",
    freshnessHours: 24,
    ageHours: 8,
    retrievalScope: ["synthetic_milestone.state", "synthetic_milestone.due_week"],
    provenance: "fixtures/synthetic-risk-brief.ts#success",
  },
];

function connector(
  values: Pick<
    ConnectorContract,
    "id" | "system" | "objectAllowlist" | "fieldAllowlist" | "timeoutMs" | "manualFallback"
  >,
): ConnectorContract {
  return {
    ...values,
    version: 1,
    owner: "SYNTHETIC_CONNECTOR_OWNER",
    createdAt: timestamp,
    updatedAt: timestamp,
    source: "SYNTHETIC_FIXTURE",
    status: "SANDBOX_CERTIFIED",
    environment: "SYNTHETIC_SANDBOX",
    direction: "READ",
    allowedActions: ["READ"],
    transformation: "Allowlisted fields to normalized risk-brief facts",
    classification: "CONFIDENTIAL",
    retention: "In-memory for this demo run only",
    authenticationReference: "SYNTHETIC_REFERENCE_NO_CREDENTIAL",
    rateLimitPerMinute: 30,
    concurrencyLimit: 2,
    idempotencyKey: `${values.id}:request:v1`,
    retryPolicy: {
      maxAttempts: 2,
      backoffMs: 250,
      retryableErrors: ["TIMEOUT", "TEMPORARY_UNAVAILABLE"],
    },
    deadLetterBehaviour: "Preserve failed request metadata in the run receipt",
    rollbackOwner: "SYNTHETIC_PLATFORM_ADMIN",
  };
}

export const connectorContracts: readonly ConnectorContract[] = [
  connector({
    id: "SYNTHETIC_CONNECTOR_CRM",
    system: "CRM",
    objectAllowlist: ["synthetic_account"],
    fieldAllowlist: ["health", "stage"],
    timeoutMs: 1_500,
    manualFallback: "Use the last valid signed snapshot",
  }),
  connector({
    id: "SYNTHETIC_CONNECTOR_SUCCESS",
    system: "SUCCESS",
    objectAllowlist: ["synthetic_milestone"],
    fieldAllowlist: ["state", "due_week"],
    timeoutMs: 1_500,
    manualFallback: "Request a champion-entered milestone status",
  }),
  connector({
    id: "SYNTHETIC_CONNECTOR_ISSUES",
    system: "ISSUES",
    objectAllowlist: ["synthetic_issue"],
    fieldAllowlist: ["severity", "status"],
    timeoutMs: 700,
    manualFallback: "Attach the static issue review checklist",
  }),
  connector({
    id: "SYNTHETIC_CONNECTOR_WAREHOUSE",
    system: "WAREHOUSE",
    objectAllowlist: ["synthetic_usage"],
    fieldAllowlist: ["active_days", "trend"],
    timeoutMs: 2_000,
    manualFallback: "Mark usage evidence unavailable",
  }),
];
