-- FastFulfill Store Integrations + Shopify sync support

create extension if not exists "pgcrypto";

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('buyer', 'supplier', 'fulfillment'));

create table if not exists public.store_integrations (
  id                         uuid primary key default gen_random_uuid(),
  user_id                    uuid not null references auth.users(id) on delete cascade,
  platform                   text not null check (platform in ('shopify', 'woocommerce', 'amazon', 'tiktok', 'etsy')),
  store_name                 text not null,
  store_url                  text not null,
  store_domain               text,
  status                     text not null default 'connected'
                               check (status in ('connected', 'disconnected', 'syncing', 'error')),
  auto_fulfill               boolean not null default true,
  auto_import_orders         boolean not null default true,
  orders_synced              integer not null default 0,
  products_mapped            integer not null default 0,
  last_sync                  timestamptz,
  connected_at               timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),
  error_message              text,
  access_token               text,
  access_token_expires_at    timestamptz,
  refresh_token              text,
  refresh_token_expires_at   timestamptz,
  scope                      text,
  metadata                   jsonb not null default '{}'::jsonb
);

alter table public.store_integrations enable row level security;

create unique index if not exists store_integrations_platform_domain_key
  on public.store_integrations (platform, store_domain)
  where store_domain is not null;

create policy "Users can view their own store integrations"
  on public.store_integrations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own store integrations"
  on public.store_integrations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own store integrations"
  on public.store_integrations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own store integrations"
  on public.store_integrations for delete
  using (auth.uid() = user_id);

alter table public.orders
  add column if not exists source_platform text,
  add column if not exists source_store_domain text,
  add column if not exists external_order_id text,
  add column if not exists external_order_name text,
  add column if not exists customer_name text,
  add column if not exists customer_email text,
  add column if not exists shipping_address jsonb,
  add column if not exists line_items jsonb not null default '[]'::jsonb;

create unique index if not exists orders_external_source_key
  on public.orders (source_platform, source_store_domain, external_order_id)
  where external_order_id is not null;

create table if not exists public.fulfillment_queue (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  ref              text not null unique default ('FF-ORD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  product_name     text not null,
  sku              text,
  quantity         integer not null check (quantity > 0),
  ship_to_country  text,
  status           text not null default 'pending'
                     check (status in ('pending', 'packed', 'shipped', 'delivered')),
  tracking_number  text,
  customer_email   text,
  received_at      timestamptz not null default now(),
  shipped_at       timestamptz
);

alter table public.fulfillment_queue enable row level security;

create unique index if not exists fulfillment_queue_order_id_key
  on public.fulfillment_queue (order_id);

create policy "Users can view their own fulfillment queue rows"
  on public.fulfillment_queue for select
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.profiles
      where id = auth.uid() and role = 'fulfillment'
    )
  );

create policy "Users can insert their own fulfillment queue rows"
  on public.fulfillment_queue for insert
  with check (
    auth.uid() = user_id
    or exists (
      select 1
      from public.profiles
      where id = auth.uid() and role = 'fulfillment'
    )
  );

create policy "Users can update fulfillment queue rows they can access"
  on public.fulfillment_queue for update
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.profiles
      where id = auth.uid() and role = 'fulfillment'
    )
  );

create table if not exists public.inbound_shipments (
  id                 uuid primary key default gen_random_uuid(),
  ref                text not null unique default ('FF-IB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  product_name       text not null,
  sku                text not null,
  quantity_expected  integer not null check (quantity_expected > 0),
  quantity_received  integer,
  status             text not null default 'pending'
                       check (status in ('pending', 'in_transit', 'arrived', 'logged')),
  expected_date      timestamptz not null default now(),
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.inbound_shipments enable row level security;

create policy "Fulfillment users can manage inbound shipments"
  on public.inbound_shipments for all
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid() and role = 'fulfillment'
    )
  );

create table if not exists public.warehouse_stock (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade,
  sku            text not null unique,
  product_name   text not null,
  in_stock       integer not null default 0 check (in_stock >= 0),
  reserved       integer not null default 0 check (reserved >= 0),
  last_movement  timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.warehouse_stock enable row level security;

create policy "Buyers can view their own warehouse stock"
  on public.warehouse_stock for select
  using (
    user_id is not distinct from auth.uid()
    or exists (
      select 1
      from public.profiles
      where id = auth.uid() and role = 'fulfillment'
    )
  );

create policy "Fulfillment users can manage warehouse stock"
  on public.warehouse_stock for all
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid() and role = 'fulfillment'
    )
  );

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
