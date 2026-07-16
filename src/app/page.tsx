"use client";

import { CalendarClock, ChevronDown } from "lucide-react";

import { ChaosMode } from "@/components/chaos-mode";
import { HabitDayStateCard } from "@/components/habit-day-state";
import { FlexPlan } from "@/components/flex-plan";
import { PageContainer, LoadingCards } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { useStore } from "@/components/store-provider";
import { TodayOverview } from "@/components/today-overview";
import { TodayTimeline } from "@/components/today-timeline";
import { TopPriorities } from "@/components/top-priorities";
import { NextBestActionCard, WhatNowCard } from "@/components/what-now-card";
import { greeting, longDate } from "@/lib/time";
import { useNow } from "@/lib/use-now";
import { VacationBanner } from "@/components/vacation-mode";

export default function TodayPage() {
  const now = useNow(60_000);
  const { hydrated, routine, settings } = useStore();
  const isChaos = settings.energyMode === "chaos";

  return (
    <>
      <PageHeader
        title={greeting(now)}
        subtitle={`${longDate(now)} · ${routine.name}`}
      />
      <PageContainer className="space-y-4">
        {!hydrated ? (
          <LoadingCards />
        ) : isChaos ? (
          <ChaosMode />
        ) : (
          <>
            <VacationBanner />
            <WhatNowCard />
            <NextBestActionCard />
            <TodayOverview />
            <TopPriorities />
            <HabitDayStateCard />

            <details className="group overflow-hidden rounded-3xl border bg-card">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CalendarClock className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">Open the full plan</h2>
                  <p className="truncate text-xs text-muted-foreground">Loose ends and the rest of {routine.name}</p>
                </div>
                <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-4 border-t border-border/70 p-3">
                <FlexPlan />
                <section className="space-y-2">
                  <h3 className="px-1 text-sm font-semibold text-muted-foreground">Later today</h3>
                  <TodayTimeline />
                </section>
              </div>
            </details>
          </>
        )}
      </PageContainer>
    </>
  );
}
