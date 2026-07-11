# AGENTS.md — DayFlow handoff & working guide

> Onboarding doc for the next agent or developer picking up **DayFlow**. Read this
> before making changes. For the product pitch and deploy steps, see
> [README.md](README.md); this file is about *how the codebase works and how to
> work in it*.

---

## 1. TL;DR

DayFlow is a **mobile-first, ADHD-friendly productivity PWA**. It answers "what do
I do right now?" and helps you recover when you fall off schedule. It's a **Next.js
15 App Router** app, **TypeScript strict**, **Tailwind 3 + shadcn/ui**, persisting
everything to **`localStorage`** first, with optional Supabase magic-link auth
and private cross-device snapshot sync.

**Status:** MVP is feature-complete and deploy-ready. `npm run check` runs lint,
the automated Vitest suite, and the production build/type-check. Six screens are
wired to a single client-side store, and the critical framework-free domain logic
has regression coverage.

---

## 2. Commands

```bash
npm install
npm run dev      # http://localhost:3000  (SW disabled in dev)
npm run build    # production build + type-check — MUST pass before shipping
npm start        # serve the production build (needed to test PWA/offline)
npm run lint     # ESLint (next/core-web-vitals) — MUST pass
npm run test     # Vitest regression suite — MUST pass
npm run check    # lint + tests + production build
npm run icons    # regenerate PWA icons (scripts/generate-icons.mjs)
```

