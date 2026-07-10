"use client";

import * as React from "react";

import { AddHabitDialog } from "@/components/add-habit-dialog";
import { HabitCard } from "@/components/habit-card";
import { HabitDayStateCard } from "@/components/habit-day-state";
import { PageContainer, LoadingCards } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { useStore } from "@/components/store-provider";
import { WeeklyMomentum } from "@/components/weekly-momentum";
import { HABIT_CATEGORIES, habitCategoryMeta } from "@/lib/constants";
import { computeWeeklyMomentum } from "@/lib/day-state";
import { isHabitDueOn } from "@/lib/habits";
import { dateKey, weekdayOf } from "@/lib/time";
import { subDays } from "date-fns";
import { useNow } from "@/lib/use-now";

export default function HabitsPage() {
  const now = useNow(60_000);
  const { hydrated, habits, habitLogs, habitStatus } = useStore();
  const weekday = weekdayOf(now);

  const dueToday = habits.filter((h) => isHabitDueOn(h, weekday));
  const otherHabits = habits.filter((h) => !isHabitDueOn(h, weekday));

  const weekKeys = React.useMemo(
    () => new Set(Array.from({ length: 7 }, (_, i) => dateKey(subDays(now, i)))),
    [now],
  );
  const weeklyCheckins = habitLogs.filter(
    (l) => l.status === "done" && weekKeys.has(l.date),
  ).length;
  const momentum = React.useMemo(
    () => computeWeeklyMomentum(habits, habitLogs, now),
    [habits, habitLogs, now],
  );

  return (
    <>
      <PageHeader
        title="Habits"
        subtitle="Small, forgiving, repeatable"
        action={<AddHabitDialog />}
      />
      <PageContainer className="space-y-5">
        {!hydrated ? (
          <LoadingCards />
        ) : habits.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No habits yet. Add one — start with something almost too easy.
          </p>
        ) : (
          <>
            <HabitDayStateCard showMinimums={false} showLink={false} />
            <WeeklyMomentum />
            <p className="-mt-2 px-1 text-xs text-muted-foreground">
              {weeklyCheckins} check-ins · {momentum.completedDays} days saved this week.
              Every one counts.
            </p>

            {HABIT_CATEGORIES.map((cat) => {
              const items = dueToday.filter((h) => h.category === cat);
              if (items.length === 0) return null;
              const meta = habitCategoryMeta(cat);
              const done = items.filter((h) => habitStatus(h.id) === "done").length;
              return (
                <section key={cat} className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-semibold">
                      {meta.emoji} {meta.label}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {done}/{items.length}
                    </span>
                  </div>
                  {items.map((h) => (
                    <HabitCard key={h.id} habit={h} showDelete={h.custom} />
                  ))}
                </section>
              );
            })}

            {otherHabits.length > 0 ? (
              <section className="space-y-2">
                <h2 className="px-1 text-sm font-semibold text-muted-foreground">
                  Not scheduled today
                </h2>
                {otherHabits.map((h) => (
                  <HabitCard key={h.id} habit={h} showDelete={h.custom} />
                ))}
              </section>
            ) : null}
          </>
        )}
      </PageContainer>
    </>
  );
}
