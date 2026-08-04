import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluateSyntheticScenario } from "@/src/lib/service/evaluation-service";

const RequestSchema = z.object({
  scenarioId: z.enum(["golden", "stale-source", "denied-write", "jira-timeout"]),
});

export async function POST(request: Request) {
  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "INVALID_SYNTHETIC_SCENARIO",
        detail: "scenarioId must name one declared synthetic fixture",
      },
      { status: 400 },
    );
  }
  return NextResponse.json(evaluateSyntheticScenario(parsed.data.scenarioId));
}
