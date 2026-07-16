# AGENTS.md — DayFlow by Halynt handoff

Read this before changing DayFlow. The [README](README.md) covers the product;
this file explains how the code works and what must stay safe.

## 1. Product and current status

DayFlow is a mobile-first, ADHD-friendly productivity PWA. The public product
name is **DayFlow by Halynt** and the preferred attribution is **A Halynt
product**. Do not use “Halynt Inc.” or “Halynt Group” unless the owner later
registers and approves that legal name.

The app has a signed-out, in-memory preview and private cross-device accounts.
**Clerk owns authentication. Supabase is only the durable data layer.** Product
data must never be written to localStorage or another browser store.

The current onboarding has five short steps: welcome, support need, starting
routine, optional account creation, and review. Visible copy should stay simple,
specific, and friendly. Avoid coaching slogans, therapy language, “AI voice,”
shame language, and abstract labels when a plain label works.

## 2. Required checks

```bash
npm install
npm run dev
npm run lint
npm run test
npm run test:components
npm run test:e2e
npm run build
npm run check
npm run icons
```

`npm run check` runs lint, domain tests, component tests, and the production
build/type-check. **Always run it before declaring work complete.** Run the
relevant Playwright flow after onboarding, account, persistence, or very-low-mode
changes.

## 3. Main architecture

Every interactive screen reads one client-side store:
[`StoreProvider`](src/components/store-provider.tsx). Pure schedule, planner,
habit-state, review, and application logic lives in `src/lib`.

```text
Clerk session
  → CloudProvider asks Clerk for a token
  → Supabase checks that token and RLS
  → CloudProvider loads dayflow_snapshots
  → StoreProvider applies the validated snapshot
  → user changes are debounced back to the same private row
```

Important files:

```text
src/
├── middleware.ts                     # Clerk middleware; public preview stays public
├── app/layout.tsx                    # Clerk, store, cloud, appearance, nav, SW
├── app/sign-in/[[...sign-in]]/       # Clerk sign-in route
├── app/sign-up/[[...sign-up]]/       # Clerk sign-up route
├── app/page.tsx                      # Today
├── app/routines/ habits/ review/ settings/ applications/
├── components/store-provider.tsx     # active app state and actions
├── components/cloud-provider.tsx     # Clerk session + Supabase load/save
├── components/onboarding.tsx         # five-step first run
├── components/appearance-controller.tsx
├── lib/supabase/client.ts            # accessToken-aware Supabase client
├── lib/storage.ts                    # snapshot trust boundary
├── lib/local-planning-engine.ts      # private prompt parsing + learned preferences
├── lib/patterns.ts                   # transparent 28-day personal patterns
├── lib/types.ts                      # all persisted models
└── lib/data/                         # generic public starter data
supabase/
├── migrations/                       # RLS schema, push, hardening, Clerk migration
└── functions/send-reminders/         # cron-driven web push
```

## 4. Authentication and persistence

### Clerk

- `ClerkProvider` wraps the app in `src/app/layout.tsx`.
- `src/middleware.ts` uses `clerkMiddleware()` and must keep `/__clerk/:path*`
  in the matcher exactly once.
- The main app stays public because signed-out preview use is intentional.
- Use Clerk components or hooks for sign-in, sign-up, user menus, and sign-out.
- Never restore the deleted Supabase magic-link callback or Supabase Auth UI.
- The service worker must not cache `/sign-in`, `/sign-up`, `/auth`, or
  `/__clerk` traffic.

### Supabase

- `createSupabaseBrowserClient()` receives an access-token callback that calls
  `session.getToken()`.
- Clerk user IDs are text values such as `user_...`; do not model them as UUIDs.
- RLS compares `auth.jwt()->>'sub'` with the row’s text `user_id`.
- The migration `202607160001_clerk_auth.sql` removes old `auth.users` foreign
  keys, changes account IDs from UUID to text, and replaces the old policies.
- Never expose a service-role or secret key to the browser.

### Hydration rules

- `CloudProvider` waits for Clerk before deciding whether to show the signed-out
  preview or load an account.
- A valid remote snapshot wins after sign-in.
- If a Clerk account has no snapshot, save the current starter snapshot once.
- When an account signs out or changes, clear private account data from memory.
- Signed-out changes are temporary and reset on refresh.
- Time-dependent UI uses `useNow()`; do not compute today’s state during server
  rendering.

### Adding persisted data

1. Add the type to `src/lib/types.ts` and `DayFlowSnapshot`.
2. Extend validation in `src/lib/storage.ts`.
3. Add state, snapshot/apply logic, actions, and reset behavior in the store.
4. Add backward-compatibility tests.
5. Only add a database migration when the outer row or its policies change.

## 5. Snapshot compatibility

`SNAPSHOT_VERSION` marks the saved/exported payload. Prefer optional additions.
`isDayFlowSnapshot()` is the trust boundary for Supabase reads and imported files.
Never discard a signed-in user’s history because a new field is absent.

Routine block logs reference block IDs. Existing starter block IDs use
```${routineId}-${day}-${HHmm}``` and must not be renamed. New user-created blocks
use `uid("block")`.

## 6. Feature map

