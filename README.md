# DayFlow 🌊

**What to do now — and how to get back on track.**

DayFlow is a mobile-first, installable **PWA** that helps people with ADHD-friendly
routines answer one question first: _"What should I do right now?"_ — and, just as
importantly, _"How do I recover when I fall off?"_

Instead of a giant, guilt-inducing to-do list, DayFlow surfaces the **one thing**
that matters at this moment, offers a **tiny on-ramp** to start it, a **lighter
backup** when it feels like too much, and a **kind path back** when a block slips.

> DayFlow works fully offline with `localStorage`. Optional email sign-in adds
> private Supabase sync across devices while keeping the app usable offline.

---

## ✨ Features

Six screens, each intentionally focused:

| Screen | What it does |
| --- | --- |
| **Today** | The home base. "What now" hero, Next Best Action recovery, one compact capacity/progress control, Top 3 priorities, habit day-state, and the rest-of-day timeline. In **Chaos** mode it collapses to just three moves. |
| **Routines** | Pick from four templates or start with a blank week, then make it yours: activate, duplicate, rename, and add/edit/delete time blocks. New blocks can repeat across multiple selected days. |
| **Habits** | 11 seeded daily habits grouped by category, with completion states, weekly momentum, and friction logging. Add your own; delete anytime. |
| **Applications** | A CS-recruiting tracker: type (internship / new-grad / co-op / part-time), status pipeline, priority, deadlines, resume version, referral contact, and follow-ups. Filters by status **and** priority, flags follow-ups due this week, and stars target companies (Wells Fargo, Ally, BofA, CEMEX, Capital One, Charlotte roles). A weekly recruiting pulse also shows on Today. |
| **Weekly Review** | Judgment-free, chart-free analytics: gym, study, English, reading, and cleaning days; applications sent; project blocks; top friction; your strongest day; one suggested improvement; and a **Plan next week** draft (school/work, health/gym, career/project). |
| **Settings** | Active routine, energy defaults, theme, optional magic-link cloud sync, data export/import, and reset. |

Four routine templates ship out of the box — **Charlotte** (work + school),
**Monterrey** (CEMEX weeks), **Weekend**, and **Minimum Day** — each with realistic
time blocks, tiny-starts, backup options, and per-block importance. On first run
they're cloned into your local store so every one is fully editable.

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
- **Energy Mode** (High / Medium / Low / Chaos) — you tell the app how much you've
  got, and the copy + emphasis adapt. In **Chaos** mode it literally says
  _"One thing. That's the whole job right now."_
- **Minimum Day toggle** — shrinks the day to just the high-importance blocks when
  you're struggling. Everything else becomes explicitly optional.
- **Top 3 priorities** — three things that would make today a win, kept small,
  above the noise of any longer list.
- **Completion states, not scores** — hit your minimum habits and the day is
  **Minimum saved**; do most and it's a **Strong day**; do them all for a **Full
  win**. A rough day still counts.
- **Chaos mode** — the highest-overwhelm energy level strips the whole dashboard to
  exactly three moves: one tiny start, one minimum task, one recovery action.
- **Next Best Action** — when an important block slips past untouched, you get a
  calm recovery prompt (_"do 20 minutes instead of skipping completely"_) instead of
  a red "missed" badge.
- **Momentum, not streaks** — weekly momentum counts **completed days out of 7**.
  Miss a day and nothing breaks; you just pick back up. No streak to "lose".
- **Friction logging** — skipping asks a low-friction _"what got in the way?"_ (too
  big, no energy, distracted…). Over a week, the Review screen surfaces patterns so
  you can shrink the right tasks — framed as data, never as failure.
- **Tone & UI** — friendly but not childish, big tap targets, cards over lists,
  dark mode, and encouraging copy throughout ("Fell off? Totally normal.").
- **Progressive density** — Today contains only decisions needed today. Weekly
  momentum lives in Habits and recruiting analytics live in Applications.

---

## 🛠 Tech stack

