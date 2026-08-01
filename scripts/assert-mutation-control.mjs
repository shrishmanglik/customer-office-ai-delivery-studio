import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vitest = path.join(root, "node_modules", "vitest", "vitest.mjs");
const result = spawnSync(process.execPath, [vitest, "run", "--config", "vitest.mutation.config.ts"], {
  cwd: root,
  encoding: "utf8",
});

if (result.status === 0) {
  console.error("MUTATION CONTROL FAILED: disabling the permission detector did not fail the suite.");
  process.exit(1);
}

if (!`${result.stdout}\n${result.stderr}`.includes("critical-validator.mutation.test.ts")) {
  console.error("MUTATION CONTROL INCONCLUSIVE: expected mutant test did not execute.");
  process.exit(1);
}

console.log("MUTATION CONTROL PASS: disabled permission detector produced the required failing test.");
