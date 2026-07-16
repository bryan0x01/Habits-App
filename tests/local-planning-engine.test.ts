import { describe, expect, it } from "vitest";

import {
  draftRoutineLocally,
  learnPlanningProfile,
  organizeBrainDumpLocally,
  type PlanningProfile,
} from "@/lib/local-planning-engine";
import type { FlexTask, Routine } from "@/lib/types";

const EMPTY_PROFILE: PlanningProfile = {
  sampleSize: 0,
  categorySignals: {},
  preferredStartByCategory: {},
  taskMinutesByCategory: {},
};

describe("private planning engine", () => {
  it("turns a plain-English week into a reviewed routine draft", () => {
    const result = draftRoutineLocally(
      "I work Monday to Friday from 9 to 5. Gym on Monday, Wednesday, and Friday after work. Add a short evening reset and a calm Sunday planning block.",
      EMPTY_PROFILE,
    );

    expect(result.draft).not.toBeNull();
    const blocks = result.draft?.blocks ?? [];
    const work = blocks.filter((block) => block.category === "work");
    const gym = blocks.filter((block) => block.category === "gym");
    const planning = blocks.find((block) => block.title === "Plan the week");

    expect(work).toHaveLength(5);
    expect(work[0]).toMatchObject({ start: "09:00", end: "17:00" });
    expect(gym.map((block) => block.day)).toEqual([1, 3, 5]);
    expect(gym[0]).toMatchObject({ start: "17:30", end: "18:15" });
    expect(planning).toMatchObject({ day: 0, start: "18:00" });
  });

  it("understands common Spanish day and time phrases", () => {
    const result = draftRoutineLocally(
      "Trabajo de lunes a viernes de 9 a 5; gimnasio lunes y miércoles después del trabajo; planear el domingo a las 6 pm.",
      EMPTY_PROFILE,
    );
    const blocks = result.draft?.blocks ?? [];

    expect(blocks.filter((block) => block.category === "work")).toHaveLength(5);
    expect(blocks.filter((block) => block.category === "gym").map((block) => block.day)).toEqual([1, 3]);
    expect(blocks.find((block) => block.title === "Plan the week")).toMatchObject({ day: 0, start: "18:00" });
  });

  it("learns successful category times and task sizes from recent check-ins", () => {
    const routine: Routine = {
      id: "routine",
      name: "Week",
      emoji: "🌱",
      description: "Test",
      blocks: [
        { id: "gym", day: 1, title: "Gym", start: "18:00", end: "18:45", category: "gym", importance: "medium" },
      ],
    };
    const tasks = [30, 35, 40].map((durationMinutes, index): FlexTask => ({
      id: `task-${index}`,
      date: `2026-07-${10 + index}`,
      title: "Move",
      durationMinutes,
      minimumMinutes: 5,
      importance: "medium",
      effort: "medium",
      category: "gym",
      tinyStart: "Shoes on.",
      done: true,
      createdAt: "2026-07-10T12:00:00.000Z",
    }));
    const profile = learnPlanningProfile({
      routines: [routine],
      blockLogs: [10, 11, 12].map((day) => ({
        id: `log-${day}`,
        blockId: "gym",
        date: `2026-07-${day}`,
        status: "done" as const,
        createdAt: `2026-07-${day}T18:45:00.000Z`,
      })),
      flexTasks: tasks,
      now: new Date("2026-07-16T12:00:00.000Z"),
    });

    expect(profile.sampleSize).toBe(3);
    expect(profile.preferredStartByCategory.gym).toBe("18:00");
    expect(profile.taskMinutesByCategory.gym).toBe(35);
    expect(profile.categorySignals.gym?.completionRate).toBe(0.8);
  });

  it("keeps very-low-energy task versions small and sorts important work first", () => {
    const drafts = organizeBrainDumpLocally({
      input: "Optional laundry\nStudy chapter 4 today\nGym",
      energyMode: "chaos",
      supportNeed: "overwhelmed",
      profile: { ...EMPTY_PROFILE, taskMinutesByCategory: { gym: 35 } },
    });

    expect(drafts[0].title).toContain("Study chapter 4 today");
    expect(drafts.every((draft) => draft.minimumMinutes <= 5)).toBe(true);
    expect(drafts.find((draft) => draft.category === "gym")?.durationMinutes).toBe(40);
  });

  it("asks for useful details instead of inventing unrelated blocks", () => {
    expect(draftRoutineLocally("Make my life perfect", EMPTY_PROFILE)).toMatchObject({
      draft: null,
    });
  });
});