- **[Next.js 15](https://nextjs.org/)** (App Router) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS 3** + **[shadcn/ui](https://ui.shadcn.com/)** (Radix primitives)
- **[date-fns](https://date-fns.org/)** for date/time logic
- **[lucide-react](https://lucide.dev/)** icons
- **[next-themes](https://github.com/pacocoursey/next-themes)** for dark mode
- **`localStorage`** for local-first persistence — wrapped in typed utilities
- **Supabase** (optional) — magic-link Auth plus a private RLS-protected sync snapshot
- **PWA**: web manifest, service worker, and generated icons
- Deploy-ready for **Vercel**

### Data models

Defined in [`src/lib/types.ts`](src/lib/types.ts): `Routine`, `RoutineBlock`
(with `importance` and `notificationMinutesBefore`), `Habit` (with `category` and
`minimum`), `HabitLog`, `BlockLog`, `Priority`, `Application`, `EnergyLog`,
`FrictionLog`, `WeekPlan`, and `UserSettings`. They're plain and serializable on purpose, so
the same shapes can back a Supabase schema later. A `SCHEMA_VERSION` guard in
[`storage.ts`](src/lib/storage.ts) reseeds cleanly when these shapes evolve.

### Persistence

All storage flows through [`src/lib/storage.ts`](src/lib/storage.ts) (typed
`loadItem`/`saveItem`, plus snapshot export/import). The single React
[`StoreProvider`](src/components/store-provider.tsx) hydrates from `localStorage`
on mount and persists every change. It saves:

- the active routine plus all **editable routines and their blocks**
- settings (energy mode, minimum day, theme)
- completed/skipped **habits by date** and **routine blocks by date**
- the day's **Top 3 priorities**
- **applications**, **energy logs**, and **friction logs**
- next-week planning drafts

When signed in, the store also syncs this snapshot to a single RLS-protected
Supabase row per user. Local data remains the immediate/offline source of truth;
cloud sync happens in the background.

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
    ├── storage.ts      # localStorage utilities + export/import
    ├── schedule.ts     # "What now / next / missed" logic
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
tests/                   # Vitest domain and persistence regression suite
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

> **No environment variables are required for local-only use.** To enable
> account sync, follow [the Supabase setup guide](docs/SUPABASE_SETUP.md) and add
> the URL plus publishable key to `.env.local` and Vercel.

Production build:

```bash
npm run build
npm start
```

Full release verification:

```bash
npm run check    # ESLint + 25 regression tests + production build/type-check
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

The MVP is deliberately local-only. Natural next steps:

- **Richer multi-device conflict handling** — signed-in devices already sync a
  private snapshot; future work can add live conflict resolution for simultaneous
  edits on two open devices.
- **AI assistance** — an on-device/Claude-powered coach that reshapes the day based
  on your energy mode, suggests smarter tiny-starts, and turns friction logs into
  personalized nudges.
- **Google Calendar** — two-way sync so routine blocks reflect real meetings and
  free/busy time.
- **Real web push notifications** — gentle, well-timed reminders for your next block.
  Blocks already carry a `notificationMinutesBefore`; the Settings screen has the
  toggle placeholder. This wires it to the Push API, respecting focus and quiet hours.
- **Deeper calendar recurrence** — multi-day block creation is available today;
  future calendar sync could add date ranges, exceptions, and alternating weeks.

---

## 📄 Resume bullets

- Built a mobile-first, ADHD-friendly productivity **PWA** using **Next.js**,
  **TypeScript**, **Tailwind CSS**, and **localStorage**.
- Implemented adaptive routine flows with **energy modes**, **tiny-start** actions,
  **backup options**, and **minimum-day** recovery logic.
- Designed **habit momentum tracking**, **application tracking**, and **weekly review
  analytics**.
- Added **installable PWA** support with a **service worker** and
  **notification-ready settings**.

---

## 📝 Notes

- All data is stored **locally on the device**. Clearing site data or using the
  **Reset** button in Settings wipes it. Use **Export** in Settings to back up.
- Placeholder routine times are sensible defaults meant to be personalized.

Built with care for brains that work a little differently. 💜
