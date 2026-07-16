# Design QA — natural copy, account step, and Clerk

## Scope

- Previous visual reference: `docs/audit-2026-07-15/16-onboarding-halynt-welcome.png`
- Current implementation evidence:
  - `docs/audit-2026-07-16/02-onboarding-welcome-current.png`
  - `docs/audit-2026-07-16/03-onboarding-account-current.png`
  - `docs/audit-2026-07-16/05-clerk-signup-fixed.png`
  - `docs/audit-2026-07-16/06-onboarding-ready-current.png`
- Debug evidence: `docs/audit-2026-07-16/04-clerk-signup-current.png`
- Viewport: 390 × 844 px
- State: signed-out preview, dark system theme, five-step onboarding

The previous and current welcome screens were reviewed together at original
resolution. The broken and fixed Clerk modals were also reviewed together.

## Fidelity review

- Typography: the existing compact hierarchy, system font, and Halynt lockup are
  preserved. The new copy uses shorter sentences and ordinary action labels.
- Spacing: welcome, account, and final-review screens each fit within 844 px. The
  onboarding dialog reports equal client and scroll heights, and the page has no
  horizontal overflow at 390 px.
- Colors: the established iris theme remains intact. Clerk colors are explicitly
  mapped to DayFlow’s Tailwind 3 HSL tokens so its card is opaque in dark mode.
- Icons: the new account and summary details use the existing Lucide-based icon
  system. No emoji, placeholder art, or new illustration style was introduced.
- Copy: the four-step flow is now five short steps, adding account creation
  without turning the first run into a long form.

## Interaction coverage

- Completed welcome → support → routine → account → review → Today.
- Confirmed the quick starter path also stops at the optional account step.
- Opened and closed Clerk’s create-account modal.
- Confirmed Create account, existing-account, Not now, Back, and Go to Today are
  unique accessible controls.
- Confirmed Clerk exposes labeled email and password fields plus Google sign-in.
- Confirmed all checked onboarding states use a 390 px body width with no
  horizontal overflow.

## Comparison history

1. **P1 — Clerk modal was transparent.** Clerk’s shadcn theme expects complete
   CSS color values, while DayFlow stores Tailwind 3 HSL components. The modal
   showed onboarding text through the form. Fixed by mapping every Clerk color
   variable to `hsl(var(--token))`, setting an explicit backdrop, and giving the
   Clerk card an opaque semantic background.
2. **P2 — onboarding needed account creation without extra pressure.** Added a
   dedicated step with Create account, existing-account sign-in, a privacy note,
   and a visible Not now action. Signed-in people advance automatically.
3. **P2 — the previous copy sounded generated.** Replaced abstract coaching
   phrases with direct labels such as Set up DayFlow, First step, Basics only,
   Adjust plan, Top priorities, and What got in the way?

## Result

passed
