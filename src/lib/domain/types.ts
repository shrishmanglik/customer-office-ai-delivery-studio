export type VerificationState = "PASS" | "BLOCK" | "UNKNOWN";
export type DataClassification = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
export type ConnectorDirection = "READ" | "WRITE" | "READ_WRITE";
export type ConnectorSystem = "CRM" | "SUCCESS" | "ISSUES" | "WAREHOUSE";
export type RunOutcome =
  | "COMPLETED"
  | "BLOCKED_SOURCE"
  | "BLOCKED_PERMISSION"
  | "CONNECTOR_ERROR"
  | "POLICY_FAILURE"
  | "TIMEOUT"
  | "MANUAL_FALLBACK";

export interface VersionedRecord {
  id: string;
  version: number;
  owner: string;
  createdAt: string;
  updatedAt: string;
  source: "SYNTHETIC_FIXTURE";
  status: string;
}

export interface UseCase extends VersionedRecord {
  title: string;
  businessOwner: string;
  technicalOwner: string;
  champion: string;
  measurableOutcome: string;
  manualFallback: string;
  stopCondition: string;
  synthetic: true;
}

export interface KnowledgeSource extends VersionedRecord {
  name: string;
  classification: DataClassification;
  freshnessHours: number;
  ageHours: number;
  retrievalScope: readonly string[];
  provenance: string;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
  retryableErrors: readonly string[];
}

export interface ConnectorContract extends VersionedRecord {
  system: ConnectorSystem;
  environment: "SYNTHETIC_SANDBOX";
  direction: ConnectorDirection;
  objectAllowlist: readonly string[];
  fieldAllowlist: readonly string[];
  allowedActions: readonly ("READ" | "WRITE")[];
  transformation: string;
  classification: DataClassification;
  retention: string;
  authenticationReference: string;
  rateLimitPerMinute: number;
  concurrencyLimit: number;
  idempotencyKey: string;
  timeoutMs: number;
  retryPolicy: RetryPolicy;
  deadLetterBehaviour: string;
  manualFallback: string;
  rollbackOwner: string;
}

export interface ToolRequest {
  connectorId: string;
  action: "READ" | "WRITE";
  object: string;
  fields: readonly string[];
  purpose: string;
  environment: "SYNTHETIC_SANDBOX";
}

export interface PolicyDecision {
  allowed: boolean;
  state: "ALLOWED" | "BLOCKED_PERMISSION";
  reason: string;
  owner: string;
  nextAction: string;
}

export interface WorkflowStepReceipt {
  step: string;
  state: VerificationState | RunOutcome;
  detail: string;
  owner: string;
  nextAction: string;
}

export interface WorkflowRun {
  id: string;
  correlationId: string;
  scenarioId: ScenarioId;
  outcome: RunOutcome;
  retryCount: number;
  fallbackUsed: boolean;
  sourceVersions: readonly string[];
  steps: readonly WorkflowStepReceipt[];
}

export type ScenarioId = "golden" | "stale-source" | "denied-write" | "jira-timeout";

export interface ReadinessCheck {
  id: string;
  label: string;
  state: VerificationState;
  reason: string;
  owner: string;
  nextAction: string;
}

export interface ApprovalDecision {
  role: "SERVICES_MANAGER" | "SECURITY_DATA_REVIEWER";
  decision: "APPROVED" | "PENDING";
  actor: "SYNTHETIC_REVIEWER";
}

export interface EvidenceReceipt {
  receiptId: string;
  kind: "RELEASE_CANDIDATE";
  useCaseId: string;
  workflowVersion: number;
  status: "READY_FOR_PILOT" | "BLOCKED";
  approvals: readonly ApprovalDecision[];
  checks: readonly ReadinessCheck[];
  runIds: readonly string[];
  source: "SYNTHETIC_FIXTURE";
  digestAlgorithm: "SHA-256";
  digest: string;
}
