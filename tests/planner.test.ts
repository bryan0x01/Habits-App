import { describe, expect, it } from "vitest";

import {
  buildRescuePlan,
  parseBrainDump,
  prioritizeFlexTasks,
  selectFlexTasksFor,
} from "@/lib/planner";
import type { FlexTask } from "@/lib/types";

function task(overrides: Partial<FlexTask> & Pick<FlexTask, "id" | "title">): FlexTask {
  return {
    date: "2026-07-10",
    durationMinutes: 30,
    minimumMinutes: 10,
    importance: "medium",
    effort: "medium",
    category: "reset",
    tinyStart: "Start.",
    done: false,
    createdAt: "2026-07-10T12:00:00.000Z",
    ...overrides,
  };
}

describe("local planner", () => {
  it("turns a multiline brain dump into transparent task estimates", () => {
    const drafts = parseBrainDump(
      "Study calculus today for 1.5 hours\nEmail Ana\nOptional laundry",
    );

    expect(drafts).toHaveLength(3);
    expect(drafts[0]).toMatchObject({
      category: "study",
      durationMinutes: 90,
      minimumMinutes: 10,
      importance: "high",
      effort: "deep",
    });
    expect(drafts[1]).toMatchObject({ category: "work", durationMinutes: 20 });
    expect(drafts[2]).toMatchObject({ category: "chores", importance: "low" });
  });

  it("keeps a leading duration when it is not a numbered-list marker", () => {
    const [draft] = parseBrainDump("30 min study review");
    expect(draft).toMatchObject({ durationMinutes: 30, category: "study" });
  });

  it("keeps high-importance work first and fits effort to capacity", () => {
    const tasks = [
      task({ id: "deep", title: "Deep", effort: "deep" }),
      task({ id: "light", title: "Light", effort: "light" }),
      task({ id: "urgent", title: "Urgent", effort: "light", importance: "high" }),
    ];

    expect(prioritizeFlexTasks(tasks, "high").map((item) => item.id)).toEqual([
      "urgent",
      "deep",
      "light",
    ]);
    expect(prioritizeFlexTasks(tasks, "low").map((item) => item.id)).toEqual([
      "urgent",
      "light",
      "deep",
    ]);
  });

  it("keeps, shrinks, and moves tasks within a real time budget", () => {
    const tasks = [
      task({ id: "one", title: "One", importance: "high", durationMinutes: 20 }),
      task({ id: "two", title: "Two", durationMinutes: 30, minimumMinutes: 10 }),
      task({ id: "three", title: "Three", durationMinutes: 20, minimumMinutes: 10 }),
    ];

    expect(buildRescuePlan(tasks, 35, "medium").map(({ action }) => action)).toEqual([
      "keep",
      "shrink",
      "move",
    ]);
    expect(buildRescuePlan(tasks, 120, "chaos").map(({ action }) => action)).toEqual([
      "keep",
      "move",
      "move",
    ]);
  });

  it("carries unfinished loose ends forward and hides future or finished ones", () => {
    const tasks = [
      task({ id: "today", title: "Today" }),
      task({ id: "done-today", title: "Done today", done: true }),
      task({ id: "carried", title: "From yesterday", date: "2026-07-09" }),
      task({ id: "old-done", title: "Finished yesterday", date: "2026-07-09", done: true }),
      task({ id: "future", title: "Moved to tomorrow", date: "2026-07-11" }),
    ];

    expect(selectFlexTasksFor(tasks, "2026-07-10").map((item) => item.id)).toEqual([
      "today",
      "done-today",
      "carried",
    ]);
  });
});
