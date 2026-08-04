"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  FileCheck2,
  Fingerprint,
  GitBranch,
  LockKeyhole,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createReleaseReceipt } from "@/src/lib/domain/receipt";
import type { ApprovalDecision, EvidenceReceipt, ScenarioId } from "@/src/lib/domain/types";
import { connectorContracts, knowledgeSources, syntheticUseCase } from "@/src/lib/fixtures/synthetic-risk-brief";
import { evaluateSyntheticScenario } from "@/src/lib/service/evaluation-service";
import { cn } from "@/src/lib/utils";

const scenarios: readonly { id: ScenarioId; label: string; expectation: string }[] = [
  { id: "golden", label: "Golden task", expectation: "COMPLETED" },
  { id: "stale-source", label: "Stale context", expectation: "BLOCKED_SOURCE" },
  { id: "denied-write", label: "Denied CRM write", expectation: "BLOCKED_PERMISSION" },
  { id: "jira-timeout", label: "Issue timeout", expectation: "MANUAL_FALLBACK" },
];

const phases = ["Capture", "Qualify", "Design", "Connect", "Test", "Review", "Pilot"];

function stateTone(state: string): string {
  if (state === "PASS" || state === "COMPLETED" || state === "READY_FOR_PILOT") {
    return "border-emerald-300/20 bg-emerald-300/10 text-emerald-200";
  }
  if (state.includes("BLOCK") || state === "TIMEOUT") {
    return "border-rose-300/20 bg-rose-300/10 text-rose-200";
  }
  return "border-amber-300/20 bg-amber-300/10 text-amber-200";
}

