# DayFlow by Halynt

> **A Halynt product.** DayFlow is the first focused tool in the Halynt product family.

**What to do now — and how to get back on track.**

DayFlow is a mobile-first, installable **PWA** that helps people with ADHD-friendly
routines answer one question first: _"What should I do right now?"_ — and, just as
importantly, _"How do I recover when I fall off?"_

[**Open the live demo**](https://habits-app-eta.vercel.app) · [View the repository](https://github.com/bryan0x01/Habits-App)

Instead of a giant, guilt-inducing to-do list, DayFlow surfaces the **one thing**
that matters at this moment, offers a **tiny on-ramp** to start it, a **lighter
backup** when it feels like too much, and a **kind path back** when a block slips.

> Supabase is the source of truth for saved plans. Signed-out visitors can
> explore a clearly labeled temporary preview, but DayFlow never pretends that
> unsaved browser state is permanent.

## Preview

| 60-second setup | What matters now | Editable real-week rhythms |
| --- | --- | --- |
| ![DayFlow onboarding](docs/screenshots/dayflow-onboarding-mobile.png) | ![DayFlow Today screen](docs/screenshots/dayflow-today-mobile.png) | ![DayFlow routine editor](docs/screenshots/dayflow-routines-mobile.png) |

---

## ✨ Features

Five primary screens, each intentionally focused, plus one optional career tool:

| Screen | What it does |
| --- | --- |
| **Today** | The home base. One visible next action, recovery after a missed block, committed outcomes, habit minimums, and an optional full-plan drawer. In **Rescue** mode it collapses to three moves. |
| **Routines** | Start blank or add editable Balanced, Student, Shift, Focus Work, Self-employed, Low-capacity, and Vacation rhythms. |
| **Habits** | Eight broad starter habits with semantic icons, completion states, weekly momentum, and friction logging. Add your own; delete anytime. |
| **Weekly Review** | Judgment-free, data-driven habit metrics, project progress, friction patterns, strongest day, and one suggested adjustment. |
| **Settings** | Theme, five basic interface colors, routine and support defaults, Supabase sign-in, reminders, export/import, and reset. |
| **Applications (optional)** | A career tracker available under Settings → Tools; it is no longer imposed on the primary navigation. |

New accounts start with **Balanced week** and **Low-capacity day**. The template
library adds **Student week**, **Shift week**, **Focus work**, **Self-employed**,
and **Vacation rhythm**. These are public starting points—no personal employer,
location, class, or language goal is baked into a new user&apos;s plan. Every time
and block can be changed.

---

## 🧠 ADHD-friendly design decisions

Every feature here exists to reduce a specific ADHD tax — task initiation,
overwhelm, time blindness, or shame spirals.

- **What Now card** — one clear focus for the current moment, not a wall of tasks.
  Beats time blindness and decision paralysis.
- **Tiny Start** — a ~2-minute on-ramp for every block ("Put your gym shoes on").
  Task initiation is the hardest part; this makes the first step trivial.
- **Backup Option** — a lighter version of the task ("A 10-minute walk counts")
  so a hard day doesn't become a zero day.
- **Energy Mode** (High / Medium / Low / Rescue) — you tell the app how much you've
  got, and the copy + emphasis adapt. In **Chaos** mode it literally says
  _"One thing. That's the whole job right now."_
- **Protect the day toggle** — shrinks the day to just the high-importance blocks when
  you're struggling. Everything else becomes explicitly optional.
- **Top 3 priorities** — three things that would make today a win, kept small,
  above the noise of any longer list.
- **Completion states, not scores** — hit your minimum habits and the day is
  **Minimum saved**; do most and it's a **Strong day**; do them all for a **Full
  win**. A rough day still counts.
- **Rescue mode** — the highest-overwhelm energy level strips the whole dashboard to
  exactly three moves: one tiny start, one minimum task, one recovery action.
- **Next Best Action** — when an important block slips past untouched, you get a
  calm recovery prompt (_"do 20 minutes instead of skipping completely"_) instead of
  a red "missed" badge.
- **Momentum, not streaks** — weekly momentum counts **completed days out of 7**.
  Miss a day and nothing breaks; you just pick back up. No streak to "lose".
- **Friction logging** — skipping asks a low-friction _"what got in the way?"_ (too
  big, no energy, distracted…). Over a week, the Review screen surfaces patterns so
  you can shrink the right tasks — framed as data, never as failure.
- **Tone & UI** — friendly but not childish, big tap targets, semantic Lucide
  icons, light/dark/system brightness, five synced interface colors, and
  encouraging copy throughout.
- **Progressive density** — Today contains only decisions needed today. Weekly
  momentum lives in Habits and recruiting analytics live in Applications.
- **Clear my head** — a local, deterministic parser turns one-item-per-line brain
  dumps into transparent time, effort, category, first-step, and minimum estimates.
- **Rescue the plan** — fits flexible tasks into 15, 30, 60, or 120 minutes; tasks
  are kept, shrunk, or moved only after the user reviews and applies the plan.
- **Vacation Mode** — temporarily swaps in four loose anchors and restores the
  prior routine when the trip ends.
- **Visible time + focus sprint** — the current block drains as a ring, and an
  optional 10/25/45-minute timer keeps one task in view without turning the app
  into a stopwatch dashboard.
- **One-minute onboarding** — choose the friction DayFlow should support and the
  closest editable week shape, or keep the defaults in one tap.

---

## 🛠 Tech stack

- **[Next.js 15](https://nextjs.org/)** (App Router) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS 3** + **[shadcn/ui](https://ui.shadcn.com/)** (Radix primitives)
- **[date-fns](https://date-fns.org/)** for date/time logic
- **[lucide-react](https://lucide.dev/)** icons
- **Supabase** — magic-link Auth plus one private RLS-protected snapshot per user
- **Account-synced appearance** — light/dark/system plus five interface colors
- **PWA**: web manifest, service worker, and generated icons
- Deploy-ready for **Vercel**

### Data models

Defined in [`src/lib/types.ts`](src/lib/types.ts): `Routine`, `RoutineBlock`
(with `importance` and `notificationMinutesBefore`), `Habit` (with `category` and
`minimum`), `HabitLog`, `BlockLog`, `Priority`, `Application`, `EnergyLog`,
`FrictionLog`, `FlexTask`, `WeekPlan`, and `UserSettings`. They are plain and
serializable because the same validated shape is written to Supabase and used
for file export/import.

### Persistence

[`StoreProvider`](src/components/store-provider.tsx) owns the in-memory state.
[`CloudProvider`](src/components/cloud-provider.tsx) loads the authenticated
user&apos;s validated snapshot from Supabase, then debounces each change back to the
same RLS-protected row. [`storage.ts`](src/lib/storage.ts) validates cloud reads
and backup imports; it does not read or write browser storage. The snapshot saves:

- the active routine plus all **editable routines and their blocks**
- settings (energy mode, minimum day, theme)
- completed/skipped **habits by date** and **routine blocks by date**
- the day's **Top 3 priorities**
- **applications**, **energy logs**, and **friction logs**
- next-week planning drafts
- flexible brain-dump tasks and their local Rescue estimates

An authenticated Supabase snapshot is the only persistent source of truth.
Signed-out changes live only in memory and disappear on refresh by design.

---

## 📁 Project structure

```
src/
├── app/                # App Router pages (one per screen) + layout
│   ├── page.tsx        # Today dashboard
│   ├── routines/       # Routines
│   ├── habits/         # Habits
│   ├── applications/   # Applications
│   ├── review/         # Weekly Review
│   ├── settings/       # Settings
│   ├── icon.png        # Auto favicon (generated)
│   └── apple-icon.png  # Apple touch icon (generated)
├── components/
│   ├── ui/             # shadcn/ui primitives
│   └── *.tsx           # Feature components (what-now, momentum, etc.)
└── lib/
    ├── types.ts        # Data models
    ├── storage.ts      # snapshot validation + export/import serialization
    ├── schedule.ts     # "What now / next / missed" logic
    ├── planner.ts      # local brain-dump and Rescue rules
    ├── day-state.ts    # Day states + streak-free weekly momentum
    ├── routines.ts     # Blank/copy routine builders
    ├── review.ts       # Weekly review aggregation
    ├── applications.ts # Recruiting pipeline helpers
    ├── constants.ts    # Energy modes, friction reasons, categories
    ├── time.ts         # date-fns helpers
    └── data/           # Routine templates + default habits
public/
├── manifest.webmanifest
├── sw.js               # Service worker
└── icons/              # PWA icons (generated)
scripts/
└── generate-icons.mjs  # Dependency-free PNG icon generator
supabase/
└── migrations/          # RLS-protected cloud-sync schema
docs/
└── SUPABASE_SETUP.md    # Dashboard + Vercel configuration steps
tests/                   # Domain, component, and Playwright E2E regression suites
```

---

## 🚀 Run locally

Requires **Node 18.18+** (Node 20+ recommended).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On your phone, open it over
your local network (or a deployed URL) and use **"Add to Home Screen"** to install.

> **No environment variables are required for temporary preview use.** To enable
> account sync, follow [the Supabase setup guide](docs/SUPABASE_SETUP.md) and add
> the URL plus publishable key to `.env.local` and Vercel.

Production build:

```bash
npm run build
npm start
```

Full release verification:

```bash
npm run check    # ESLint + regression tests + production build/type-check
npm run test:e2e # first-run, persistence, and Rescue browser flows
```

> The service worker only registers in **production** builds, so it never
> interferes with hot-reloading in `dev`. To test install/offline behavior, run
> `npm run build && npm start`.

Regenerate the app icons anytime:

```bash
npm run icons
```

---

## ▲ Deploy to Vercel

DayFlow is a stock Next.js app — no env vars required for the MVP.

**Option A — Dashboard**
1. Push this repo to GitHub/GitLab/Bitbucket.
2. In [Vercel](https://vercel.com/new), **Import** the repository.
3. Framework preset auto-detects **Next.js**. Accept the defaults and **Deploy**.

**Option B — CLI**
```bash
npm i -g vercel
vercel          # preview deploy
vercel --prod   # production deploy
```

That's it. The manifest, service worker, and icons are served from `public/`, so
the deployed app is installable as a PWA immediately.

---

## 🔭 Future improvements

The Supabase-first core is complete. Natural next steps:

- **Richer multi-device conflict handling** — signed-in devices already sync a
  private snapshot; future work can add live conflict resolution for simultaneous
  edits on two open devices.
- **AI assistance** — an on-device/Claude-powered coach that reshapes the day based
  on your energy mode, suggests smarter tiny-starts, and turns friction logs into
  personalized nudges.
- **Google Calendar** — two-way sync so routine blocks reflect real meetings and
  free/busy time.
- **Deeper calendar recurrence** — multi-day block creation is available today;
  future calendar sync could add date ranges, exceptions, and alternating weeks.

---

## 📄 Resume bullets

- Built a mobile-first, ADHD-friendly productivity **PWA** using **Next.js**,
  **TypeScript**, **Tailwind CSS**, and a private **Supabase** snapshot layer.
- Implemented adaptive routine flows with **energy modes**, **tiny-start** actions,
  **backup options**, and **minimum-day** recovery logic.
- Designed **habit momentum tracking**, **application tracking**, and **weekly review
  analytics**.
- Added **installable PWA** support with a **service worker**, private cloud sync,
  hardened web-push delivery, and cross-midnight reminder deduplication.
- Added regression coverage across pure domain logic, rendered components, and
  first-run/Rescue browser journeys.

---

## 📝 Notes

- Persistent data requires Supabase sign-in. A signed-out preview is temporary;
  use **Export** for an optional file backup and **Reset** to replace the synced
  snapshot with a fresh starter state.
- Placeholder routine times are sensible defaults meant to be personalized.

Built with care for brains that work a little differently. 💜