| Feature | Main files |
| --- | --- |
| Today | `app/page.tsx`, `what-now-card.tsx`, `today-overview.tsx`, `today-timeline.tsx` |
| Very-low view | `chaos-mode.tsx`; internal energy value remains `chaos` for snapshot compatibility |
| Routines | `app/routines/page.tsx`, `block-editor-sheet.tsx`, `routine-actions-sheet.tsx` |
| Private routine draft | `smart-routine-dialog.tsx`, `lib/local-planning-engine.ts` |
| Habits | `app/habits/page.tsx`, `habit-card.tsx`, `habit-day-state.tsx`, `day-state.ts` |
| First run | `onboarding.tsx`; account actions use Clerk modal flows |
| Accounts | `cloud-provider.tsx`, `cloud-sync-card.tsx`, Clerk sign-in/sign-up routes |
| Weekly review | `app/review/page.tsx`, `lib/review.ts` |
| Personal patterns | `personal-patterns-card.tsx`, `lib/patterns.ts`; calculated on the client |
| Flexible list | `flex-plan.tsx`, `brain-dump-dialog.tsx`, `rescue-plan-dialog.tsx`, `lib/planner.ts` |
| Push reminders | `notification-settings-card.tsx`, `public/sw.js`, Supabase function/migrations |
| Appearance | `appearance-controller.tsx`, Settings, account-synced `UserSettings` |

Internal names such as `ChaosMode`, `RescuePlanDialog`, `tinyStart`, and
`minimumDay` remain for snapshot and code compatibility. Their visible labels are
“Very low,” “Adjust plan,” “First step,” and “Basics only.”

## 7. UI and copy rules

- Keep the mobile app frame at `max-w-md` through `PageContainer`.
- Do not add multi-column page layouts inside that frame. Small two- or
  three-column control groups are fine.
- Use semantic theme tokens such as `bg-card`, `text-muted-foreground`,
  `border`, and `bg-primary`. Add dark variants for any raw color.
- Reuse shadcn/ui primitives and existing rounded-card patterns.
- Use Lucide icons through the existing icon components. Do not use emoji as new
  interface icons.
- Every icon-only button needs an accessible label. Inputs need labels. Toggle
  groups need `aria-pressed` or their appropriate selection role.
- Prefer short labels: “Create account,” “Adjust today,” “Basics only,” “First
  step,” and “What got in the way?”
- Avoid coaching slogans, shame language, promises about a person’s future self,
  and abstract labels when a direct action label is available.
- Do not mention Supabase in customer-facing account copy. Say “save to your
  account” or “saved.” Supabase can be named in technical docs.

## 8. Starter data

Starter routines and habits are public templates, not the owner’s personal
schedule. Keep them generic. New templates affect new accounts only; do not
overwrite an existing snapshot to reseed it.

When adding a template:

- use everyday titles and descriptions;
- avoid employer, city, school, or personal project names;
- keep every block editable;
- provide a plain first step only when it helps;
- preserve existing seed IDs.

## 9. Security and deployment

Keep these protections intact:

- RLS on every private table;
- same-origin-only auth redirects from Clerk;
- no service role in client code;
- service-worker auth-route exclusions;
- `nosniff`, frame-deny, referrer, and permissions headers in `next.config.mjs`.

### Private planning engine

- DayFlow has no paid AI dependency and no external planning API.
- `local-planning-engine.ts` runs in the browser. It parses common English and
  Spanish day/time phrases and learns simple preferences from recent check-ins.
- Learned signals are transparent empirical rates and medians, not diagnoses or
  claims that a statistical model knows what will work for a person.
- Never create, replace, activate, or edit a routine until the user reviews the
  draft and explicitly taps the save action.
- Do not silently move fixed commitments. Flexible blocks may move only to avoid
  an overlap, and the preview must disclose omitted blocks.
- `lib/patterns.ts` is deterministic and private; do not market observed
  correlations as medical insight or certainty.

Account saving requires all of the following:

1. Clerk publishable and secret keys in local/Vercel environments.
2. Supabase URL and publishable key in local/Vercel environments.
3. Clerk’s Supabase integration activated in the Clerk dashboard.
4. Clerk configured as a Third-Party Auth provider in Supabase.
5. Every migration applied, including `202607160001_clerk_auth.sql`.
6. A redeploy after environment changes.

See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). Push also needs the VAPID
and cron setup in [docs/NOTIFICATIONS_SETUP.md](docs/NOTIFICATIONS_SETUP.md).

## 10. Known issues and checks

1. The first `next dev` load can briefly serve unfinished Tailwind CSS. Hard
   reload once before treating it as a product bug.
2. The service worker is production-only.
3. ESLint does not catch every missing export; the production build does.
4. Do not add `next/font/google`; offline builds cannot rely on a font download.
5. Old production tabs can keep stale chunks after a deploy. Verify in a fresh tab.
6. Missing environment variables affect each Vercel deployment separately.
7. The Clerk/Supabase dashboard connection is manual and cannot be completed by
   repository code alone.
8. npm currently reports moderate transitive advisories. Do not run a broad
   `npm audit fix` without reviewing breaking changes.

## 11. Release checklist

- [ ] `npm run check` passes.
- [ ] Relevant Playwright flows pass.
- [ ] The changed screen works at 375–390 px and desktop width.
- [ ] Light and dark themes are readable.
- [ ] Onboarding fits without clipped buttons.
- [ ] Create account, sign in, user menu, and sign out open correctly.
- [ ] Signed-in changes survive refresh and another device.
- [ ] Signed-out preview writes no DayFlow data to Web Storage.
- [ ] No browser console errors.
- [ ] Old valid snapshots still load after any data-shape change.
- [ ] Documentation matches the current authentication flow.
- [ ] Generated routine suggestions cannot save without review.
- [ ] Routine descriptions and brain dumps create no external network requests.
- [ ] No secret key or full saved snapshot appears in browser requests.

Last updated for the natural-copy pass, Clerk authentication, the private local
planning engine, and 28-day behavior patterns.
