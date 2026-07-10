"use client";

import * as React from "react";
import { addDays } from "date-fns";
import { Hammer, HeartHandshake, Lightbulb, Send, Sparkles, Trophy } from "lucide-react";

import { PageContainer, LoadingCards } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { useStore } from "@/components/store-provider";
import { WeeklyMomentum } from "@/components/weekly-momentum";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { frictionMeta } from "@/lib/constants";
import { computeWeeklyReview, weekKeyOf } from "@/lib/review";
import { WEEKDAY_LABELS } from "@/lib/time";
import { useNow } from "@/lib/use-now";

export default function ReviewPage() {
  const now = useNow(60_000);
  const {
    hydrated,
    habitLogs,
    routines,
    blockLogs,
    applications,
    frictionLogs,
    getWeekPlan,
    setWeekPlan,
  } = useStore();

  const data = React.useMemo(
    () =>
      computeWeeklyReview({ habitLogs, routines, blockLogs, applications, frictionLogs, now }),
    [habitLogs, routines, blockLogs, applications, frictionLogs, now],
  );

  const nextWeekKey = weekKeyOf(addDays(now, 7));
  const plan = getWeekPlan(nextWeekKey);
  const frictionMax = data.topFriction[0]?.count ?? 1;

  return (
    <>
      <PageHeader title="Weekly review" subtitle="Your last 7 days, judgment-free" />
      <PageContainer className="space-y-4">
        {!hydrated ? (
          <LoadingCards />
        ) : (
          <>
            <WeeklyMomentum />

            {data.totalWins === 0 ? (
              <p className="rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                Your week is just getting started. Check a few things off and this
                page fills in with your momentum.
              </p>
            ) : null}

            {/* This-week habit metrics */}
            <Card>
              <CardContent className="space-y-3 p-4">
                <p className="text-sm font-semibold">This week</p>
                <div className="space-y-3">
                  {data.dayMetrics.map((m) => (
                    <div key={m.key} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          {m.emoji} {m.label}
                        </span>
                        <span className="text-muted-foreground">
                          {m.done}/{m.total} days
                        </span>
                      </div>
                      <Progress
                        value={(m.done / m.total) * 100}
                        indicatorClassName={m.done >= 5 ? "bg-success" : "bg-primary"}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Applications + project blocks */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<Send className="size-4" />}
                value={data.applicationsSent}
                label="applications sent"
              />
              <StatCard
                icon={<Hammer className="size-4" />}
                value={data.projectBlocks}
                label="project blocks done"
              />
            </div>

            {/* Best day */}
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
                  <Trophy className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Strongest day</p>
                  <p className="text-sm text-muted-foreground">
                    {data.bestDay
                      ? `${WEEKDAY_LABELS[data.bestDay.weekday]} — ${data.bestDay.wins} win${
                          data.bestDay.wins === 1 ? "" : "s"
                        }. Nice.`
                      : "No standout day yet — plenty of week left."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Friction */}
            <Card>
              <CardContent className="space-y-3 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <HeartHandshake className="size-4 text-primary" />
                  What got in the way
                </p>
                {data.topFriction.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No friction logged. If you skipped things, logging the why helps
                    spot patterns — never a mark against you.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {data.topFriction.slice(0, 4).map(({ reason, count }) => {
                      const meta = frictionMeta(reason);
                      return (
                        <li key={reason} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>
                              {meta.emoji} {meta.label}
                            </span>
                            <span className="text-muted-foreground">{count}×</span>
                          </div>
                          <Progress value={(count / frictionMax) * 100} className="h-2" />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Suggested improvement */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Lightbulb className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">One thing to try next week</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{data.suggestion}</p>
                </div>
              </CardContent>
            </Card>

            {/* Plan next week */}
            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <p className="text-sm font-semibold">Plan next week</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Three draft priorities. Keep them small and specific.
                </p>
                <PlanField
                  label="🎓 School / work"
                  value={plan.school}
                  onChange={(v) => setWeekPlan(nextWeekKey, "school", v)}
                  placeholder="e.g. Finish the OS project milestone"
                />
                <PlanField
                  label="💪 Health / gym"
                  value={plan.health}
                  onChange={(v) => setWeekPlan(nextWeekKey, "health", v)}
                  placeholder="e.g. Gym 4 days, lights out by 11"
                />
                <PlanField
                  label="🚀 Career / project"
                  value={plan.career}
                  onChange={(v) => setWeekPlan(nextWeekKey, "career", v)}
                  placeholder="e.g. Apply to 5 roles, ship Halynt feature"
                />
              </CardContent>
            </Card>

            <p className="px-2 pb-2 text-center text-sm text-muted-foreground">
              You showed up {data.activeDays} day{data.activeDays === 1 ? "" : "s"} this
              week. That&apos;s worth something. 💜
            </p>
          </>
        )}
      </PageContainer>
    </>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <p className="mt-2 text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function PlanField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const id = `plan-${label.replace(/[^a-z]/gi, "").toLowerCase()}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={120}
      />
    </div>
  );
}
