"use client";

import { format, parseISO } from "date-fns";
import { Bell, CalendarClock, ExternalLink, Pencil, Star, Trash2, UserRound } from "lucide-react";

import { useStore } from "@/components/store-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPLICATION_STATUSES,
  APP_PRIORITY_META,
  appStatusMeta,
  appTypeMeta,
} from "@/lib/constants";
import { isPriorityCompany } from "@/lib/applications";
import type { Application, ApplicationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

function fmt(dateStr?: string): string | null {
  if (!dateStr) return null;
  try {
    return format(parseISO(dateStr), "MMM d");
  } catch {
    return dateStr;
  }
}

export function ApplicationCard({
  application,
  onEdit,
}: {
  application: Application;
  onEdit: (application: Application) => void;
}) {
  const { updateApplication, removeApplication } = useStore();
  const meta = appStatusMeta(application.status);
  const priority = application.priority ?? "medium";
  const priorityMeta = APP_PRIORITY_META[priority];
  const starred = isPriorityCompany(application);
  const deadline = fmt(application.deadline);
  const followUp = fmt(application.followUpDate);

  return (
    <Card className={cn(starred && "border-amber-400/50 ring-1 ring-amber-400/20")}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {starred ? (
                <Star
                  className="size-4 shrink-0 fill-amber-400 text-amber-400"
                  aria-label="Priority company"
                />
              ) : null}
              <p className="truncate font-semibold">{application.role}</p>
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {application.company}
              {application.location ? ` · ${application.location}` : ""}
            </p>
          </div>
          <Badge variant="secondary" className={cn("shrink-0 border-0", meta.className)}>
            {meta.emoji} {meta.label}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {application.type ? (
            <Badge variant="outline" className="font-normal">
              {appTypeMeta(application.type).label}
            </Badge>
          ) : null}
          <Badge variant="secondary" className={cn("border-0", priorityMeta.className)}>
            {priorityMeta.label} priority
          </Badge>
          {deadline ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <CalendarClock className="size-3.5" />
              Due {deadline}
            </span>
          ) : null}
          {followUp ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Bell className="size-3.5" />
              Follow up {followUp}
            </span>
          ) : null}
        </div>

        {application.referralContact || application.resumeVersion ? (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {application.referralContact ? (
              <span className="inline-flex items-center gap-1">
                <UserRound className="size-3.5" />
                {application.referralContact}
              </span>
            ) : null}
            {application.resumeVersion ? (
              <span>Resume: {application.resumeVersion}</span>
            ) : null}
          </div>
        ) : null}

        {application.notes ? (
          <p className="text-sm text-muted-foreground">{application.notes}</p>
        ) : null}

        <div className="flex items-center gap-2">
          <Select
            value={application.status}
            onValueChange={(v) =>
              updateApplication(application.id, { status: v as ApplicationStatus })
            }
          >
            <SelectTrigger className="h-9 flex-1 text-sm" aria-label="Change status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APPLICATION_STATUSES.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.emoji} {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {application.link ? (
            <Button variant="outline" size="icon" className="size-9" asChild>
              <a
                href={application.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${application.company} link`}
              >
                <ExternalLink className="size-4" />
              </a>
            </Button>
          ) : null}

          <Button
            variant="outline"
            size="icon"
            className="size-9"
            aria-label={`Edit ${application.company} application`}
            onClick={() => onEdit(application)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-9 text-muted-foreground hover:text-destructive"
            aria-label={`Delete ${application.company} application`}
            onClick={() => removeApplication(application.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
