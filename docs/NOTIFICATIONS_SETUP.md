# Web Push setup

> **Prerequisite:** reminders are delivered per signed-in user, so cloud sync
> must work first. Complete [SUPABASE_SETUP.md](SUPABASE_SETUP.md) — including
> **all** the Vercel variables listed there — before this guide. Adding only
> `NEXT_PUBLIC_VAPID_PUBLIC_KEY` to Vercel leaves sync (and therefore push)
> disabled in that deployment.

The app, database migration, service worker, subscription UI, and reminder sender are implemented. Complete these deployment-only secret steps once:

1. Apply `supabase/migrations/202607100002_push_notifications.sql` in the Supabase SQL editor.
2. Generate VAPID keys: `npx web-push generate-vapid-keys`.
3. Add the public key to Vercel as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (alongside the
   two Supabase variables), then redeploy.
4. In Supabase Edge Function secrets add `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (for example `mailto:you@example.com`), and a long random `CRON_SECRET`.
5. Deploy `send-reminders` from `supabase/functions/send-reminders` with JWT verification disabled (as declared in `supabase/config.toml`).
6. In Supabase Cron, invoke the function every minute and send the same secret in the `x-cron-secret` header.

Never place the private VAPID key, service-role key, or cron secret in Vercel client variables or source control.
