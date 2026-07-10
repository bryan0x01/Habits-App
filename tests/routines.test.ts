import { describe, expect, it } from "vitest";

import { buildBlankRoutine, buildRoutineCopy } from "@/lib/routines";
import { block, routine } from "./fixtures";

describe("routine builders", () => {
  it("trims blank-routine input and supplies supportive defaults", () => {
    expect(buildBlankRoutine({ name: "  Exam week  " }, "routine-new")).toEqual({
      id: "routine-new",
      name: "Exam week",
      emoji: "🌱",
      description: "A flexible routine you can shape one block at a time.",
      seeded: false,
      blocks: [],
    });
  });

  it("deep-copies blocks with stable source data and fresh ids", () => {
    const source = routine([
      block("one", "09:00", "10:00"),
      block("two", "10:00", "11:00"),
    ]);
    const ids = ["copy-one", "copy-two"];
    const copy = buildRoutineCopy(source, "routine-copy", () => ids.shift() as string);

    expect(copy.id).toBe("routine-copy");
    expect(copy.name).toBe("Test week (copy)");
    expect(copy.seeded).toBe(false);
    expect(copy.blocks.map((item) => item.id)).toEqual(["copy-one", "copy-two"]);
    expect(source.blocks.map((item) => item.id)).toEqual(["one", "two"]);
  });
});
