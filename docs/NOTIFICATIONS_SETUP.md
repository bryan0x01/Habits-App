# Web Push setup

> **Prerequisite:** reminders are delivered per signed-in Clerk user, so account saving
> must work first. Complete [SUPABASE_SETUP.md](SUPABASE_SETUP.md) — including
> **all** the Vercel variables listed there — before this guide. Adding only
> `NEXT_PUBLIC_VAPID_PUBLIC_KEY` to Vercel leaves sync (and therefore push)
> disabled in that deployment.

The app, database migration, service worker, subscription UI, and reminder sender are implemented. Complete these deployment-only secret steps once:

1. Apply `supabase/migrations/202607100002_push_notifications.sql` in the Supabase SQL editor,
   then `supabase/migrations/202607150001_harden_push_tables.sql` (privilege hardening +
   `updated_at` trigger — safe to run on an existing deployment).
2. Generate VAPID keys: `npx web-push generate-vapid-keys`.
3. Add the public key to Vercel as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (alongside the
   Clerk and Supabase variables), then redeploy.
4. In Supabase Edge Function secrets add `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (for example `mailto:you@example.com`), and a long random `CRON_SECRET`.
5. Deploy `send-reminders` from `supabase/functions/send-reminders` with JWT verification disabled (as declared in `supabase/config.toml`).
6. In Supabase Cron, invoke the function every minute and send the same secret in the `x-cron-secret` header.

Never place the private VAPID key, service-role key, or cron secret in Vercel client variables or source control.

## Live verification

1. Sign in on the deployed origin and enable reminders in Settings.
2. Set a block on the current weekday to start about three minutes from now and
   give it a one- or two-minute reminder.
3. Leave the tab in the background and confirm one notification arrives.
4. Invoke the cron again inside the same window and confirm the delivery is not
   duplicated.

The sender accepts a three-minute catch-up window so one delayed cron tick does
not lose the reminder. It claims the actual local occurrence date of the block,
including reminders that cross midnight, before sending; the database primary
key then makes retries idempotent.

If the live check fails, inspect these in order: the Cron job is running every
minute, its `x-cron-secret` exactly matches `CRON_SECRET`, the subscription row
has the device's current IANA timezone, and the Edge Function has all VAPID and
service-role secrets.
