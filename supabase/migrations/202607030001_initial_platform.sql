create extension if not exists pgcrypto;

create type public.workspace_role as enum ('owner','admin','editor','viewer');
create type public.run_status as enum ('queued','running','awaiting_approval','completed','failed','cancelled');
create type public.proposal_state as enum ('draft','checks_pending','ready','approved','merged','rejected','failed');
create type public.risk_level as enum ('low','medium','high','critical');

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (workspace_id,user_id)
);

create or replace function public.is_workspace_member(target uuid, minimum public.workspace_role default 'viewer')
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = target and m.user_id = auth.uid()
      and case minimum
        when 'viewer' then m.role in ('viewer','editor','admin','owner')
        when 'editor' then m.role in ('editor','admin','owner')
        when 'admin' then m.role in ('admin','owner')
        when 'owner' then m.role = 'owner'
      end
  );
$$;

create or replace function public.create_workspace(workspace_name text, workspace_slug text)
returns public.workspaces language plpgsql security definer set search_path = public as $$
declare created public.workspaces;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.workspaces(name,slug,owner_user_id) values(workspace_name,workspace_slug,auth.uid()) returning * into created;
  insert into public.workspace_members(workspace_id,user_id,role) values(created.id,auth.uid(),'owner');
  return created;
end $$;

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  url text not null check (url ~ '^https?://'),
  repository_owner text not null,
  repository_name text not null,
  default_branch text not null default 'main',
  github_installation_id bigint not null,
  deployment_provider text not null check (deployment_provider in ('vercel','github_actions')),
  deployment_project_id text,
  verification_method text check (verification_method in ('vercel','search_console','challenge')),
  verified_at timestamptz,
  status text not null default 'onboarding' check (status in ('onboarding','active','paused','analysis_only','error')),
  settings jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id,repository_owner,repository_name),
  unique(workspace_id,url)
);

create table public.provider_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null check (provider in ('dataforseo','google','bing','vercel','github')),
  label text not null,
  encrypted_credentials jsonb not null,
  scopes text[] not null default '{}',
  status text not null default 'active' check (status in ('active','expired','revoked','error')),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id,provider,label)
);

