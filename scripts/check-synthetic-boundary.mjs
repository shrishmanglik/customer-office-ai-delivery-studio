import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = readFileSync(path.join(root, "src/lib/fixtures/synthetic-risk-brief.ts"), "utf8");
const requiredMarkers = ["SYNTHETIC_FIXTURE", "synthetic_account", "SYNTHETIC_CHAMPION", "SYNTHETIC_REFERENCE_NO_CREDENTIAL"];
const forbiddenPatterns = [
  /@(?:proofpoint|telus)\./i,
  /(?:api[_-]?key|secret|token)\s*[:=]\s*["'][^"']+/i,
  /(?:customer|employee)[_-]?(?:name|email)\s*[:=]\s*["'][^"']+/i,
];

const missing = requiredMarkers.filter((marker) => !fixture.includes(marker));
const forbidden = forbiddenPatterns.filter((pattern) => pattern.test(fixture));
if (missing.length || forbidden.length) {
  console.error(`Synthetic boundary failed: missing=${missing.length} forbidden=${forbidden.length}`);
  process.exit(1);
}
console.log(`Synthetic boundary PASS: ${requiredMarkers.length} known markers, ${forbiddenPatterns.length} forbidden pattern checks.`);
