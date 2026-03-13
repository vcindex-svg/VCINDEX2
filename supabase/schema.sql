-- VibeMarket — Supabase schema
-- Run this entire file in your Supabase project's SQL Editor
-- Dashboard → SQL Editor → New query → paste → Run

-- ─────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────

create table if not exists public.tools (
  id                 uuid primary key default gen_random_uuid(),
  creator_id         uuid references auth.users(id) on delete cascade,
  created_by         text,   -- creator email, for backward-compat filtering
  name               text not null,
  tagline            text,
  description        text,
  link               text,
  image_url          text,
  category           text,
  subcategory        text,
  tags               text[] default '{}',
  pricing_model      text default 'free',   -- free | freemium | one-time | subscription | open-source
  price              numeric,
  has_discount       boolean default false,
  discount_percentage numeric,
  original_price     numeric,
  has_free_trial     boolean default false,
  free_trial_days    integer,
  status             text default 'pending', -- pending | approved | rejected
  featured           boolean default false,
  views              integer default 0,
  upvotes            integer default 0,
  avg_rating         numeric default 0,
  review_count       integer default 0,
  created_at         timestamptz default now()
);

create table if not exists public.creator_profiles (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references auth.users(id) on delete cascade unique,
  created_by              text,   -- owner email, for backward-compat filtering
  bio                     text,
  website                 text,
  avatar_url              text,
  twitter                 text,
  github                  text,
  subscription_plan       text,   -- monthly | annual
  subscription_status     text default 'inactive', -- active | inactive | cancelled | expired
  subscription_start_date date,
  subscription_end_date   date,
  extra_listings          integer default 0,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  created_at              timestamptz default now()
);

create table if not exists public.collections (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  name       text not null,
  color      text default 'violet', -- violet | cyan | pink | emerald | amber | blue
  created_at timestamptz default now()
);

create table if not exists public.saved_tools (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  tool_id       uuid references public.tools(id) on delete cascade,
  collection_id uuid references public.collections(id) on delete set null,
  created_at    timestamptz default now(),
  unique(user_id, tool_id)
);

create table if not exists public.upvotes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  tool_id    uuid references public.tools(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, tool_id)
);

create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  tool_id    uuid references public.tools(id) on delete cascade,
  rating     integer not null check (rating between 1 and 5),
  feedback   text,
  created_at timestamptz default now()
);

create table if not exists public.tool_qa (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  tool_id     uuid references public.tools(id) on delete cascade,
  question    text not null,
  answer      text,
  answered_by uuid references auth.users(id),
  created_at  timestamptz default now()
);

create table if not exists public.subscriptions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade,
  plan              text,   -- monthly | annual
  status            text default 'inactive',
  amount_paid       numeric,
  start_date        date,
  end_date          date,
  payment_reference text,
  notes             text,
  created_at        timestamptz default now()
);

-- ─────────────────────────────────────────────
-- STORAGE BUCKET
-- ─────────────────────────────────────────────
-- Run this separately in Supabase Dashboard → Storage → New bucket
-- Name: tool-images, Public: true
-- Or use the SQL below (requires storage extension):

insert into storage.buckets (id, name, public)
values ('tool-images', 'tool-images', true)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

alter table public.tools             enable row level security;
alter table public.creator_profiles  enable row level security;
alter table public.collections       enable row level security;
alter table public.saved_tools       enable row level security;
alter table public.upvotes           enable row level security;
alter table public.reviews           enable row level security;
alter table public.tool_qa           enable row level security;
alter table public.subscriptions     enable row level security;

-- tools: anyone can read approved tools; creators manage their own
create policy "Public read approved tools"   on public.tools for select using (status = 'approved');
create policy "Creators read own tools"      on public.tools for select using (auth.uid() = creator_id);
create policy "Creators insert tools"        on public.tools for insert with check (auth.uid() = creator_id);
create policy "Creators update own tools"    on public.tools for update using (auth.uid() = creator_id);
create policy "Creators delete own tools"    on public.tools for delete using (auth.uid() = creator_id);
-- Admin: full access (set user role in auth.users metadata as role='admin')
create policy "Admins full access to tools"  on public.tools for all using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- creator_profiles: public read; owner write
create policy "Public read creator profiles"  on public.creator_profiles for select using (true);
create policy "Owner insert profile"          on public.creator_profiles for insert with check (auth.uid() = user_id);
create policy "Owner update profile"          on public.creator_profiles for update using (auth.uid() = user_id);

-- collections, saved_tools, upvotes, reviews, tool_qa, subscriptions: owner only
create policy "Owner only collections"    on public.collections   for all using (auth.uid() = user_id);
create policy "Owner only saved_tools"    on public.saved_tools   for all using (auth.uid() = user_id);
create policy "Owner only upvotes"        on public.upvotes       for all using (auth.uid() = user_id);
create policy "Owner only reviews"        on public.reviews       for all using (auth.uid() = user_id);
-- reviews: also publicly readable
create policy "Public read reviews"       on public.reviews       for select using (true);
create policy "Owner only tool_qa"        on public.tool_qa       for all using (auth.uid() = user_id);
-- tool_qa: publicly readable
create policy "Public read tool_qa"       on public.tool_qa       for select using (true);
create policy "Owner only subscriptions"  on public.subscriptions for all using (auth.uid() = user_id);

-- Storage: allow authenticated uploads to tool-images; public reads
create policy "Public read tool images"
  on storage.objects for select using (bucket_id = 'tool-images');

create policy "Auth upload tool images"
  on storage.objects for insert
  with check (bucket_id = 'tool-images' and auth.role() = 'authenticated');

create policy "Owner delete tool images"
  on storage.objects for delete
  using (bucket_id = 'tool-images' and auth.uid() = owner);
