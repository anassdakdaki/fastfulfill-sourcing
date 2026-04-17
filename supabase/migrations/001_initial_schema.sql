-- FastFulfill Initial Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────
-- ORDERS
-- ────────────────────────────────────────────
create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  product_name        text not null,
  quantity            integer not null check (quantity > 0),
  status              text not null default 'pending'
                        check (status in ('pending','processing','fulfilled','shipped','delivered','cancelled')),
  tracking_number     text,
  destination_country text,
  unit_price          numeric(10,2),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Row Level Security
alter table public.orders enable row level security;

create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own orders"
  on public.orders for update
  using (auth.uid() = user_id);

-- ────────────────────────────────────────────
-- TRACKING
-- ────────────────────────────────────────────
create table if not exists public.tracking (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  status      text not null,
  location    text,
  description text,
  timestamp   timestamptz not null default now()
);

alter table public.tracking enable row level security;

-- Public read on tracking (anyone with tracking number can track)
create policy "Anyone can read tracking for their order"
  on public.tracking for select
  using (true);

create policy "Only service role can insert tracking"
  on public.tracking for insert
  with check (auth.role() = 'service_role');

-- ────────────────────────────────────────────
-- INVENTORY
-- ────────────────────────────────────────────
create table if not exists public.inventory (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  product_name        text not null,
  sku                 text,
  quantity            integer not null default 0 check (quantity >= 0),
  warehouse_location  text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.inventory enable row level security;

create policy "Users can view their own inventory"
  on public.inventory for select
  using (auth.uid() = user_id);

create policy "Users can insert their own inventory"
  on public.inventory for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own inventory"
  on public.inventory for update
  using (auth.uid() = user_id);

-- ────────────────────────────────────────────
-- SOURCE REQUESTS
-- ────────────────────────────────────────────
create table if not exists public.source_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  product_url     text not null,
  product_name    text,
  quantity        integer not null check (quantity > 0),
  target_country  text not null,
  notes           text,
  status          text not null default 'pending'
                    check (status in ('pending','reviewing','quoted','approved','rejected')),
  quoted_price    numeric(10,2),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.source_requests enable row level security;

create policy "Users can view their own source requests"
  on public.source_requests for select
  using (auth.uid() = user_id);

create policy "Users can insert their own source requests"
  on public.source_requests for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own source requests"
  on public.source_requests for update
  using (auth.uid() = user_id);

-- ────────────────────────────────────────────
-- AUTO-UPDATE updated_at
-- ────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.handle_updated_at();

create trigger inventory_updated_at
  before update on public.inventory
  for each row execute procedure public.handle_updated_at();

create trigger source_requests_updated_at
  before update on public.source_requests
  for each row execute procedure public.handle_updated_at();
