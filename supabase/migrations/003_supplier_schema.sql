-- FastFulfill Supplier Schema
-- Migration 003 — Profiles, Quotes, Fulfillment, Invoices, Notifications

-- ────────────────────────────────────────────
-- PROFILES (role-based, one per auth user)
-- ────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null default 'buyer'
                 check (role in ('buyer', 'supplier')),
  full_name    text,
  company_name text,
  country      text,
  phone        text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'buyer'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ────────────────────────────────────────────
-- SUPPLIER PROFILES (extended info)
-- ────────────────────────────────────────────
create table if not exists public.supplier_profiles (
  id               uuid primary key references public.profiles(id) on delete cascade,
  categories       text[] not null default '{}',
  rating           numeric(3,2) default 0 check (rating >= 0 and rating <= 5),
  total_orders     integer not null default 0,
  wechat           text,
  whatsapp         text,
  website          text,
  bio              text,
  verified         boolean not null default false,
  pending_approval boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.supplier_profiles enable row level security;

create policy "Suppliers can view their own supplier profile"
  on public.supplier_profiles for select
  using (auth.uid() = id);

create policy "Suppliers can update their own supplier profile"
  on public.supplier_profiles for update
  using (auth.uid() = id);

-- Buyers can view verified supplier profiles
create policy "Buyers can view verified supplier profiles"
  on public.supplier_profiles for select
  using (verified = true);

-- ────────────────────────────────────────────
-- QUOTES (live buyer <-> supplier connection)
-- ────────────────────────────────────────────
create table if not exists public.quotes (
  id                  uuid primary key default gen_random_uuid(),
  source_request_id   uuid not null references public.source_requests(id) on delete cascade,
  supplier_id         uuid not null references public.profiles(id) on delete cascade,
  buyer_id            uuid not null references public.profiles(id) on delete cascade,
  product_name        text not null,
  unit_price          numeric(10,2) not null check (unit_price > 0),
  moq                 integer not null check (moq > 0),
  quantity            integer not null check (quantity > 0),
  lead_time_days      integer not null check (lead_time_days > 0),
  shipping_cost       numeric(10,2) not null default 0,
  total_cost          numeric(10,2) not null,
  valid_until         timestamptz not null,
  notes               text,
  status              text not null default 'pending'
                        check (status in ('pending','accepted','declined','expired')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.quotes enable row level security;

-- Buyer sees quotes for their requests
create policy "Buyers can view their quotes"
  on public.quotes for select
  using (auth.uid() = buyer_id);

-- Supplier sees quotes they submitted
create policy "Suppliers can view their own quotes"
  on public.quotes for select
  using (auth.uid() = supplier_id);

-- Suppliers can submit quotes
create policy "Suppliers can insert quotes"
  on public.quotes for insert
  with check (auth.uid() = supplier_id);

-- Suppliers can update their own pending quotes
create policy "Suppliers can update their own pending quotes"
  on public.quotes for update
  using (auth.uid() = supplier_id and status = 'pending');

-- Buyers can accept/decline quotes
create policy "Buyers can update quote status"
  on public.quotes for update
  using (auth.uid() = buyer_id);

-- ────────────────────────────────────────────
-- FULFILLMENT ORDERS
-- ────────────────────────────────────────────
create table if not exists public.fulfillment_orders (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  destination_type     text not null check (destination_type in ('amazon_fba','customer','3pl')),
  destination_address  text not null,
  shipping_method      text not null check (shipping_method in ('air','sea','express')),
  status               text not null default 'draft'
                         check (status in ('draft','processing','shipped','delivered')),
  estimated_cost       numeric(10,2),
  estimated_delivery   timestamptz,
  tracking_number      text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table if not exists public.fulfillment_items (
  id                    uuid primary key default gen_random_uuid(),
  fulfillment_order_id  uuid not null references public.fulfillment_orders(id) on delete cascade,
  inventory_id          uuid references public.inventory(id),
  product_name          text not null,
  sku                   text,
  quantity              integer not null check (quantity > 0)
);

alter table public.fulfillment_orders enable row level security;
alter table public.fulfillment_items enable row level security;

create policy "Users can manage their fulfillment orders"
  on public.fulfillment_orders for all
  using (auth.uid() = user_id);

create policy "Users can manage their fulfillment items"
  on public.fulfillment_items for all
  using (
    auth.uid() = (
      select user_id from public.fulfillment_orders
      where id = fulfillment_order_id
    )
  );

-- ────────────────────────────────────────────
-- INVOICES
-- ────────────────────────────────────────────
create table if not exists public.invoices (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  order_id       uuid references public.orders(id),
  invoice_number text not null unique,
  description    text not null,
  subtotal       numeric(10,2) not null,
  shipping_cost  numeric(10,2) not null default 0,
  tax            numeric(10,2) not null default 0,
  total          numeric(10,2) not null,
  status         text not null default 'issued'
                   check (status in ('draft','issued','paid','overdue')),
  issued_at      timestamptz not null default now(),
  due_at         timestamptz not null,
  paid_at        timestamptz
);

alter table public.invoices enable row level security;

create policy "Users can view their own invoices"
  on public.invoices for select
  using (auth.uid() = user_id);

-- ────────────────────────────────────────────
-- NOTIFICATIONS
-- ────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text,
  link       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- ────────────────────────────────────────────
-- SUPPLIER-VISIBLE SOURCE REQUESTS
-- Suppliers can read open/pending source requests
-- ────────────────────────────────────────────
create policy "Suppliers can view open source requests"
  on public.source_requests for select
  using (
    status in ('pending', 'reviewing') and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'supplier'
    )
  );

-- ────────────────────────────────────────────
-- AUTO-UPDATE updated_at
-- ────────────────────────────────────────────
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger supplier_profiles_updated_at
  before update on public.supplier_profiles
  for each row execute procedure public.handle_updated_at();

create trigger quotes_updated_at
  before update on public.quotes
  for each row execute procedure public.handle_updated_at();

create trigger fulfillment_orders_updated_at
  before update on public.fulfillment_orders
  for each row execute procedure public.handle_updated_at();
