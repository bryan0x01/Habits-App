import { endOfWeek, isWithinInterval, parseISO, startOfWeek } from "date-fns";

import { PRIORITY_COMPANIES, PRIORITY_LOCATIONS } from "@/lib/constants";
import { dateKey } from "@/lib/time";
import type { Application } from "@/lib/types";

const WEEK_OPTS = { weekStartsOn: 1 as const };

/** A company/location the user is actively targeting. */
export function isPriorityCompany(app: Application): boolean {
  const company = app.company.toLowerCase();
  const location = (app.location ?? "").toLowerCase();
  return (
    PRIORITY_COMPANIES.some((c) => company.includes(c.toLowerCase())) ||
    PRIORITY_LOCATIONS.some((l) => location.includes(l.toLowerCase()))
  );
}

/** Terminal states drop out of the "in flight" pipeline. */
export function isActive(app: Application): boolean {
  return app.status !== "rejected" && app.status !== "offer";
}

function inThisWeek(dateStr: string | undefined, now: Date): boolean {
  if (!dateStr) return false;
  try {
    return isWithinInterval(parseISO(dateStr), {
      start: startOfWeek(now, WEEK_OPTS),
      end: endOfWeek(now, WEEK_OPTS),
    });
  } catch {
    return false;
  }
}

/** Applications actually submitted within the current week. */
export function applicationsSentThisWeek(apps: Application[], now: Date): number {
  return apps.filter((a) => inThisWeek(a.appliedOn, now)).length;
}

/**
 * Follow-ups that are due now or earlier this week — overdue included, so
 * nothing quietly slips. Active applications only.
 */
export function followUpsDueThisWeek(apps: Application[], now: Date): Application[] {
  const cutoff = endOfWeek(now, WEEK_OPTS);
  return apps
    .filter((a) => isActive(a) && a.followUpDate)
    .filter((a) => {
      try {
        return parseISO(a.followUpDate as string) <= cutoff;
      } catch {
        return false;
      }
    })
    .sort((a, b) => (a.followUpDate ?? "").localeCompare(b.followUpDate ?? ""));
}

export function priorityInPipeline(apps: Application[]): number {
  return apps.filter((a) => isActive(a) && isPriorityCompany(a)).length;
}

/** Apply an edit while preserving recruiting history and timestamps. */
export function applyApplicationPatch(
  application: Application,
  patch: Partial<Application>,
  now = new Date(),
): Application {
  const firstSubmission =
    application.status === "saved" &&
    patch.status !== undefined &&
    patch.status !== "saved" &&
    !application.appliedOn;

  return {
    ...application,
    ...patch,
    appliedOn: patch.appliedOn ?? (firstSubmission ? dateKey(now) : application.appliedOn),
    updatedAt: now.toISOString(),
  };
}
