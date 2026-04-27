-- Oppurtunity production schema
create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('athlete', 'business')),
  created_at timestamptz not null default now()
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.users(id) on delete cascade,
  athlete_id uuid references public.users(id) on delete set null,
  title text not null,
  payout numeric(10,2) not null check (payout > 0),
  sport text not null,
  location text not null,
  summary text not null,
  status text not null default 'open' check (status in ('open', 'accepted', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  detail text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists deals_business_id_idx on public.deals (business_id);
create index if not exists deals_athlete_id_idx on public.deals (athlete_id);
create index if not exists deals_status_idx on public.deals (status);
create index if not exists messages_sender_id_idx on public.messages (sender_id);
create index if not exists messages_receiver_id_idx on public.messages (receiver_id);
create index if not exists notifications_user_id_idx on public.notifications (user_id);

alter table public.users enable row level security;
alter table public.deals enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Users can read all profiles" on public.users;
create policy "Users can read all profiles" on public.users
for select to authenticated using (true);

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile" on public.users
for insert to authenticated with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile" on public.users
for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Anyone authenticated can read deals" on public.deals;
create policy "Anyone authenticated can read deals" on public.deals
for select to authenticated using (true);

drop policy if exists "Businesses can create deals" on public.deals;
create policy "Businesses can create deals" on public.deals
for insert to authenticated
with check (
  auth.uid() = business_id
  and exists (
    select 1 from public.users u where u.id = auth.uid() and u.role = 'business'
  )
);

drop policy if exists "Businesses update own deals or athletes accept open" on public.deals;
create policy "Businesses update own deals or athletes accept open" on public.deals
for update to authenticated
using (
  business_id = auth.uid()
  or (
    athlete_id is null
    and status = 'open'
    and exists (
      select 1 from public.users u where u.id = auth.uid() and u.role = 'athlete'
    )
  )
)
with check (
  business_id = auth.uid()
  or athlete_id = auth.uid()
);

drop policy if exists "Users can read own messages" on public.messages;
create policy "Users can read own messages" on public.messages
for select to authenticated
using (sender_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists "Users can send messages from self" on public.messages;
create policy "Users can send messages from self" on public.messages
for insert to authenticated
with check (sender_id = auth.uid());

drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications" on public.notifications
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can mark own notifications" on public.notifications;
create policy "Users can mark own notifications" on public.notifications
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "System inserts notifications" on public.notifications;
create policy "System inserts notifications" on public.notifications
for insert to authenticated
with check (true);

alter publication supabase_realtime add table public.notifications;
