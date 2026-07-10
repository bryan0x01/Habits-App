"use client";

import { CalendarClock } from "lucide-react";

import { ChaosMode } from "@/components/chaos-mode";
import { DayProgress } from "@/components/day-progress";
import { EnergyModeSelector } from "@/components/energy-mode-selector";
import { HabitDayStateCard } from "@/components/habit-day-state";
import { MinimumDayToggle } from "@/components/minimum-day-toggle";
import { PageContainer, LoadingCards } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { RecruitingSummary } from "@/components/recruiting-summary";
import { useStore } from "@/components/store-provider";
import { TodayTimeline } from "@/components/today-timeline";
import { TopPriorities } from "@/components/top-priorities";
import { WeeklyMomentum } from "@/components/weekly-momentum";
import { NextBestActionCard, WhatNowCard } from "@/components/what-now-card";
import { greeting, longDate } from "@/lib/time";
import { useNow } from "@/lib/use-now";

export default function TodayPage() {
  const now = useNow(60_000);
  const { hydrated, routine, settings } = useStore();
  const isChaos = settings.energyMode === "chaos";

  return (
    <>
      <PageHeader
        title={greeting(now)}
        subtitle={`${longDate(now)} · ${routine.emoji} ${routine.name}`}
      />
      <PageContainer className="space-y-4">
        {!hydrated ? (
          <LoadingCards />
        ) : isChaos ? (
          <>
            <EnergyModeSelector />
            <ChaosMode />
          </>
        ) : (
          <>
            <WhatNowCard />
            <NextBestActionCard />
            <DayProgress />

            <section className="space-y-3">
              <EnergyModeSelector />
              <MinimumDayToggle />
            </section>

            <TopPriorities />
            <HabitDayStateCard />
            <WeeklyMomentum />
            <RecruitingSummary />

            <section className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <CalendarClock className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Rest of today · {routine.emoji} {routine.name}
                </h2>
              </div>
              <TodayTimeline />
            </section>
          </>
        )}
      </PageContainer>
    </>
  );
}