**Always run `npm run check` before declaring done** — lint alone cannot catch
type/module export errors (see gotcha #3).

No environment variables are required for local-only use. Supabase sync needs the
project URL and publishable key in `.env.local` and the deployment environment.

---

## 3. Architecture in one paragraph

Every screen is a **client component** that reads a single React context,
[`StoreProvider`](src/components/store-provider.tsx). The store hydrates from
`localStorage` on mount, exposes typed state + action callbacks, and persists each
slice back to `localStorage` via effects. Pure domain logic (what's happening now,
day states, weekly analytics) lives in `src/lib/*` as framework-free functions that
take store data + a `Date` and return view models. UI is composed from shadcn/ui
primitives in `src/components/ui` plus feature components in `src/components`.
`CloudProvider` wraps the store in the root layout; after an optional magic-link
sign-in it syncs the validated `DayFlowSnapshot` in the background.

```
User taps → component calls useStore() action → setState → persist effect writes
localStorage → derived lib/* function recomputes → UI re-renders
```

### Directory map

```
src/
├── app/                      # App Router — one folder per screen
│   ├── layout.tsx            # providers (Theme, Store), PWA metadata, BottomNav, SW register
│   ├── page.tsx              # Today dashboard
│   ├── routines/ habits/ applications/ review/ settings/   # the other 5 screens
│   ├── error.tsx             # route error boundary
│   ├── not-found.tsx         # 404
│   ├── globals.css           # Tailwind + CSS-variable theme tokens (light/dark)
│   ├── icon.png              # favicon (generated)
│   └── apple-icon.png        # apple touch icon (generated)
├── components/
│   ├── ui/                   # shadcn/ui primitives (button, card, dialog, sheet, select, …)
│   ├── store-provider.tsx    # ⭐ the single source of truth
│   └── *.tsx                 # feature components (see §6)
└── lib/
    ├── types.ts              # ⭐ all data models
    ├── storage.ts            # ⭐ localStorage wrapper, keys, schema migration, export/import
    ├── constants.ts          # metadata: categories, energy modes, statuses, priority companies…
    ├── schedule.ts           # "what now / next / missed" logic for Today
    ├── planner.ts            # local brain-dump parsing, prioritization, and Rescue
    ├── day-state.ts          # habit day states (Minimum saved / Strong / Full) + weekly momentum
    ├── routines.ts           # blank/copy routine builders
    ├── review.ts             # Weekly Review analytics
    ├── applications.ts       # priority-company / follow-up / this-week helpers
    ├── habits.ts             # cadence helpers
    ├── time.ts               # date-fns wrappers (dateKey, weekdayOf, prettyTime, …)
    ├── use-now.ts            # ticking clock hook (client-only)
    ├── utils.ts              # cn(), uid(), clamp()
    └── data/                 # seed routines + life-mode templates, habits (11)
middleware.ts                  # refreshes Supabase auth sessions
supabase/migrations/           # RLS-protected cloud-sync schema
docs/SUPABASE_SETUP.md         # Supabase dashboard + Vercel steps
public/  manifest.webmanifest · sw.js · icons/
scripts/ generate-icons.mjs  # dependency-free PNG generator
tests/                        # Vitest coverage for domain logic and persistence
```

---

## 4. State & persistence (the crux)

- **One store.** [`store-provider.tsx`](src/components/store-provider.tsx) holds
  every persisted slice as `useState`. `useStore()` is the only way components read
  or mutate data. Don't touch `localStorage` directly from components.
- **Hydration.** On mount the store runs `migrateIfNeeded()` then loads each key.
  Until `hydrated === true`, components render defaults. **Server render uses
  defaults, so every page gates on `hydrated` and shows `<LoadingCards />`** to
  avoid hydration mismatches and flashes. Follow this pattern in new pages.
- **Persistence.** One `useEffect` per slice writes to `localStorage` when it
  changes — but only after `hydrated` (so the initial default render doesn't clobber
  stored data). Add a matching effect when you add a slice.
- **Cloud sync.** `CloudProvider` uses the store-owned `snapshot` (not a stale
  `localStorage` read) and debounces background writes. On a new device, a valid
  remote snapshot wins; on a new account, existing local data uploads once.
- **Time is client-only.** Anything time-dependent uses the `useNow()` hook (ticks
  every 30–60s). Never compute "today" during server render.

### Adding a new persisted slice — checklist

1. Add the type to [`types.ts`](src/lib/types.ts) (and to `DayFlowSnapshot`).
2. Add a key to `STORAGE_KEYS` in [`storage.ts`](src/lib/storage.ts); include it in
   `buildSnapshot()` and `importSnapshotJSON()`.
3. In the store: add `useState`, a line in `hydrateFromStorage()`, a persist
   `useEffect`, action callbacks, reset in `resetData()`, and expose on the context
   value + `AppStore` interface.
4. Decide whether a shape change needs a `SCHEMA_VERSION` bump (see §5).

---

## 5. Data models & schema versioning

All models are in [`types.ts`](src/lib/types.ts): `Routine`, `RoutineBlock`
(`importance`, `notificationMinutesBefore`), `Habit` (`category`, `minimum`),
`HabitLog`, `BlockLog`, `Priority`, `Application` (type/priority/deadline/
resumeVersion/referralContact/followUpDate/…), `EnergyLog`, `FrictionLog`,
`WeekPlan`, `UserSettings`. Everything is plain & serializable on purpose.

- `localStorage` keys are prefixed `dayflow:` (see `STORAGE_KEYS`).
- **`SCHEMA_VERSION`** (currently `2`) guards incompatible shape changes. On
  mismatch, `migrateIfNeeded()` **clears routines/habits/habitLogs/blockLogs and
  reseeds**, but **preserves** applications, energy logs, friction logs, priorities,
  and week plans (stable shapes). If you change the shape of habits or routine
  blocks incompatibly, **bump `SCHEMA_VERSION`**. If you change a preserved slice's
  shape incompatibly, extend the migration to clear it too.
- Routines are **not static** — the 4 templates in
  [`data/routines.ts`](src/lib/data/routines.ts) are deep-cloned into the store on
  first run and are fully user-editable thereafter. Seed block ids are
  `` `${routineId}-${day}-${HHmm}` ``; user-added blocks use `uid("block")`.
  Logs reference these ids, so renaming seed ids orphans history.

---

## 6. Feature → file map

| Screen / feature | Entry | Key components / logic |
| --- | --- | --- |
| **Today** | [`app/page.tsx`](src/app/page.tsx) | `WhatNowCard` + `NextBestActionCard`, `ChaosMode` (chaos energy), `VacationBanner`, `TopPriorities`, `FlexPlan` (brain dump + rescue), compact `TodayOverview`, `HabitDayStateCard`, `TodayTimeline`; weekly/recruiting summaries stay on their dedicated screens |
| **Routines** | [`app/routines/page.tsx`](src/app/routines/page.tsx) | `CreateRoutineDialog` (blank routines), `RoutineActionsSheet` (activate/duplicate/rename/delete), `BlockEditorSheet` (add/edit/delete blocks, multi-day creation, end>start validation) |
| **Habits** | [`app/habits/page.tsx`](src/app/habits/page.tsx) | `HabitCard`, `HabitDayStateCard`, `WeeklyMomentum`, `AddHabitDialog`; grouped by category |
| **Applications** | [`app/applications/page.tsx`](src/app/applications/page.tsx) | `ApplicationCard`, `ApplicationDialog`; helpers in `applications.ts` |
| **Weekly Review** | [`app/review/page.tsx`](src/app/review/page.tsx) | analytics in `review.ts`; "Plan next week" writes `WeekPlan` |
| **Settings** | [`app/settings/page.tsx`](src/app/settings/page.tsx) | routine picker, energy/theme, magic-link cloud sync, export/import/reset, reminders placeholder |
| **Friction logging** | `FrictionDialog` / `SkipTaskButton` | reasons in `constants.ts` (`FRICTION_REASONS`) |
| **Shared shell** | `PageHeader`, `PageContainer`, `BottomNav`, `ThemeToggle` | `LoadingCards` for the loading state |

### ADHD-feature logic lives here
- **What now / next / missed** → `computeToday()` in [`schedule.ts`](src/lib/schedule.ts). "Missed" = an *important* (`importance !== "low"`), non-optional block that already ended untouched. Minimum-day makes non-`high` blocks `optional`.
- **Day states** (`Minimum saved` / `Strong day` / `Full win`) + **weekly momentum** (completed **days out of 7**, not streaks) → [`day-state.ts`](src/lib/day-state.ts).
- **Energy modes** (`high/medium/low/chaos`) → `ENERGY_MODES` in `constants.ts` (chaos is labeled **"Rescue"** in the UI). **Chaos** replaces the whole dashboard with `ChaosMode` (exactly 3 cards). **Backup options** only show on low/chaos.
- **Loose ends** (brain dump → estimates, energy-aware ordering, rescue keep/shrink/move, and the day-key carry-forward of unfinished tasks) → [`planner.ts`](src/lib/planner.ts), rendered by `FlexPlan`.

---

## 7. Conventions (keep these for consistency)

- **Client components everywhere** that touch the store: start with `"use client"`,
  read `useStore()`, gate rendering on `hydrated`.
- **Layout:** mobile-first, centered **`max-w-md` app frame** via `PageContainer`.
  ⚠️ Don't put multi-column grids *inside* the frame — they truncate on desktop
  (learned the hard way; applications reverted from `sm:grid-cols-2` to a single
  column). Small stat tiles (`grid-cols-2/3`) are fine.
- **Theming:** use semantic tokens (`bg-card`, `text-muted-foreground`, `border`,
  `bg-primary`, …). For any raw Tailwind color, add a `dark:` variant. Both light
  and dark must look right.
- **shadcn/ui:** primitives live in `src/components/ui`, styled with `cn()` from
  `lib/utils`. Add new ones in the same forwardRef + `cn()` style. `components.json`
  is configured if you use the CLI.
- **Accessibility:** every icon-only button needs `aria-label`; toggle chips use
  `aria-pressed`; inputs get a `<Label htmlFor>`; filter groups use `role="group"`.
- **IDs / timestamps:** use `uid(prefix)` and `new Date().toISOString()` from the
  store, never `Math.random()` inline.
- **Tone/copy:** direct, supportive, non-judgmental. No streak-shame or failure
  language ("let it go", "that counts", "fell off? totally normal").
- **Security posture:** RLS is the only server-side boundary — never ship a
  service-role key to the client. The auth callback only follows same-origin
  relative `next` paths (see `safeNextPath`), the service worker never touches
  `/auth/*`, and baseline hardening headers (nosniff, frame-deny, referrer,
  permissions) live in [`next.config.mjs`](next.config.mjs). Keep all four
  intact when editing those files.

---

## 8. Gotchas / landmines (real ones hit while building)

1. **Dev first-load CSS race.** The very first `next dev` page load sometimes serves
   an *empty* `layout.css` before Tailwind's first compile finishes, so the page
   looks completely unstyled (serif, no cards). **A hard reload fixes it.** Production
   static CSS is unaffected. Don't chase this as a real bug in dev.
2. **Service worker is production-only.** `ServiceWorkerRegister` no-ops unless
   `NODE_ENV === "production"`. Test install/offline with `npm run build && npm start`.
3. **ESLint doesn't resolve module exports.** A stray `export { NotDefined }` can
   pass `npm run lint` but fail the **webpack build**. This bit us once in
   `review.ts`. Always finish with `npm run check`.
4. **`eslint.ignoreDuringBuilds: true`** in [`next.config.mjs`](next.config.mjs) — the
   build won't fail on lint, so lint must be run separately.
5. **No `next/font`.** Deliberately avoided (it fetches fonts at build time → breaks
   offline/sandboxed builds). The font is a system stack via `--font-sans` in
   `globals.css`. Don't add `next/font/google`.
6. **Hardcoded IDs.** `review.ts` maps its weekly metrics to seeded habit IDs
   (`habit-gym`, `habit-study`, `habit-english`, `habit-read`, `habit-clean`) — delete
   those habits and the metric reads 0. Priority companies are hardcoded in
   `constants.ts` (`PRIORITY_COMPANIES` / `PRIORITY_LOCATIONS`).
7. **Icons are generated**, not committed art. Re-run `npm run icons` if you change
   the brand mark; it hand-encodes PNGs with zlib (no image deps).
8. **Schema migration wipes seed data** on `SCHEMA_VERSION` bump (see §5) — expected,
   but tell the user if a change forces it.
9. **Production browser tabs can retain old build errors** after rebuilding while
   a tab is open. Verify in a fresh tab before treating a chunk mismatch as a
   service-worker regression.

---

## 9. Extension recipes

- **Add a routine-block field:** extend `RoutineBlock` in `types.ts` → add to
  `BlockInput` + `addBlock/updateBlock` in the store → add a control in
  `BlockEditorSheet` → surface it in `today-timeline.tsx` / routines list. Decide on
  a `SCHEMA_VERSION` bump.
- **Add a screen:** create `app/<name>/page.tsx` (`"use client"`, gate on
  `hydrated`), wrap in `PageHeader` + `PageContainer`, add a nav item in
  [`bottom-nav.tsx`](src/components/bottom-nav.tsx) (mind that 6 items already fill
  the bar).
- **Add a habit / routine template:** edit `data/habits.ts` / `data/routines.ts` and
  bump `SCHEMA_VERSION` so existing installs reseed.
- **Cloud schema changes:** update the snapshot validator in `storage.ts`, the
  store snapshot shape, and `supabase/migrations/`. Keep RLS enabled and never use
  a Supabase secret/service-role key in client code. See `docs/SUPABASE_SETUP.md`.

---

## 10. What's NOT done / roadmap

- Supabase sync needs its migration applied plus Email/Auth redirect URLs and Vercel
  environment variables configured. See `docs/SUPABASE_SETUP.md`.
- Web Push is implemented end to end. Deployment still needs VAPID secrets, the
  push migration/function, and the one-minute Supabase Cron from `docs/NOTIFICATIONS_SETUP.md`.
- Automated tests cover the core domain and persistence layers; full component and
  end-to-end browser automation can be expanded as the product grows.
- External-service roadmap: AI assistance, Google Calendar, real web push, and
  richer multi-device conflict resolution. See README's "Future improvements".

---

## 11. Verification checklist before shipping

- [ ] `npm run build` passes (type-check included).
- [ ] `npm run lint` clean.
- [ ] `npm run test` passes.
- [ ] Preview the affected screen(s) at **mobile (375px)** and **desktop**; check
      **light and dark**.
- [ ] Interactions persist — confirm the relevant `dayflow:*` key in `localStorage`.
- [ ] No console errors.
- [ ] If a data shape changed, `SCHEMA_VERSION` handled.

_Last updated to reflect: the adaptive-support release (planner/loose ends,
vacation mode, cloud sync, push reminders) plus the security-hardening audit
(auth-callback redirect validation, global headers, SW auth exclusion, loose-end
carry-forward, dead-component cleanup)._
