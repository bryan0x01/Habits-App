"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Bell, ChevronRight, Star } from "lucide-react";

import { useStore } from "@/components/store-provider";
import { Card, CardContent } from "@/components/ui/card";
import {
  applicationsSentThisWeek,
  followUpsDueThisWeek,
  priorityInPipeline,
} from "@/lib/applications";
import { useNow } from "@/lib/use-now";

/** Compact weekly recruiting pulse for the Today dashboard. */
export function RecruitingSummary() {
  const now = useNow(60_000);
  const { applications } = useStore();

  if (applications.length === 0) return null;

  const sent = applicationsSentThisWeek(applications, now);
  const followUps = followUpsDueThisWeek(applications, now);
  const priority = priorityInPipeline(applications);
  const nextFollowUp = followUps[0];

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Recruiting · this week</p>
          <Link
            href="/applications"
            className="flex items-center text-sm font-medium text-primary"
          >
            Open
            <ChevronRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat value={sent} label="sent" />
          <Stat value={followUps.length} label="follow-ups" />
          <Stat value={priority} label="priority" starred />
        </div>

        {nextFollowUp ? (
          <p className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-2 text-xs">
            <Bell className="size-3.5 shrink-0 text-primary" />
            <span className="min-w-0 truncate">
              Follow up: {nextFollowUp.role} · {nextFollowUp.company}
            </span>
            {nextFollowUp.followUpDate ? (
              <span className="ml-auto shrink-0 text-muted-foreground">
                {format(parseISO(nextFollowUp.followUpDate), "MMM d")}
              </span>
            ) : null}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Stat({
  value,
  label,
  starred,
}: {
  value: number;
  label: string;
  starred?: boolean;
}) {
  return (
    <div>
      <p className="flex items-center justify-center gap-1 text-xl font-bold">
        {starred && value > 0 ? (
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
        ) : null}
        {value}
      </p>
      <p className="text-[0.7rem] text-muted-foreground">{label}</p>
    </div>
  );
}
