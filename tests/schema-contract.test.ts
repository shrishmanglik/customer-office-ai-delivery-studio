import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  path.join(process.cwd(), "supabase/migrations/001_governed_delivery_schema.sql"),
  "utf8",
);
const tables = Array.from(migration.matchAll(/create table public\.(\w+)/g), (match) => match[1]);
const rlsTables = Array.from(
  migration.matchAll(/alter table public\.(\w+) enable row level security/g),
  (match) => match[1],
);

describe("proposed Supabase schema contract", () => {
  it("labels the migration unapplied", () => {
    expect(migration).toContain("PROPOSED_NOT_APPLIED");
  });

  it("enables RLS on every declared table", () => {
    expect(tables).toHaveLength(6);
    expect(new Set(rlsTables)).toEqual(new Set(tables));
  });

  it.each(["test_runs", "approval_decisions", "evidence_receipts"])(
    "makes %s append-only for authenticated clients",
    (table) => {
      expect(migration).toContain(`revoke update, delete on public.${table} from authenticated`);
    },
  );
});
