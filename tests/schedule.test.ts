import { describe, expect, it } from "vitest";

import { computeToday } from "@/lib/schedule";
import { block, blockLog, routine } from "./fixtures";

const monday = (hour: number, minute = 0) => new Date(2026, 6, 6, hour, minute);
const plan = routine([
  block("deep-work", "09:00", "10:00", "high"),
  block("admin", "10:00", "11:00", "low"),
  block("class", "11:00", "12:00", "high"),
]);

describe("computeToday", () => {
  it("identifies before, current, next, and after phases", () => {
    const before = computeToday(plan, monday(8), [], false);
    expect(before.phase).toBe("before");
    expect(before.focus?.id).toBe("deep-work");
    expect(before.next?.id).toBe("deep-work");

    const during = computeToday(plan, monday(9, 30), [], false);
    expect(during.phase).toBe("during");
    expect(during.current?.id).toBe("deep-work");
    expect(during.focus?.id).toBe("deep-work");
    expect(during.next?.id).toBe("admin");

    const after = computeToday(plan, monday(13), [], false);
    expect(after.phase).toBe("after");
    expect(after.current).toBeNull();
    expect(after.next).toBeNull();
  });

  it("uses only logs from the requested date and reports progress", () => {
    const logs = [
      blockLog("deep-work", "2026-07-06"),
      blockLog("admin", "2026-07-05"),
      blockLog("class", "2026-07-06", "skipped"),
    ];
    const result = computeToday(plan, monday(11, 30), logs, false);

    expect(result.doneCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(result.requiredCount).toBe(3);
    expect(result.progressPct).toBe(33);
    expect(result.allDone).toBe(false);
  });

  it("recovers the most recent untouched important block", () => {
    const result = computeToday(plan, monday(11, 30), [], false);
    expect(result.missed?.id).toBe("deep-work");

    const withAction = computeToday(
      plan,
      monday(11, 30),
      [blockLog("deep-work", "2026-07-06", "skipped")],
      false,
    );
    expect(withAction.missed).toBeNull();
  });

  it("keeps optional blocks visible but never makes them the minimum-day focus", () => {
    const result = computeToday(plan, monday(10, 30), [], true);
    expect(result.current?.id).toBe("admin");
    expect(result.current?.optional).toBe(true);
    expect(result.focus?.id).toBe("class");
    expect(result.requiredCount).toBe(2);

    const noRequiredAhead = computeToday(
      routine([
        block("must", "09:00", "10:00", "high"),
        block("optional", "10:00", "11:00", "low"),
      ]),
      monday(10, 30),
      [],
      true,
    );
    expect(noRequiredAhead.focus).toBeNull();
  });

  it("handles a day with no blocks", () => {
    const result = computeToday(routine([]), monday(12), [], false);
    expect(result.phase).toBe("empty");
    expect(result.requiredCount).toBe(0);
    expect(result.progressPct).toBe(0);
    expect(result.allDone).toBe(false);
  });
});
