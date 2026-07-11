import { describe, expect, it } from "vitest";

import {
  LIFE_ROUTINE_TEMPLATES,
  VACATION_ROUTINE_ID,
  blocksForDay,
  lifeRoutineTemplate,
} from "@/lib/data/routines";

describe("life routine templates", () => {
  it("offers the five researched contexts with every day covered", () => {
    expect(LIFE_ROUTINE_TEMPLATES.map((routine) => routine.id)).toEqual([
      "student-performance",
      "frontline-shift",
      "corporate-focus",
      "owner-operator",
      VACATION_ROUTINE_ID,
    ]);

    for (const routine of LIFE_ROUTINE_TEMPLATES) {
      for (const day of [0, 1, 2, 3, 4, 5, 6] as const) {
        expect(blocksForDay(routine, day).length).toBeGreaterThan(0);
      }
    }
  });

  it("returns independent editable copies", () => {
    const first = lifeRoutineTemplate("student-performance");
    const second = lifeRoutineTemplate("student-performance");
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    first!.name = "Changed";
    expect(second!.name).toBe("Student");
  });
});
