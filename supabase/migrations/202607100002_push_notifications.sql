create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  timezone text not null default 'UTC',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_deliveries (
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  block_id text not null,
  local_date date not null,
  lead_minutes integer not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, endpoint, block_id, local_date, lead_minutes)
);

alter table public.push_subscriptions enable row level security;
alter table public.notification_deliveries enable row level security;
grant select, insert, update, delete on public.push_subscriptions to authenticated;

create policy "Users manage their push subscriptions"
on public.push_subscriptions for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions(user_id);