create table public.brand_profiles (
  site_id uuid primary key references public.sites(id) on delete cascade,
  version integer not null default 1,
  palette jsonb not null default '[]',
  typography jsonb not null default '{}',
  editorial_voice jsonb not null default '{}',
  visual_rules jsonb not null default '{}',
  source_hashes text[] not null default '{}',
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.tracked_queries (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  query text not null,
  location_code integer not null default 2840,
  language_code text not null default 'en',
  priority smallint not null default 3 check (priority between 1 and 5),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(site_id,query,location_code,language_code)
);

create table public.serp_snapshots (
  id uuid primary key default gen_random_uuid(),
  tracked_query_id uuid not null references public.tracked_queries(id) on delete cascade,
  captured_at timestamptz not null,
  provider text not null default 'dataforseo',
  rank integer,
  result_url text,
  serp_features jsonb not null default '[]',
  competitors jsonb not null default '[]',
  payload_hash text not null,
  raw_object_key text,
  unique(tracked_query_id,captured_at,provider)
);

create table public.evidence_snapshots (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  run_id uuid,
  kind text not null,
  source_url text,
  source_path text,
  captured_at timestamptz not null,
  summary text not null,
  content_hash text not null,
  payload jsonb not null default '{}',
  object_key text,
  immutable boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  requested_by uuid references auth.users(id),
  kind text not null,
  status public.run_status not null default 'queued',
  roles text[] not null,
  dry_run boolean not null default true,
  objective text,
  progress jsonb not null default '{}',
  error_code text,
  error_message text,
  queued_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);
alter table public.evidence_snapshots add constraint evidence_run_fk foreign key (run_id) references public.agent_runs(id) on delete set null;

create table public.findings (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  run_id uuid not null references public.agent_runs(id) on delete cascade,
  role text not null,
  title text not null,
  description text not null,
  category text not null,
  priority text not null,
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  affected_urls text[] not null default '{}',
  recommendation text not null,
  expected_impact text not null,
  evidence_ids uuid[] not null default '{}',
  status text not null default 'open' check (status in ('open','accepted','dismissed','resolved')),
  created_at timestamptz not null default now()
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  run_id uuid references public.agent_runs(id) on delete set null,
  title text not null,
  summary text not null,
  risk public.risk_level not null,
  state public.proposal_state not null default 'draft',
  finding_ids uuid[] not null default '{}',
  changed_paths text[] not null default '{}',
  validation_commands text[] not null default '{}',
  expected_impact text not null,
  rollback_plan text not null,
  branch_name text,
  head_sha text,
  pull_number integer,
  pull_url text,
  preview_url text,
  checks jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.proposal_files (
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  path text not null,
  content_object_key text not null,
  content_hash text not null,
  bytes bigint not null check (bytes >= 0),
  primary key(proposal_id,path)
);

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  decision text not null check (decision in ('approved','rejected')),
  explicit_ui_confirmation boolean not null,
  checks_snapshot jsonb not null,
  github_review_id bigint,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table public.deployments (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  proposal_id uuid references public.proposals(id) on delete set null,
  provider text not null,
  external_id text not null,
  environment text not null check (environment in ('preview','production')),
  url text,
  status text not null,
  commit_sha text,
  started_at timestamptz,
  completed_at timestamptz,
  post_deploy_run_id uuid references public.agent_runs(id),
  unique(provider,external_id)
);

create table public.experiments (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  proposal_id uuid references public.proposals(id) on delete set null,
  hypothesis text not null,
  primary_metric text not null,
  baseline jsonb not null,
  observation_window tstzrange not null,
  outcome jsonb,
  status text not null default 'planned' check (status in ('planned','running','completed','inconclusive','cancelled')),
  created_at timestamptz not null default now()
);

create table public.artifacts (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  proposal_id uuid references public.proposals(id) on delete set null,
  kind text not null check (kind in ('image','audio','video','screenshot','report','transcript')),
  object_key text not null,
  public_url text,
  mime_type text not null,
  bytes bigint not null,
  content_hash text not null,
  prompt_hash text,
  model text,
  provenance jsonb not null default '{}',
  accessibility jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan_key text not null default 'trial' check (plan_key in ('trial','starter','pro','agency')),
  status text not null default 'trialing',
  entitlements jsonb not null,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '14 days'),
  updated_at timestamptz not null default now()
);

create table public.usage_ledger (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  run_id uuid references public.agent_runs(id) on delete set null,
  dimension text not null,
  units bigint not null,
  entry_type text not null check (entry_type in ('reservation','commit','release','adjustment')),
  idempotency_key text not null unique,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.webhook_events (
  id text primary key,
  provider text not null,
  event_type text not null,
  payload_hash text not null,
  processed_at timestamptz,
  error text,
  received_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create or replace function public.reserve_usage(
  target_workspace uuid, target_run uuid, target_dimension text, target_units bigint, target_key text
) returns public.usage_ledger language plpgsql security definer set search_path = public as $$
declare sub public.subscriptions; used bigint; limit_value bigint; entry public.usage_ledger;
begin
  if target_units <= 0 then raise exception 'Units must be positive'; end if;
  select * into sub from public.subscriptions where workspace_id=target_workspace for update;
  if not found or sub.status not in ('active','trialing') then raise exception 'Active subscription required'; end if;
  limit_value := coalesce((sub.entitlements ->> target_dimension)::bigint,0);
  select coalesce(sum(case when entry_type in ('reservation','commit','adjustment') then units else -units end),0)
    into used from public.usage_ledger
    where workspace_id=target_workspace and dimension=target_dimension and created_at >= sub.current_period_start;
  if used + target_units > limit_value then raise exception 'Usage limit exceeded for %',target_dimension; end if;
  insert into public.usage_ledger(workspace_id,run_id,dimension,units,entry_type,idempotency_key)
    values(target_workspace,target_run,target_dimension,target_units,'reservation',target_key)
    on conflict(idempotency_key) do update set idempotency_key=excluded.idempotency_key returning * into entry;
  return entry;
end $$;

create index sites_workspace_idx on public.sites(workspace_id);
create index runs_site_status_idx on public.agent_runs(site_id,status,queued_at desc);
create index findings_site_priority_idx on public.findings(site_id,priority,created_at desc);
create index proposals_site_state_idx on public.proposals(site_id,state,created_at desc);
create index serp_query_captured_idx on public.serp_snapshots(tracked_query_id,captured_at desc);
create index audit_workspace_created_idx on public.audit_events(workspace_id,created_at desc);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.sites enable row level security;
alter table public.provider_connections enable row level security;
alter table public.brand_profiles enable row level security;
alter table public.tracked_queries enable row level security;
alter table public.serp_snapshots enable row level security;
alter table public.evidence_snapshots enable row level security;
alter table public.agent_runs enable row level security;
alter table public.findings enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_files enable row level security;
alter table public.approvals enable row level security;
alter table public.deployments enable row level security;
alter table public.experiments enable row level security;
alter table public.artifacts enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_ledger enable row level security;
alter table public.audit_events enable row level security;

create policy workspaces_read on public.workspaces for select using (public.is_workspace_member(id));
create policy workspaces_update on public.workspaces for update using (public.is_workspace_member(id,'admin')) with check (public.is_workspace_member(id,'admin'));
create policy members_read on public.workspace_members for select using (public.is_workspace_member(workspace_id));
create policy members_manage on public.workspace_members for all using (public.is_workspace_member(workspace_id,'admin')) with check (public.is_workspace_member(workspace_id,'admin'));

create policy sites_read on public.sites for select using (public.is_workspace_member(workspace_id));
create policy sites_write on public.sites for all using (public.is_workspace_member(workspace_id,'editor')) with check (public.is_workspace_member(workspace_id,'editor'));
create policy providers_read on public.provider_connections for select using (public.is_workspace_member(workspace_id,'admin'));
create policy providers_write on public.provider_connections for all using (public.is_workspace_member(workspace_id,'admin')) with check (public.is_workspace_member(workspace_id,'admin'));
create policy subscriptions_read on public.subscriptions for select using (public.is_workspace_member(workspace_id,'admin'));
create policy usage_read on public.usage_ledger for select using (public.is_workspace_member(workspace_id,'admin'));
create policy audit_read on public.audit_events for select using (public.is_workspace_member(workspace_id,'admin'));

create policy brand_access on public.brand_profiles for all using (exists(select 1 from public.sites s where s.id=site_id and public.is_workspace_member(s.workspace_id))) with check (exists(select 1 from public.sites s where s.id=site_id and public.is_workspace_member(s.workspace_id,'editor')));
create policy query_access on public.tracked_queries for all using (exists(select 1 from public.sites s where s.id=site_id and public.is_workspace_member(s.workspace_id))) with check (exists(select 1 from public.sites s where s.id=site_id and public.is_workspace_member(s.workspace_id,'editor')));
create policy serp_read on public.serp_snapshots for select using (exists(select 1 from public.tracked_queries q join public.sites s on s.id=q.site_id where q.id=tracked_query_id and public.is_workspace_member(s.workspace_id)));
create policy evidence_read on public.evidence_snapshots for select using (exists(select 1 from public.sites s where s.id=site_id and public.is_workspace_member(s.workspace_id)));
create policy runs_access on public.agent_runs for all using (exists(select 1 from public.sites s where s.id=site_id and public.is_workspace_member(s.workspace_id))) with check (exists(select 1 from public.sites s where s.id=site_id and public.is_workspace_member(s.workspace_id,'editor')));
create policy findings_access on public.findings for all using (exists(select 1 from public.sites s where s.id=site_id and public.is_workspace_member(s.workspace_id))) with check (exists(select 1 from public.sites s where s.id=site_id and public.is_workspace_member(s.workspace_id,'editor')));
create policy proposals_access on public.proposals for all using (exists(select 1 from public.sites s where s.id=site_id and public.is_workspace_member(s.workspace_id))) with check (exists(select 1 from public.sites s where s.id=site_id and public.is_workspace_member(s.workspace_id,'editor')));
create policy proposal_files_read on public.proposal_files for select using (exists(select 1 from public.proposals p join public.sites s on s.id=p.site_id where p.id=proposal_id and public.is_workspace_member(s.workspace_id)));
create policy approvals_read on public.approvals for select using (exists(select 1 from public.proposals p join public.sites s on s.id=p.site_id where p.id=proposal_id and public.is_workspace_member(s.workspace_id)));
create policy approvals_insert on public.approvals for insert with check (user_id=auth.uid() and explicit_ui_confirmation and exists(select 1 from public.proposals p join public.sites s on s.id=p.site_id where p.id=proposal_id and public.is_workspace_member(s.workspace_id,'editor')));
create policy deployments_read on public.deployments for select using (exists(select 1 from public.sites s where s.id=site_id and public.is_workspace_member(s.workspace_id)));
create policy experiments_access on public.experiments for all using (exists(select 1 from public.sites s where s.id=site_id and public.is_workspace_member(s.workspace_id))) with check (exists(select 1 from public.sites s where s.id=site_id and public.is_workspace_member(s.workspace_id,'editor')));
create policy artifacts_read on public.artifacts for select using (exists(select 1 from public.sites s where s.id=site_id and public.is_workspace_member(s.workspace_id)));

revoke all on function public.reserve_usage(uuid,uuid,text,bigint,text) from public,anon,authenticated;
grant execute on function public.reserve_usage(uuid,uuid,text,bigint,text) to service_role;
grant execute on function public.create_workspace(text,text) to authenticated;
