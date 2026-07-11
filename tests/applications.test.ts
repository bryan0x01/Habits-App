import { describe, expect, it } from "vitest";

import {
  applicationsSentThisWeek,
  applyApplicationPatch,
  followUpsDueThisWeek,
  isActive,
  isPriorityCompany,
  priorityInPipeline,
} from "@/lib/applications";
import { application } from "./fixtures";

const thursday = new Date(2026, 6, 9, 12);

describe("application helpers", () => {
  it("matches priority companies and locations case-insensitively", () => {
    expect(isPriorityCompany(application({ company: "Capital One" }))).toBe(true);
    expect(isPriorityCompany(application({ company: "Startup", location: "Charlotte, NC" }))).toBe(true);
    expect(isPriorityCompany(application({ company: "Startup", location: "Austin" }))).toBe(false);
  });

  it("counts submissions only inside the Monday-Sunday week", () => {
    const apps = [
      application({ id: "monday", appliedOn: "2026-07-06" }),
      application({ id: "sunday", appliedOn: "2026-07-12" }),
      application({ id: "prior", appliedOn: "2026-07-05" }),
      application({ id: "none", appliedOn: undefined }),
    ];
    expect(applicationsSentThisWeek(apps, thursday)).toBe(2);
  });

  it("returns overdue and this-week follow-ups in date order", () => {
    const apps = [
      application({ id: "week", followUpDate: "2026-07-10" }),
      application({ id: "overdue", followUpDate: "2026-07-01" }),
      application({ id: "future", followUpDate: "2026-07-20" }),
      application({ id: "closed", status: "rejected", followUpDate: "2026-07-07" }),
    ];
    expect(followUpsDueThisWeek(apps, thursday).map((app) => app.id)).toEqual([
      "overdue",
      "week",
    ]);
  });

  it("excludes terminal statuses from the active priority pipeline", () => {
    expect(isActive(application({ status: "offer" }))).toBe(false);
    expect(
      priorityInPipeline([
        application({ id: "active", company: "CEMEX", status: "interview" }),
        application({ id: "offer", company: "CEMEX", status: "offer" }),
        application({ id: "other", company: "Other" }),
      ]),
    ).toBe(1);
  });

  it("records the first submitted date when a saved role moves forward", () => {
    const saved = application({ status: "saved", appliedOn: undefined });
    const submitted = applyApplicationPatch(
      saved,
      { status: "applied" },
      new Date(2026, 6, 10, 9, 30),
    );

    expect(submitted.appliedOn).toBe("2026-07-10");
    expect(submitted.updatedAt).toBe(new Date(2026, 6, 10, 9, 30).toISOString());
  });

  it("keeps the original submission date during later status changes", () => {
    const interview = applyApplicationPatch(
      application({ status: "applied", appliedOn: "2026-07-01" }),
      { status: "interview" },
      new Date(2026, 6, 10, 9, 30),
    );
    expect(interview.appliedOn).toBe("2026-07-01");
  });
});
