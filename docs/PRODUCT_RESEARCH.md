# DayFlow by Halynt product research

This document records the evidence used for the built-in life-mode templates,
visual hierarchy, and private planning rules. These are editable defaults, not
medical, educational, or workplace requirements.

## Product patterns

- Tiimo makes executive support visual and uses checklists and flexible planning.
- Structured makes a continuous timeline the recognizable primary surface.
- Sunsama turns daily planning, workload limits, and shutdown into a ritual.
- Things uses progressive disclosure and separates actionable work from later work.
- Motion's clearest promise is automatic replanning when the day changes.

DayFlow's product position is therefore: **the planner that still works when the
day stops following the plan**. Its core loop is capture, commit, flow, rescue,
and review.

### 2026 product audit: what DayFlow adopts and avoids

The July 2026 redesign compared the current product language and workflows of
Tiimo, Structured, Finch, Brili, and Routinery with recent user reports. The
shared strengths were clear:

- **Tiimo:** visual time, a focus countdown, editable routines, and brain-dump
  breakdowns make executive support concrete rather than abstract.
- **Structured:** one continuous timeline gives the day a recognizable shape.
- **Finch:** gentle setup and opt-in suggestions make the product adapt to the
  person instead of prescribing the same self-care list to everyone.
- **Brili and Routinery:** guided next actions, visual timers, templates, and
  forgiving schedule changes help people move without reconstructing a routine
  from memory.

The recurring gaps were equally useful. Recent ADHD community threads repeatedly
describe planners as either too feature-heavy or so plain that users stop opening
them. People also report dumping too many items into a planner, losing the next
action, or abandoning a setup that demands too much clicking. These are anecdotal
signals, not population estimates, but they align with W3C cognitive-accessibility
guidance to keep the main interface simple, show important information first, and
avoid presenting more than five primary choices at once.

DayFlow's implementation deliberately answers those gaps:

- the Today screen keeps one dark focus surface and collapses loose ends plus
  the full schedule behind a single “Open the full plan” control;
- a missed important block becomes an explicit keep/shrink/let-go decision and
  is never silently rescheduled;
- a visual time ring and optional 10/25/45-minute focus sprint make time visible;
- first-run setup asks only what kind of support helps and which of five editable
  week shapes is closest—defaults remain available in one tap;
- new accounts receive generic routines and habits rather than the developer’s
  personal locations, employer, classes, or goals;
- category and state icons come from one semantic icon system instead of repeated
  decorative marks or emoji;
- theme and five basic interface colors live in Settings and sync with the rest
  of the private Supabase snapshot;
- a signed-out session is clearly labeled as a temporary preview and never
  pretends that browser-only changes are saved.

Product sources:

- https://www.tiimoapp.com/
- https://structured.app/
- https://help.finchcare.com/hc/en-us/articles/37935669335309-Our-Approach-to-Self-Care
- https://www.brili.co/how-it-works/
- https://apps.apple.com/us/app/routine-planner-habit-tracker/id1450486923
- https://www.w3.org/WAI/WCAG2/supplemental/patterns/o5p03-manageable-quantity/

User-reported gaps reviewed:

- https://www.reddit.com/r/ADHD/comments/1ncobu0/does_any_task_app_actually_work_longterm_for_adhd/
- https://www.reddit.com/r/DigitalPlanner/comments/1rpl455/whats_the_best_digital_planner_for_adhd/
- https://www.reddit.com/r/ADHD/comments/1neu5ne/what_productivity_tool_frustrates_you_the_most/
- https://www.reddit.com/r/ADHD/comments/1j7qpo5/why_do_most_adhd_apps_feel_so_wrong/

## Student mode

Included:

- short retrieval practice after class
- spaced review of older material
- one focused assignment block
- weekly intention setting
- a consistent sleep setup

Evidence:

- Retrieval practice review: https://doi.org/10.1007/s10648-021-09595-9
- Distributed and retrieval practice review: https://pmc.ncbi.nlm.nih.gov/articles/PMC11078833/
- CDC sleep and student health: https://www.cdc.gov/physical-activity-education/staying-healthy/sleep.html

## Frontline and shift mode

Included:

- shift preparation to reduce missing essentials
- a visible meal/break placeholder that users must move to their real allowed time
- post-shift decompression before home tasks
- only one home essential after the shift
- next-shift setup and sleep protection

Evidence:

- NIOSH fatigue guidance: https://www.cdc.gov/niosh/fatigue/about/index.html
- NIOSH retail fatigue guidance: https://www.cdc.gov/niosh/docs/wp-solutions/2019-102/
- Micro-break meta-analysis: https://pubmed.ncbi.nlm.nih.gov/36044424/

## Corporate mode

Included:

- one named daily outcome
- protected focus before communication where the role allows it
- explicit collaboration and communication windows
- lunch away from the work surface
- a written shutdown cue

Email batching is not presented as a universal rule because its benefit depends
on message volume and the response expectations of the role.

Evidence:

- Email batching context study: https://pmc.ncbi.nlm.nih.gov/articles/PMC8897209/
- Work-break systematic review: https://pubmed.ncbi.nlm.nih.gov/35980721/

## Own-business mode

Included:

- separate delivery, sales, operations, and money blocks
- a daily business constraint instead of an unbounded task list
- a buffer rather than filling all available time
- explicit delegation and detachment

Evidence:

- Recovery meta-analysis: https://onlinelibrary.wiley.com/doi/full/10.1002/job.2217
- Small-business owner recovery study: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5069976

## Vacation mode

Included:

- four loose anchors only: morning care, one highlight, movement/reset, loose close
- no work block by default
- a reversible switch that restores the prior routine
- low importance for optional movement and flexible activities

Psychological detachment and physical activity are associated with stronger
vacation well-being. Context changes also weaken ordinary habit cues, so DayFlow
keeps only portable anchors rather than recreating the normal schedule.

Evidence:

- Vacation and well-being meta-analysis: https://pubmed.ncbi.nlm.nih.gov/39836131/
- Context change and habit discontinuity: https://pubmed.ncbi.nlm.nih.gov/15982113/

## Private planner boundaries

The brain-dump parser uses visible keyword and duration rules. Rescue uses the
selected time budget, task importance, estimated effort, and current capacity.
It does not diagnose, infer medication effects, silently delete tasks, or call a
paid AI service. Users preview captured tasks and explicitly apply every rescue
plan. Persistent account data is stored only in the user-owned Supabase snapshot;
signed-out previews remain in memory and disappear on refresh.
