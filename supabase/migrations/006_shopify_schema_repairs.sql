-- FastFulfill Shopify schema repairs
-- Run this in Supabase SQL Editor if Shopify install reaches the callback
-- but fails with errors like:
--   record "new" has no field "updated_at"
--   there is no unique or exclusion constraint matching the ON CONFLICT specification

create extension if not exists "pgcrypto";

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

alter table public.store_integrations
  add column if not exists updated_at timestamptz not null default now();

alter table public.inbound_shipments
  add column if not exists updated_at timestamptz not null default now();

alter table public.warehouse_stock
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists store_integrations_platform_domain_key
  on public.store_integrations (platform, store_domain)
  where store_domain is not null;

drop trigger if exists store_integrations_updated_at on public.store_integrations;
create trigger store_integrations_updated_at
  before update on public.store_integrations
  for each row execute procedure public.handle_updated_at();

drop trigger if exists inbound_shipments_updated_at on public.inbound_shipments;
create trigger inbound_shipments_updated_at
  before update on public.inbound_shipments
  for each row execute procedure public.handle_updated_at();

drop trigger if exists warehouse_stock_updated_at on public.warehouse_stock;
create trigger warehouse_stock_updated_at
  before update on public.warehouse_stock
  for each row execute procedure public.handle_updated_at();
