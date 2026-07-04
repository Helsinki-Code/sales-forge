alter table public.sites drop constraint if exists sites_deployment_provider_check;
alter table public.sites alter column repository_owner drop not null;
alter table public.sites alter column repository_name drop not null;
alter table public.sites alter column github_installation_id drop not null;
alter table public.sites alter column deployment_provider drop not null;
alter table public.sites add column if not exists publishing_target text not null default 'github'
  check (publishing_target in ('github','wordpress'));
alter table public.sites add constraint sites_publishing_target_fields check (
  (publishing_target='github' and repository_owner is not null and repository_name is not null and github_installation_id is not null)
  or (publishing_target='wordpress' and repository_owner is null and repository_name is null and github_installation_id is null)
);

alter table public.provider_connections drop constraint if exists provider_connections_provider_check;
alter table public.provider_connections add constraint provider_connections_provider_check
  check (provider in ('dataforseo','google','bing','github','wordpress'));
alter table public.provider_connections add column if not exists site_id uuid references public.sites(id) on delete cascade;
create unique index if not exists provider_connections_site_provider_idx
  on public.provider_connections(site_id,provider) where site_id is not null;
