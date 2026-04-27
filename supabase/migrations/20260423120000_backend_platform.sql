-- Backend platform: deal applications, payouts, user prefs, message threads, notification types
-- Run after base schema. Safe to re-run: uses IF NOT EXISTS.

-- ---------------------------------------------------------------------------
-- users: profile + subscription + settings
-- ---------------------------------------------------------------------------
alter table public.users
  add column if not exists profile_strength smallint not null default 72,
  add column if not exists earnings_total numeric(12,2) not null default 0,
  add column if not exists subscription_plan text not null default 'free'
    check (subscription_plan in ('free', 'basic', 'pro', 'elite')),
  add column if not exists settings jsonb not null default '{}'::jsonb;

-- ---------------------------------------------------------------------------
-- deals: rich fields (denormalized business name optional)
-- ---------------------------------------------------------------------------
alter table public.deals
  add column if not exists business_name text,
  add column if not exists description text,
  add column if not exists requirements text,
  add column if not exists phone text,
  add column if not exists instagram text;

update public.deals
set
  description = coalesce(description, summary),
  business_name = coalesce(
    business_name,
    (select u.full_name from public.users u where u.id = deals.business_id)
  )
where description is null or business_name is null;

-- ---------------------------------------------------------------------------
-- messages: deal thread + read state
-- ---------------------------------------------------------------------------
alter table public.messages
  add column if not exists deal_id uuid references public.deals(id) on delete set null,
  add column if not exists read_by_receiver boolean not null default false;

update public.messages set read_by_receiver = true where read_by_receiver = false;

create index if not exists messages_deal_id_idx on public.messages (deal_id);
create index if not exists messages_read_receiver_idx on public.messages (receiver_id) where read_by_receiver = false;

-- ---------------------------------------------------------------------------
-- notifications: type
-- ---------------------------------------------------------------------------
alter table public.notifications
  add column if not exists type text not null default 'deal'
    check (type in ('deal', 'message', 'payout'));

-- ---------------------------------------------------------------------------
-- deal_applications
-- ---------------------------------------------------------------------------
create table if not exists public.deal_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  deal_id uuid not null references public.deals(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'completed')),
  created_at timestamptz not null default now(),
  unique (user_id, deal_id)
);

create index if not exists deal_applications_user_idx on public.deal_applications (user_id);
create index if not exists deal_applications_deal_idx on public.deal_applications (deal_id);

-- ---------------------------------------------------------------------------
-- payouts
-- ---------------------------------------------------------------------------
create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  deal_id uuid not null references public.deals(id) on delete cascade,
  amount numeric(10,2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid')),
  created_at timestamptz not null default now(),
  unique (deal_id)
);

create index if not exists payouts_user_idx on public.payouts (user_id);
create index if not exists payouts_status_idx on public.payouts (status);

-- ---------------------------------------------------------------------------
-- RLS: deal_applications
-- ---------------------------------------------------------------------------
alter table public.deal_applications enable row level security;

drop policy if exists "Athletes insert own applications" on public.deal_applications;
create policy "Athletes insert own applications" on public.deal_applications
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Read own or business deal applications" on public.deal_applications;
create policy "Read own or business deal applications" on public.deal_applications
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.deals d where d.id = deal_id and d.business_id = auth.uid())
  );

drop policy if exists "Update application by self or business" on public.deal_applications;
create policy "Update application by self or business" on public.deal_applications
  for update to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.deals d where d.id = deal_id and d.business_id = auth.uid())
  )
  with check (
    user_id = auth.uid()
    or exists (select 1 from public.deals d where d.id = deal_id and d.business_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- RLS: payouts
-- ---------------------------------------------------------------------------
alter table public.payouts enable row level security;

drop policy if exists "Payouts readable by parties" on public.payouts;
create policy "Payouts readable by parties" on public.payouts
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.deals d where d.id = deal_id and d.business_id = auth.uid())
  );

drop policy if exists "Insert payout when deal complete" on public.payouts;
create policy "Insert payout when deal complete" on public.payouts
  for insert to authenticated
  with check (
    user_id = (select athlete_id from public.deals d where d.id = deal_id)
    and exists (
      select 1 from public.deals d2
      where d2.id = deal_id
        and d2.status = 'completed'
        and (d2.athlete_id = auth.uid() or d2.business_id = auth.uid())
    )
  );

drop policy if exists "Update payout by business" on public.payouts;
create policy "Update payout by business" on public.payouts
  for update to authenticated
  using (exists (select 1 from public.deals d where d.id = deal_id and d.business_id = auth.uid()))
  with check (true);

-- ---------------------------------------------------------------------------
-- RLS: messages mark read
-- ---------------------------------------------------------------------------
drop policy if exists "Receiver can mark read" on public.messages;
create policy "Receiver can mark read" on public.messages
  for update to authenticated
  using (receiver_id = auth.uid())
  with check (receiver_id = auth.uid());

-- Realtime: messages (if not already)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- Realtime: deals
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'deals'
  ) then
    alter publication supabase_realtime add table public.deals;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'deal_applications'
  ) then
    alter publication supabase_realtime add table public.deal_applications;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'payouts'
  ) then
    alter publication supabase_realtime add table public.payouts;
  end if;
end $$;
