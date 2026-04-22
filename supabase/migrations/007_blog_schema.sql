create table if not exists public.blog_post_views (
  slug text primary key,
  view_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.blog_post_views enable row level security;

create policy "Anyone can read blog post views"
  on public.blog_post_views for select
  using (true);

create policy "Service role can manage blog post views"
  on public.blog_post_views for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.increment_blog_view(p_slug text)
returns void as $$
begin
  insert into public.blog_post_views (slug, view_count)
  values (p_slug, 1)
  on conflict (slug)
  do update set
    view_count = blog_post_views.view_count + 1,
    updated_at = now();
end;
$$ language plpgsql security definer;

create table if not exists public.blog_post_reactions (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  fingerprint text not null,
  reaction text not null check (reaction in ('helpful', 'bookmark')),
  created_at timestamptz not null default now(),
  unique (slug, fingerprint, reaction)
);

alter table public.blog_post_reactions enable row level security;

create policy "Anyone can read blog post reactions"
  on public.blog_post_reactions for select
  using (true);

create policy "Anyone can insert blog post reactions"
  on public.blog_post_reactions for insert
  with check (true);
