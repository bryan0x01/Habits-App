"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { Bell, BriefcaseBusiness, Plus, Star } from "lucide-react";

import { ApplicationCard } from "@/components/application-card";
import { ApplicationDialog } from "@/components/application-dialog";
import { PageContainer, LoadingCards } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { useStore } from "@/components/store-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  applicationsSentThisWeek,
  followUpsDueThisWeek,
  isActive,
  isPriorityCompany,
  priorityInPipeline,
} from "@/lib/applications";
import { APPLICATION_STATUSES, APP_PRIORITY_META } from "@/lib/constants";
import type { Application, ApplicationStatus, Importance } from "@/lib/types";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | ApplicationStatus;
type PriorityFilter = "all" | Importance;

export default function ApplicationsPage() {
  const now = useNow(60_000);
  const { hydrated, applications } = useStore();
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<PriorityFilter>("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Application | undefined>();

  const openAdd = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };
  const openEdit = (application: Application) => {
    setEditing(application);
    setDialogOpen(true);
  };

  const counts = React.useMemo(() => {
    const map = new Map<ApplicationStatus, number>();
    for (const a of applications) map.set(a.status, (map.get(a.status) ?? 0) + 1);
    return map;
  }, [applications]);

  const sentThisWeek = applicationsSentThisWeek(applications, now);
  const followUps = followUpsDueThisWeek(applications, now);
  const priorityCount = priorityInPipeline(applications);
  const activeCount = applications.filter(isActive).length;

  const visible = React.useMemo(() => {
    return [...applications]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .filter((a) => (statusFilter === "all" ? true : a.status === statusFilter))
      .filter((a) =>
        priorityFilter === "all" ? true : (a.priority ?? "medium") === priorityFilter,
      );
  }, [applications, statusFilter, priorityFilter]);

  return (
    <>
      <PageHeader
        title="Applications"
        subtitle={`${activeCount} in flight`}
        action={
          <Button size="sm" variant="secondary" onClick={openAdd}>
            <Plus className="size-4" />
            Add
          </Button>
        }
      />
      <PageContainer className="space-y-4">
        {!hydrated ? (
          <LoadingCards />
        ) : applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center">
            <BriefcaseBusiness className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="font-medium">No applications yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Track internships, new-grad roles, and referrals here so nothing
              slips. One at a time is plenty.
            </p>
            <Button className="mt-4" onClick={openAdd}>
              <Plus className="size-4" />
              Add your first
            </Button>
          </div>
        ) : (
          <>
            {/* This-week summary */}
            <div className="grid grid-cols-3 gap-2">
              <SummaryStat value={sentThisWeek} label="sent this week" />
              <SummaryStat value={followUps.length} label="follow-ups due" />
              <SummaryStat value={priorityCount} label="priority targets" starred />
            </div>

            {/* Follow-ups due this week */}
            {followUps.length > 0 ? (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="space-y-2 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Bell className="size-4 text-primary" />
                    Follow up this week
                  </p>
                  <ul className="space-y-1.5">
                    {followUps.map((a) => (
                      <li key={a.id}>
                        <button
                          type="button"
                          onClick={() => openEdit(a)}
                          className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-accent"
                        >
                          <span className="flex min-w-0 items-center gap-1.5">
                            {isPriorityCompany(a) ? (
                              <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                            ) : null}
                            <span className="truncate">
                              {a.role} · {a.company}
                            </span>
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {a.followUpDate ? format(parseISO(a.followUpDate), "MMM d") : ""}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}

            {/* Status filter */}
            <div
              className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4"
              role="group"
              aria-label="Filter by status"
            >
              <FilterChip
                label="All"
                count={applications.length}
                active={statusFilter === "all"}
                onClick={() => setStatusFilter("all")}
              />
              {APPLICATION_STATUSES.map((s) => (
                <FilterChip
                  key={s.id}
                  label={`${s.emoji} ${s.label}`}
                  count={counts.get(s.id) ?? 0}
                  active={statusFilter === s.id}
                  onClick={() => setStatusFilter(s.id)}
                />
              ))}
            </div>

            {/* Priority filter */}
            <div className="flex gap-2" role="group" aria-label="Filter by priority">
              <PriorityChip
                label="Any priority"
                active={priorityFilter === "all"}
                onClick={() => setPriorityFilter("all")}
              />
              {(["high", "medium", "low"] as Importance[]).map((p) => (
                <PriorityChip
                  key={p}
                  label={APP_PRIORITY_META[p].label}
                  active={priorityFilter === p}
                  dot={APP_PRIORITY_META[p].dot}
                  onClick={() => setPriorityFilter(p)}
                />
              ))}
            </div>

            {visible.length === 0 ? (
              <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                Nothing matches this filter.
              </p>
            ) : (
              <div className="space-y-3">
                {visible.map((a) => (
                  <ApplicationCard key={a.id} application={a} onEdit={openEdit} />
                ))}
              </div>
            )}
          </>
        )}
      </PageContainer>

      <ApplicationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        application={editing}
      />
    </>
  );
}

function SummaryStat({
  value,
  label,
  starred,
}: {
  value: number;
  label: string;
  starred?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-3 text-center">
        <p className="flex items-center justify-center gap-1 text-2xl font-bold">
          {starred && value > 0 ? (
            <Star className="size-4 fill-amber-400 text-amber-400" />
          ) : null}
          {value}
        </p>
        <p className="text-[0.7rem] leading-tight text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:bg-accent",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 text-xs",
          active ? "bg-primary-foreground/20" : "bg-muted",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function PriorityChip({
  label,
  active,
  dot,
  onClick,
}: {
  label: string;
  active: boolean;
  dot?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-full border px-2 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:bg-accent",
      )}
    >
      {dot ? <span className={cn("size-1.5 rounded-full", dot)} /> : null}
      {label}
    </button>
  );
}
