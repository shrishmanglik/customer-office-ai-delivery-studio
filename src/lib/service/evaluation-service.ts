import { evaluateReadiness } from "@/src/lib/domain/policy-engine";
import { runWorkflowScenario } from "@/src/lib/domain/workflow-engine";
import type { ScenarioId } from "@/src/lib/domain/types";
import {
  connectorContracts,
  knowledgeSources,
  syntheticUseCase,
} from "@/src/lib/fixtures/synthetic-risk-brief";

export function evaluateSyntheticScenario(scenarioId: ScenarioId) {
  const sources =
    scenarioId === "stale-source"
      ? knowledgeSources.map((source) =>
          source.id === "SYNTHETIC_SOURCE_SUCCESS" ? { ...source, ageHours: 72 } : source,
        )
      : knowledgeSources;
  return {
    useCase: syntheticUseCase,
    connectors: connectorContracts,
    sources,
    readiness: evaluateReadiness(syntheticUseCase, sources, connectorContracts),
    run: runWorkflowScenario(scenarioId, sources, connectorContracts),
  };
}
