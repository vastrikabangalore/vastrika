-- Fashion portfolio: database, permissions and security rules
-- Paste everything into Supabase > SQL Editor and click Run. Run it once.

-- ---------- Tables ----------

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  season text,
  cover_image_url text,
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.designs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  category_id uuid references public.categories (id) on delete set null,
  collection_id uuid references public.collections (id) on delete set null,
  fabric text,
  colors text[] not null default '{}',
  tags text[] not null default '{}',
  design_year int,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.design_images (
  id uuid primary key default gen_random_uuid(),
  design_id uuid not null references public.designs (id) on delete cascade,
  url text not null,
  cloudinary_public_id text not null,
  alt_text text,
  is_cover boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text,
  cover_image_url text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index designs_category_idx on public.designs (category_id);
create index designs_collection_idx on public.designs (collection_id);
create index design_images_design_idx on public.design_images (design_id);

-- ---------- Keep updated_at correct ----------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger categories_updated before update on public.categories
  for each row execute function public.set_updated_at();
create trigger collections_updated before update on public.collections
  for each row execute function public.set_updated_at();
create trigger designs_updated before update on public.designs
  for each row execute function public.set_updated_at();
create trigger posts_updated before update on public.posts
  for each row execute function public.set_updated_at();

-- ---------- Admin check ----------

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------- Table access ----------

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.collections, public.designs,
  public.design_images, public.posts to anon, authenticated;
grant insert, update, delete on public.categories, public.collections,
  public.designs, public.design_images, public.posts to authenticated;

-- ---------- Row Level Security ----------

alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.designs enable row level security;
alter table public.design_images enable row level security;
alter table public.posts enable row level security;

-- Visitors see categories and published content only
create policy "Public reads categories" on public.categories
  for select to anon, authenticated using (true);

create policy "Public reads published collections" on public.collections
  for select to anon, authenticated using (is_published);

create policy "Public reads published designs" on public.designs
  for select to anon, authenticated using (is_published);

create policy "Public reads images of published designs" on public.design_images
  for select to anon, authenticated using (
    exists (
      select 1 from public.designs d
      where d.id = design_id and d.is_published
    )
  );

create policy "Public reads published posts" on public.posts
  for select to anon, authenticated using (is_published);

-- Admins can do everything
create policy "Admins manage categories" on public.categories
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admins manage collections" on public.collections
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admins manage designs" on public.designs
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admins manage design images" on public.design_images
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admins manage posts" on public.posts
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
