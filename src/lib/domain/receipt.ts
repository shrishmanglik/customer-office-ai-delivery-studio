import type {
  ApprovalDecision,
  EvidenceReceipt,
  ReadinessCheck,
  WorkflowRun,
} from "@/src/lib/domain/types";

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stable(nested)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export async function sha256(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(stable(value));
  const buffer = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createReleaseReceipt(input: {
  useCaseId: string;
  workflowVersion: number;
  approvals: readonly ApprovalDecision[];
  checks: readonly ReadinessCheck[];
  runs: readonly WorkflowRun[];
}): Promise<EvidenceReceipt> {
  const requiredApprovals = ["SERVICES_MANAGER", "SECURITY_DATA_REVIEWER"];
  const approvedRoles = input.approvals
    .filter((approval) => approval.decision === "APPROVED")
    .map((approval) => approval.role);
  const ready =
    input.checks.every((check) => check.state === "PASS") &&
    requiredApprovals.every((role) => approvedRoles.includes(role as ApprovalDecision["role"]));
  const payload = {
    useCaseId: input.useCaseId,
    workflowVersion: input.workflowVersion,
    approvals: input.approvals,
    checks: input.checks,
    runIds: input.runs.map((run) => run.id),
    source: "SYNTHETIC_FIXTURE" as const,
  };
  const digest = await sha256(payload);

  return {
    receiptId: `SYNTHETIC_RELEASE_${digest.slice(0, 12).toUpperCase()}`,
    kind: "RELEASE_CANDIDATE",
    ...payload,
    status: ready ? "READY_FOR_PILOT" : "BLOCKED",
    digestAlgorithm: "SHA-256",
    digest,
  };
}
