-- PROPOSED_NOT_APPLIED. The implemented demo uses an in-memory synthetic repository.
-- This migration documents the production persistence boundary. No provider mutation occurred.

create extension if not exists pgcrypto;

create table public.use_cases (
  id uuid primary key default gen_random_uuid(),
  version integer not null check (version > 0),
  owner_id uuid not null references auth.users(id),
  title text not null,
  status text not null,
  source jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, version)
);

create table public.connector_contracts (
  id uuid primary key default gen_random_uuid(),
  use_case_id uuid not null references public.use_cases(id) on delete cascade,
  version integer not null check (version > 0),
  owner_id uuid not null references auth.users(id),
  contract jsonb not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, version)
);

create table public.workflow_versions (
  id uuid primary key default gen_random_uuid(),
  use_case_id uuid not null references public.use_cases(id) on delete cascade,
  version integer not null check (version > 0),
  owner_id uuid not null references auth.users(id),
  definition jsonb not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (use_case_id, version)
);

create table public.test_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_version_id uuid not null references public.workflow_versions(id),
  owner_id uuid not null references auth.users(id),
  correlation_id text not null unique,
  outcome text not null,
  receipt jsonb not null,
  created_at timestamptz not null default now()
);

create table public.approval_decisions (
  id uuid primary key default gen_random_uuid(),
  workflow_version_id uuid not null references public.workflow_versions(id),
  owner_id uuid not null references auth.users(id),
  role text not null,
  decision text not null,
  evidence jsonb not null,
  created_at timestamptz not null default now()
);

create table public.evidence_receipts (
  id uuid primary key default gen_random_uuid(),
  use_case_id uuid not null references public.use_cases(id),
  workflow_version_id uuid not null references public.workflow_versions(id),
  owner_id uuid not null references auth.users(id),
  kind text not null,
  digest text not null unique,
  body jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.use_cases enable row level security;
alter table public.connector_contracts enable row level security;
alter table public.workflow_versions enable row level security;
alter table public.test_runs enable row level security;
alter table public.approval_decisions enable row level security;
alter table public.evidence_receipts enable row level security;

create policy use_cases_owner_all on public.use_cases for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy connector_contracts_owner_all on public.connector_contracts for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy workflow_versions_owner_all on public.workflow_versions for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy test_runs_owner_select on public.test_runs for select using (auth.uid() = owner_id);
create policy test_runs_owner_insert on public.test_runs for insert with check (auth.uid() = owner_id);
create policy approval_decisions_owner_select on public.approval_decisions for select using (auth.uid() = owner_id);
create policy approval_decisions_owner_insert on public.approval_decisions for insert with check (auth.uid() = owner_id);
create policy evidence_receipts_owner_select on public.evidence_receipts for select using (auth.uid() = owner_id);
create policy evidence_receipts_owner_insert on public.evidence_receipts for insert with check (auth.uid() = owner_id);

revoke update, delete on public.test_runs from authenticated;
revoke update, delete on public.approval_decisions from authenticated;
revoke update, delete on public.evidence_receipts from authenticated;
