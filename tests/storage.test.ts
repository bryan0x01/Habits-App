import { describe, expect, it } from "vitest";

import {
  isDayFlowSnapshot,
  parseSnapshotJSON,
  serializeSnapshot,
} from "@/lib/storage";
import { emptySnapshot } from "./fixtures";

describe("snapshot boundary", () => {
  it("round-trips a complete Supabase snapshot", () => {
    const snapshot = emptySnapshot();
    snapshot.settings.theme = "dark";
    snapshot.settings.interfaceColor = "teal";

    expect(parseSnapshotJSON(serializeSnapshot(snapshot))).toEqual(snapshot);
  });

  it("rejects malformed JSON and incomplete nested records", () => {
    const snapshot = emptySnapshot();
    expect(parseSnapshotJSON("not json")).toBeNull();
    expect(parseSnapshotJSON("{}")).toBeNull();
    expect(
      isDayFlowSnapshot({
        ...snapshot,
        routines: [{ ...snapshot.routines[0], blocks: [{ id: "broken" }] }],
      }),
    ).toBe(false);
  });

  it("validates support, appearance, vacation, and flexible-task fields", () => {
    const snapshot = emptySnapshot();
    snapshot.settings.defaultSupportNeed = "start";
    snapshot.settings.vacationMode = true;
    snapshot.settings.routineBeforeVacationId = "routine-test";
    snapshot.settings.theme = "system";
    snapshot.settings.interfaceColor = "rose";
    snapshot.energyLogs = [
      {
        id: "energy-1",
        date: "2026-07-10",
        mode: "medium",
        supportNeed: "switch",
        createdAt: "2026-07-10T12:00:00.000Z",
      },
    ];
    snapshot.flexTasks = [
      {
        id: "task-1",
        date: "2026-07-10",
        title: "Write one page",
        durationMinutes: 45,
        minimumMinutes: 10,
        importance: "high",
        effort: "deep",
        category: "study",
        tinyStart: "Open the document.",
        done: false,
        createdAt: "2026-07-10T12:00:00.000Z",
      },
    ];

    expect(isDayFlowSnapshot(snapshot)).toBe(true);
    expect(isDayFlowSnapshot({ ...snapshot, settings: { ...snapshot.settings, theme: "sepia" } })).toBe(false);
    expect(isDayFlowSnapshot({ ...snapshot, settings: { ...snapshot.settings, interfaceColor: "neon" } })).toBe(false);
    expect(isDayFlowSnapshot({ ...snapshot, flexTasks: [{ ...snapshot.flexTasks[0], minimumMinutes: 60 }] })).toBe(false);
  });

  it("accepts older snapshots that predate synced appearance", () => {
    const snapshot = emptySnapshot();
    delete snapshot.settings.theme;
    delete snapshot.settings.interfaceColor;
    expect(isDayFlowSnapshot(snapshot)).toBe(true);
  });
});
