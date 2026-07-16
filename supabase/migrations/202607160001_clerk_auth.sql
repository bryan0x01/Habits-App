-- Clerk owns sign-in; Supabase remains the private data layer.
-- Clerk user IDs are strings (for example, user_abc123), so remove the old
-- auth.users foreign keys and compare rows with the JWT subject claim.

alter table public.dayflow_snapshots
  drop constraint if exists dayflow_snapshots_user_id_fkey;
alter table public.push_subscriptions
  drop constraint if exists push_subscriptions_user_id_fkey;
alter table public.notification_deliveries
  drop constraint if exists notification_deliveries_user_id_fkey;

-- Policies depend on the UUID-typed columns, so remove them before changing
-- the column type. They are recreated below with Clerk's text subject claim.
drop policy if exists "Users manage their own DayFlow snapshot"
  on public.dayflow_snapshots;
drop policy if exists "Users manage their push subscriptions"
  on public.push_subscriptions;
drop policy if exists "Users manage their own push subscription"
  on public.push_subscriptions;

alter table public.dayflow_snapshots
  alter column user_id type text using user_id::text;
alter table public.push_subscriptions
  alter column user_id type text using user_id::text;
alter table public.notification_deliveries
  alter column user_id type text using user_id::text;

create policy "Users manage their own DayFlow snapshot"
  on public.dayflow_snapshots
  for all
  to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "Users manage their own push subscription"
  on public.push_subscriptions
  for all
  to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);
