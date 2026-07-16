# DayFlow's private planning engine

DayFlow drafts routines, organizes brain dumps, and learns a few useful planning
preferences without calling an AI API. The code runs in the browser and uses only
the DayFlow data already loaded for the current person.

## What it understands

The routine builder recognizes common English and Spanish phrases for:

- named weekdays, weekdays, weekends, and every day;
- fixed ranges such as “Monday to Friday from 9 to 5”;
- exact times, morning, afternoon, and evening;
- before-work and after-work blocks;
- work, class, study, exercise, projects, applications, chores, sleep, social
  time, language practice, resets, and weekly planning.

The parser deliberately stays narrow. When a description has no usable activity,
it asks for clearer details instead of inventing a full lifestyle. Fixed blocks
that overlap are left out and explained in the preview. Nothing is saved until
the person reviews the draft and taps **Add routine**.

## What it learns

`learnPlanningProfile()` looks at the last 56 days and calculates:

- completion counts and smoothed completion rates by block category;
- the median start time of categories completed at least three times;
- the median duration of completed flexible tasks when at least three examples
  exist for that category.

Untimed routine blocks may use those median start times. Brain dumps may use the
learned task size and category outcome as a tie-breaker after importance and
current energy. The engine never changes a fixed time, diagnoses the user, or
silently edits an existing routine.

## Privacy and cost

- No OpenAI or other model API is installed.
- No API key, billing account, or network request is required.
- Routine descriptions and brain dumps stay on the device.
- Saved check-ins continue to sync privately through the person's Supabase row.

Tests for parsing, learning thresholds, low-energy task sizes, and non-invention
live in `tests/local-planning-engine.test.ts`.
