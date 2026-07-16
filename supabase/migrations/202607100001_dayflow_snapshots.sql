-- One private, Supabase-first snapshot per authenticated DayFlow user.
-- The app never uses a service-role key; RLS is the security boundary.

create table if not exists public.dayflow_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.dayflow_snapshots enable row level security;

revoke all on table public.dayflow_snapshots from anon;
grant select, insert, update on table public.dayflow_snapshots to authenticated;

drop policy if exists "Users manage their own DayFlow snapshot" on public.dayflow_snapshots;
create policy "Users manage their own DayFlow snapshot"
  on public.dayflow_snapshots
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.set_dayflow_snapshot_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists dayflow_snapshots_set_updated_at on public.dayflow_snapshots;
create trigger dayflow_snapshots_set_updated_at
  before update on public.dayflow_snapshots
  for each row execute function public.set_dayflow_snapshot_updated_at();
