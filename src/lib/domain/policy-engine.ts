import type {
  ConnectorContract,
  KnowledgeSource,
  PolicyDecision,
  ReadinessCheck,
  ToolRequest,
  UseCase,
} from "@/src/lib/domain/types";

export type PermissionBoundary = (
  request: ToolRequest,
  connector: ConnectorContract | undefined,
) => PolicyDecision;

export function enforcePermissionBoundary(
  request: ToolRequest,
  connector: ConnectorContract | undefined,
): PolicyDecision {
  const blocked = (reason: string): PolicyDecision => ({
    allowed: false,
    state: "BLOCKED_PERMISSION",
    reason,
    owner: connector?.owner ?? "SYNTHETIC_PLATFORM_ADMIN",
    nextAction: "Return to the versioned connector contract; do not expand scope automatically",
  });

  if (!connector) return blocked("Connector is not registered");
  if (request.environment !== connector.environment) return blocked("Environment boundary mismatch");
  if (!connector.allowedActions.includes(request.action)) return blocked(`${request.action} is not allowed`);
  if (!connector.objectAllowlist.includes(request.object)) return blocked("Object is outside the allowlist");
  if (request.fields.some((field) => !connector.fieldAllowlist.includes(field))) {
    return blocked("One or more fields are outside the allowlist");
  }
  if (!request.purpose.trim()) return blocked("Versioned purpose is required");

  return {
    allowed: true,
    state: "ALLOWED",
    reason: "Action is inside the versioned synthetic connector boundary",
    owner: connector.owner,
    nextAction: "Continue with the deterministic workflow step",
  };
}

export function evaluateToolRequest(
  request: ToolRequest,
  connectors: readonly ConnectorContract[],
  permissionBoundary: PermissionBoundary = enforcePermissionBoundary,
): PolicyDecision {
  return permissionBoundary(
    request,
    connectors.find((candidate) => candidate.id === request.connectorId),
  );
}

export function evaluateReadiness(
  useCase: UseCase,
  sources: readonly KnowledgeSource[],
  connectors: readonly ConnectorContract[],
): readonly ReadinessCheck[] {
  const checks: ReadinessCheck[] = [];
  const requiredOwners = [
    useCase.businessOwner,
    useCase.technicalOwner,
    useCase.champion,
    useCase.measurableOutcome,
    useCase.manualFallback,
    useCase.stopCondition,
  ];
  checks.push({
    id: "OWNERS_AND_OUTCOME",
    label: "Owners, outcome, fallback, and stop condition",
    state: requiredOwners.every((value) => value.trim()) ? "PASS" : "BLOCK",
    reason: requiredOwners.every((value) => value.trim())
      ? "Every required authority and recovery field is named"
      : "At least one required authority or recovery field is missing",
    owner: useCase.owner,
    nextAction: "Complete the intake contract before design review",
  });

  const staleSource = sources.find((source) => source.ageHours > source.freshnessHours);
  checks.push({
    id: "SOURCE_FRESHNESS",
    label: "Context freshness and provenance",
    state: staleSource ? "BLOCK" : "PASS",
    reason: staleSource
      ? `${staleSource.id} is ${staleSource.ageHours}h old against a ${staleSource.freshnessHours}h policy`
      : "Every synthetic source is within its declared freshness policy",
    owner: staleSource?.owner ?? useCase.technicalOwner,
    nextAction: "Refresh the source or preserve a named BLOCKED_SOURCE outcome",
  });

  const incompleteConnector = connectors.find(
    (connector) =>
      !connector.objectAllowlist.length ||
      !connector.fieldAllowlist.length ||
      !connector.allowedActions.length ||
      !connector.authenticationReference ||
      !connector.manualFallback ||
      !connector.rollbackOwner ||
      connector.rateLimitPerMinute <= 0 ||
      connector.timeoutMs <= 0,
  );
  checks.push({
    id: "CONNECTOR_CONTRACTS",
    label: "Connector allowlists, limits, retry, fallback, and rollback",
    state: incompleteConnector ? "BLOCK" : "PASS",
    reason: incompleteConnector
      ? `${incompleteConnector.id} has an incomplete activation contract`
      : "All synthetic connectors have bounded activation contracts",
    owner: incompleteConnector?.owner ?? useCase.technicalOwner,
    nextAction: "Complete the connector contract; never infer missing controls",
  });

  return checks;
}
