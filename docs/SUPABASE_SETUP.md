# Connect DayFlow by Halynt to Supabase

DayFlow can be explored without an account, but signed-out changes are an
in-memory preview and disappear on refresh. Signing in enables the only
persistent source of truth: a private Supabase snapshot shared across devices.

## 1. Apply the database migration

In the Supabase dashboard, open **SQL Editor** → **New query**. Paste and run
the contents of:

[`supabase/migrations/202607100001_dayflow_snapshots.sql`](../supabase/migrations/202607100001_dayflow_snapshots.sql)

This creates one `jsonb` snapshot per user. Row Level Security is enabled, so
a signed-in user can only read and write the row whose `user_id` matches their
own account. Do not loosen or remove those policies.

## 2. Enable email sign-in

In **Authentication** → **Providers**, enable **Email**. DayFlow uses a magic
link, so users sign in with one email field instead of remembering a password.

In **Authentication** → **URL Configuration**:

- Set **Site URL** to your production Vercel URL, for example
  `https://your-app.vercel.app`.
- Add `https://your-app.vercel.app/auth/callback` to **Redirect URLs**.
- For local testing, also add `http://localhost:3000/auth/callback`.

## 3. Add deployment variables

This is the **complete** list of variables Vercel needs. Missing either Supabase
value disables persistence in that deployment. The app opens in clearly
labeled preview mode, and Settings explains that changes are temporary.

In Vercel → your project → **Settings** → **Environment Variables**, add these
for Production and Preview:

| Variable | Required for | Value |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Persistent data | your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Persistent data | your project publishable key |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push reminders only | see [NOTIFICATIONS_SETUP.md](NOTIFICATIONS_SETUP.md) |

All three are `NEXT_PUBLIC_*`: they ship to the browser by design and are safe
to expose. Vercel only applies variables to **new** builds, so **redeploy after
adding them** — an existing deployment will not pick them up.

Every secret (VAPID private key, `CRON_SECRET`, service-role key) belongs in
**Supabase → Edge Functions → Secrets**, never in Vercel. Never add a Supabase
`service_role`, `sb_secret_…`, database password, or personal access token to
Vercel, `.env.local`, or source code.

## What users see

The **Settings → Cloud sync** card is the only new entry point:

1. Enter an email address.
2. Open the sign-in link from the email.
3. A new account receives the generic starter snapshot; an existing account
   restores its private snapshot before the main interface opens.

After account initialization, DayFlow debounces changes directly to Supabase.
If a save fails, the header and Settings surface the error instead of claiming
that the change is safely stored.
