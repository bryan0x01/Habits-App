# Connect DayFlow accounts and saved data

DayFlow uses two services with separate jobs:

- **Clerk** creates accounts, signs people in, and issues the session token.
- **Supabase** stores each person’s private DayFlow snapshot.

Signed-out visitors can use the temporary preview. Their changes stay in memory
and reset on refresh.

## 1. Create or link the Clerk application

The repository is already set up for Clerk. For a new environment, connect the
project with the Clerk CLI or choose the existing Clerk application in the
Clerk dashboard.

Add these values to `.env.local` and to the matching Vercel environments:

| Variable | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard → API keys |
| `CLERK_SECRET_KEY` (optional) | Clerk dashboard → API keys; enables server-side Clerk middleware |

Never commit either value. When used, the secret key is server-only. DayFlow
keeps every route public and safely falls back to its temporary preview when the
secret is not configured; Supabase RLS remains the data boundary.

## 2. Connect Clerk to Supabase

Use the current third-party authentication integration, not the older Supabase
JWT-template setup.

1. In Clerk, open **Integrations** and activate the **Supabase** integration.
2. In Supabase, open **Authentication → Sign In / Up → Third-Party Auth**.
3. Add **Clerk** and enter the Clerk domain shown by the Clerk integration.
4. Save the provider.

The Clerk session token now reaches Supabase through `session.getToken()`.
Supabase policies identify the account with `auth.jwt()->>'sub'`.

Official setup references:

- [Clerk’s Supabase integration guide](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase third-party auth with Clerk](https://supabase.com/docs/guides/auth/third-party/clerk)

## 3. Apply every database migration

In Supabase, open **SQL Editor** and run the files in `supabase/migrations/` in
filename order. The account-related files are:

1. `202607100001_dayflow_snapshots.sql`
2. `202607100002_push_notifications.sql`
3. `202607150001_harden_push_tables.sql`
4. `202607160001_clerk_auth.sql`

The last migration:

- removes foreign keys to Supabase Auth users;
- changes `user_id` columns from UUID to text for Clerk’s `user_...` IDs;
- replaces `auth.uid()` policies with policies based on the JWT `sub` claim.

Do not loosen or remove Row Level Security.

### Existing magic-link data

The migration keeps old rows, but a previous Supabase Auth UUID is not the same
as a new Clerk user ID. Before switching a production account, record its old
UUID from `auth.users`, create or sign in to the matching Clerk account, then map
the saved rows in the Supabase SQL editor:

```sql
update public.dayflow_snapshots
set user_id = 'user_CLERK_ID'
where user_id = 'OLD_SUPABASE_UUID';

update public.push_subscriptions
set user_id = 'user_CLERK_ID'
where user_id = 'OLD_SUPABASE_UUID';

update public.notification_deliveries
set user_id = 'user_CLERK_ID'
where user_id = 'OLD_SUPABASE_UUID';
```

Use real IDs from the two dashboards. Do not guess or run a broad update.

## 4. Add Supabase deployment values

Add these to `.env.local` and Vercel:

| Variable | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase project settings → API keys |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Only needed for push reminders |

The Supabase URL and publishable key are safe browser values. Never put a
service-role key, database password, Clerk secret key, private VAPID key, or cron
secret in a `NEXT_PUBLIC_*` variable.

Vercel applies environment changes to new builds. Redeploy after adding or
changing a value.

## 5. Check the full flow

1. Open the app signed out and confirm the temporary preview appears.
2. Run setup and choose **Create account**.
3. Finish Clerk sign-up.
4. Confirm the header shows the signed-in user.
5. Change a routine or setting and wait until the header says **Saved**.
6. Refresh and confirm the change returns.
7. Sign out and confirm private account data leaves memory.
8. Sign back in and confirm the saved plan returns.

If the UI says it could not save, check the Clerk/Supabase integration, the four
public deployment values, migration order, and the browser console before
changing application code.