export function DeliveryStudio() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("golden");
  const [servicesApproved, setServicesApproved] = useState(false);
  const [securityApproved, setSecurityApproved] = useState(false);
  const [receipt, setReceipt] = useState<EvidenceReceipt | null>(null);
  const evaluation = useMemo(() => evaluateSyntheticScenario(scenarioId), [scenarioId]);
  const fixtureRuns = useMemo(
    () => scenarios.map((scenario) => evaluateSyntheticScenario(scenario.id).run),
    [],
  );
  const allFixturesMatched = fixtureRuns.every(
    (run, index) => run.outcome === scenarios[index]?.expectation,
  );
  const canIssue = servicesApproved && securityApproved && allFixturesMatched;

  async function issueReceipt() {
    const approvals: ApprovalDecision[] = [
      {
        role: "SERVICES_MANAGER",
        decision: servicesApproved ? "APPROVED" : "PENDING",
        actor: "SYNTHETIC_REVIEWER",
      },
      {
        role: "SECURITY_DATA_REVIEWER",
        decision: securityApproved ? "APPROVED" : "PENDING",
        actor: "SYNTHETIC_REVIEWER",
      },
    ];
    setReceipt(
      await createReleaseReceipt({
        useCaseId: syntheticUseCase.id,
        workflowVersion: syntheticUseCase.version,
        approvals,
        checks: evaluateSyntheticScenario("golden").readiness,
        runs: fixtureRuns,
      }),
    );
  }

  return (
    <main className="grid-surface min-h-screen">
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/10">
              <Waypoints className="size-5 text-cyan-200" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">Customer Office AI Delivery Studio</p>
              <p className="truncate text-xs text-slate-400">Governed synthetic workflow lab</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="hidden border-cyan-300/20 bg-cyan-300/10 text-cyan-200 sm:inline-flex">Synthetic data only</Badge>
            <a
              href="#evidence"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Evidence
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-6">
            <nav aria-label="Delivery phases" className="space-y-1">
              {phases.map((phase, index) => (
                <a
                  key={phase}
                  href={index < 4 ? "#workspace" : index === 4 ? "#test-lab" : "#release"}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
                    index <= 4 ? "text-slate-200" : "text-slate-500",
                    phase === "Test" && "bg-white/[0.06] text-white",
                  )}
                >
                  <span className={cn("grid size-6 place-items-center rounded-full border text-[11px]", index <= 4 ? "border-cyan-300/30 text-cyan-200" : "border-white/10")}>
                    {index < 4 ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
                  </span>
                  {phase}
                </a>
              ))}
            </nav>
            <Card className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Authority</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">AI may propose. Deterministic controls decide. Named humans approve access and pilot release.</p>
            </Card>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/75 px-5 py-8 shadow-2xl shadow-black/20 sm:px-8 sm:py-10">
            <div className="max-w-4xl">
              <Badge className="border-indigo-300/20 bg-indigo-300/10 text-indigo-200">Independent candidate-built product</Badge>
              <h1 className="mt-5 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
                Turn an AI workflow from a promising demo into reviewable operating evidence.
              </h1>
              <p className="mt-5 max-w-3xl text-pretty text-base leading-7 text-slate-300 sm:text-lg">
                One synthetic service workflow, traced end to end: owners, sources, connector scope, policy decisions, failure recovery, human authority, and a reproducible release receipt.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild>
                  <a href="#test-lab">Run the test lab <ArrowRight className="size-4" aria-hidden="true" /></a>
                </Button>
                <Button asChild variant="outline">
                  <a href="#release">Inspect release controls</a>
                </Button>
              </div>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["4", "Synthetic scenarios"],
                ["0", "Runtime AI calls"],
                ["2", "Required human approvals"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-2xl font-semibold text-white">{value}</p>
                  <p className="mt-1 text-sm text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="workspace" className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
            <Card className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Use case 001 · version 3</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Weekly synthetic account-risk brief</h2>
                </div>
                <Badge className="border-emerald-300/20 bg-emerald-300/10 text-emerald-200">Sandbox</Badge>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ["Business owner", syntheticUseCase.businessOwner],
                  ["Technical owner", syntheticUseCase.technicalOwner],
                  ["Success contract", syntheticUseCase.measurableOutcome],
                  ["Stop condition", syntheticUseCase.stopCondition],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0 rounded-xl border border-white/[0.07] bg-black/10 p-4">
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className="mt-2 break-words text-sm leading-6 text-slate-200">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.06] p-4 text-sm text-amber-100">
                <CircleAlert className="size-5 shrink-0" aria-hidden="true" />
                No company, customer, employee, case, credential, or production payload is present.
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-emerald-300/10 text-emerald-200"><ShieldCheck className="size-5" aria-hidden="true" /></div>
                <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Deterministic qualification</p><h2 className="mt-1 text-lg font-semibold text-white">{evaluation.readiness.filter((check) => check.state === "PASS").length}/{evaluation.readiness.length} controls pass</h2></div>
              </div>
              <div className="mt-5 space-y-3">
                {evaluation.readiness.map((check) => (
                  <div key={check.id} className="flex gap-3 rounded-xl border border-white/[0.07] p-3.5">
                    <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border", stateTone(check.state))}>
                      {check.state === "PASS" ? <Check className="size-3.5" aria-hidden="true" /> : <CircleAlert className="size-3.5" aria-hidden="true" />}
                    </span>
                    <div className="min-w-0"><p className="text-sm font-medium text-slate-100">{check.label}</p><p className="mt-1 text-xs leading-5 text-slate-400">{check.reason}</p></div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Connector registry</p><h2 className="mt-2 text-2xl font-semibold text-white">Explicit scope before availability</h2></div><Badge>{connectorContracts.length} synthetic contracts</Badge></div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {connectorContracts.map((connector) => (
                <Card key={connector.id} className="min-w-0 p-4">
                  <div className="flex items-center justify-between gap-3"><GitBranch className="size-5 text-cyan-200" aria-hidden="true" /><Badge className="text-[9px]">Read only</Badge></div>
                  <h3 className="mt-5 font-semibold text-white">{connector.system}</h3>
                  <p className="mt-1 truncate text-xs text-slate-500">{connector.id}</p>
                  <dl className="mt-4 space-y-2 text-xs"><div className="flex justify-between gap-3"><dt className="text-slate-500">Objects</dt><dd className="truncate text-right text-slate-300">{connector.objectAllowlist.join(", ")}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Timeout</dt><dd className="text-slate-300">{connector.timeoutMs}ms</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Retries</dt><dd className="text-slate-300">{connector.retryPolicy.maxAttempts}</dd></div></dl>
                </Card>
              ))}
            </div>
          </section>

          <section id="test-lab" className="scroll-mt-6">
            <Card className="overflow-hidden">
              <div className="border-b border-white/10 p-5 sm:p-6"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-indigo-300/10 text-indigo-200"><Play className="size-5" aria-hidden="true" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">Reproducible test lab</p><h2 className="mt-1 text-xl font-semibold text-white">Exercise the named failure paths</h2></div></div></div>
              <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
                <div className="border-b border-white/10 p-3 lg:border-r lg:border-b-0">
                  {scenarios.map((scenario) => (
                    <button key={scenario.id} data-testid={`scenario-${scenario.id}`} type="button" onClick={() => { setScenarioId(scenario.id); setReceipt(null); }} className={cn("flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300", scenarioId === scenario.id ? "bg-white/[0.08] text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200")}>
                      <span>{scenario.label}</span><ChevronRight className="size-4 shrink-0" aria-hidden="true" />
                    </button>
                  ))}
                </div>
                <div className="min-w-0 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-slate-500">Run receipt</p><p className="mt-1 break-all font-mono text-xs text-slate-300">{evaluation.run.id}</p></div><Badge data-testid="run-outcome" className={stateTone(evaluation.run.outcome)}>{evaluation.run.outcome}</Badge></div>
                  <ol className="mt-6 space-y-0">
                    {evaluation.run.steps.map((runStep, index) => (
                      <li key={`${runStep.step}-${index}`} className="relative flex gap-4 pb-5 last:pb-0">
                        {index < evaluation.run.steps.length - 1 ? <span className="absolute left-[11px] top-7 h-[calc(100%-1.25rem)] w-px bg-white/10" aria-hidden="true" /> : null}
                        <span className={cn("relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border", stateTone(runStep.state))}>{runStep.state === "PASS" || runStep.state === "COMPLETED" ? <Check className="size-3.5" aria-hidden="true" /> : <CircleAlert className="size-3.5" aria-hidden="true" />}</span>
                        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-slate-100">{runStep.step}</p><span className="text-[10px] font-semibold text-slate-500">{runStep.state}</span></div><p className="mt-1 text-sm leading-6 text-slate-400">{runStep.detail}</p><p className="mt-1 text-xs text-slate-500">Next: {runStep.nextAction}</p></div>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">{[["Retries", String(evaluation.run.retryCount)], ["Fallback", evaluation.run.fallbackUsed ? "Used" : "Not used"], ["Sources", String(evaluation.run.sourceVersions.length)]].map(([label, value]) => <div key={label} className="rounded-xl bg-white/[0.03] p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-medium text-slate-200">{value}</p></div>)}</div>
                </div>
              </div>
            </Card>
          </section>

          <section id="release" className="grid scroll-mt-6 gap-6 xl:grid-cols-[.85fr_1.15fr]">
            <Card className="p-5 sm:p-6">
              <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200"><LockKeyhole className="size-5" aria-hidden="true" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Human authority</p><h2 className="mt-1 text-xl font-semibold text-white">Pilot release gate</h2></div></div>
              <p className="mt-4 text-sm leading-6 text-slate-400">The champion can test, but cannot approve their own workflow or expand access. These controls simulate named owner decisions; they are not real approvals.</p>
              <div className="mt-5 space-y-3">
                {[
                  ["services", "Services manager", servicesApproved, setServicesApproved],
                  ["security", "Security / data reviewer", securityApproved, setSecurityApproved],
                ].map(([id, label, checked, setter]) => (
                  <label key={String(id)} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.08] p-4 hover:bg-white/[0.03]">
                    <input data-testid={`approval-${id}`} type="checkbox" checked={checked as boolean} onChange={(event) => (setter as (value: boolean) => void)(event.target.checked)} className="size-4 accent-cyan-300" />
                    <span className="flex-1 text-sm font-medium text-slate-200">{String(label)}</span>
                    <span className="text-xs text-slate-500">Synthetic</span>
                  </label>
                ))}
              </div>
              <Button data-testid="issue-receipt" className="mt-5 w-full" disabled={!canIssue} onClick={issueReceipt}><FileCheck2 className="size-4" aria-hidden="true" /> Generate release receipt</Button>
              {!canIssue ? <p className="mt-3 text-center text-xs text-slate-500">Both named approvals and all four expected fixture outcomes are required.</p> : null}
            </Card>

            <Card id="evidence" className="min-w-0 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-indigo-300/10 text-indigo-200"><Fingerprint className="size-5" aria-hidden="true" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">Evidence receipt</p><h2 className="mt-1 text-xl font-semibold text-white">Immutable release candidate view</h2></div></div>{receipt ? <Badge className={stateTone(receipt.status)}>{receipt.status}</Badge> : null}</div>
              {receipt ? (
                <div data-testid="release-receipt" className="mt-5 space-y-4">
                  <div className="rounded-xl border border-emerald-300/15 bg-emerald-300/[0.05] p-4"><p className="text-xs text-emerald-200">{receipt.kind}</p><p className="mt-2 break-all font-mono text-sm text-white">{receipt.receiptId}</p></div>
                  <dl className="grid gap-3 sm:grid-cols-2">{[["Workflow", `v${receipt.workflowVersion}`], ["Run receipts", String(receipt.runIds.length)], ["Approvals", `${receipt.approvals.filter((approval) => approval.decision === "APPROVED").length}/2`], ["Source", receipt.source]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/[0.07] p-3"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm text-slate-200">{value}</dd></div>)}</dl>
                  <div><p className="text-xs text-slate-500">SHA-256 content digest</p><p data-testid="receipt-digest" className="mt-2 break-all font-mono text-xs leading-5 text-slate-300">{receipt.digest}</p></div>
                  <Button variant="outline" className="w-full" onClick={() => { setReceipt(null); setServicesApproved(false); setSecurityApproved(false); }}><RotateCcw className="size-4" aria-hidden="true" /> Reset synthetic decisions</Button>
                </div>
              ) : (
                <div className="mt-5 grid min-h-64 place-items-center rounded-2xl border border-dashed border-white/10 bg-black/10 p-6 text-center"><div><Sparkles className="mx-auto size-7 text-slate-600" aria-hidden="true" /><p className="mt-4 text-sm font-medium text-slate-300">No release receipt yet</p><p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">Complete the human gate to produce a deterministic digest over inputs, checks, approvals, and run identifiers.</p></div></div>
              )}
            </Card>
          </section>

          <footer className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between"><p>Candidate-authored and independent. No affiliation with any employer or provider is claimed.</p><p>{knowledgeSources.length} synthetic sources · {connectorContracts.length} synthetic connectors · provider state UNKNOWN</p></footer>
        </div>
      </div>
    </main>
  );
}
