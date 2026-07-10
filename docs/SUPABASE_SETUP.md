# Connect DayFlow to Supabase

DayFlow stays usable without an account. Signing in adds private, automatic
sync for the same DayFlow data across devices.

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

In Vercel → your project → **Settings** → **Environment Variables**, add these
for Production and Preview:

```env
NEXT_PUBLIC_SUPABASE_URL=https://gtdsbcjnnpbarcainssf.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_pl7absGS0Cf0qcMK81Iwiw_hwuLiYuD
```

Redeploy after adding them.

The publishable key is intended for browser apps when Row Level Security is
enabled. Never add a Supabase `service_role`, `sb_secret_…`, database password,
or personal access token to Vercel, `.env.local`, or source code.

## What users see

The **Settings → Cloud sync** card is the only new entry point:

1. Enter an email address.
2. Open the sign-in link from the email.
3. Existing local data uploads on a new account; an existing cloud backup
   restores on a new device.

DayFlow saves locally first, then syncs in the background. If the network is
down, the app remains usable and catches up when connectivity returns.
