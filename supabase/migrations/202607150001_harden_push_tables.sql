-- Defense-in-depth for the push tables.
--
-- RLS already blocks every anon/authenticated read and write that should be
-- blocked (verified by probing), but unlike dayflow_snapshots these tables
-- never revoked base privileges, so anon could still observe that the tables
-- exist (empty 200s). Align them with the snapshot table's posture:
--   • anon loses all privileges on both tables.
--   • notification_deliveries is service-role-only bookkeeping — authenticated
--     loses its default grants too (it had no policies anyway).
--   • push_subscriptions keeps authenticated grants + its RLS policy.
-- Also keep updated_at honest on subscription upserts.

revoke all on table public.push_subscriptions from anon;
revoke all on table public.notification_deliveries from anon;
revoke all on table public.notification_deliveries from authenticated;

create or replace function public.set_push_subscription_updated_at()
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

drop trigger if exists push_subscriptions_set_updated_at on public.push_subscriptions;
create trigger push_subscriptions_set_updated_at
  before update on public.push_subscriptions
  for each row execute function public.set_push_subscription_updated_at();

revoke all on function public.set_push_subscription_updated_at() from public;
revoke all on function public.set_push_subscription_updated_at() from anon;
revoke all on function public.set_push_subscription_updated_at() from authenticated;
