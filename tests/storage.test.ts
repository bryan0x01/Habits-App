import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  SCHEMA_VERSION,
  STORAGE_KEYS,
  importSnapshotJSON,
  isDayFlowSnapshot,
  loadItem,
  migrateIfNeeded,
  saveItem,
} from "@/lib/storage";
import { emptySnapshot } from "./fixtures";

class MemoryStorage {
  private data = new Map<string, string>();

  get length() {
    return this.data.size;
  }

  clear() {
    this.data.clear();
  }

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.data.delete(key);
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

describe("storage", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: new MemoryStorage() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("round-trips typed values and falls back on malformed JSON", () => {
    saveItem(STORAGE_KEYS.priorities, [{ id: "one" }]);
    expect(loadItem(STORAGE_KEYS.priorities, [])).toEqual([{ id: "one" }]);

    window.localStorage.setItem(STORAGE_KEYS.priorities, "not-json");
    expect(loadItem(STORAGE_KEYS.priorities, [])).toEqual([]);
  });

  it("validates a complete snapshot, including nested records", () => {
    const snapshot = emptySnapshot();
    expect(isDayFlowSnapshot(snapshot)).toBe(true);
    expect(isDayFlowSnapshot({})).toBe(false);
    expect(isDayFlowSnapshot({ ...snapshot, version: 1 })).toBe(false);
    expect(
      isDayFlowSnapshot({
        ...snapshot,
        routines: [{ ...snapshot.routines[0], blocks: [{ id: "broken" }] }],
      }),
    ).toBe(false);
  });

  it("rejects malformed backups without changing existing data", () => {
    saveItem(STORAGE_KEYS.settings, { activeRoutineId: "keep-me" });
    expect(importSnapshotJSON("{}")) .toBe(false);
    expect(importSnapshotJSON("not json")).toBe(false);
    expect(loadItem<{ activeRoutineId: string } | null>(STORAGE_KEYS.settings, null)).toEqual({
      activeRoutineId: "keep-me",
    });
  });

  it("imports a valid snapshot and records the current schema", () => {
    const snapshot = emptySnapshot();
    snapshot.settings.energyMode = "low";
    expect(importSnapshotJSON(JSON.stringify(snapshot))).toBe(true);
    expect(loadItem(STORAGE_KEYS.settings, snapshot.settings)).toEqual(snapshot.settings);
    expect(loadItem(STORAGE_KEYS.schema, 0)).toBe(SCHEMA_VERSION);
  });

  it("reseeds shape-sensitive data while preserving stable user data", () => {
    saveItem(STORAGE_KEYS.schema, SCHEMA_VERSION - 1);
    saveItem(STORAGE_KEYS.routines, [{ id: "old" }]);
    saveItem(STORAGE_KEYS.habits, [{ id: "old" }]);
    saveItem(STORAGE_KEYS.habitLogs, [{ id: "old" }]);
    saveItem(STORAGE_KEYS.applications, [{ id: "preserved" }]);

    migrateIfNeeded();

    expect(loadItem(STORAGE_KEYS.routines, null)).toBeNull();
    expect(loadItem(STORAGE_KEYS.habits, null)).toBeNull();
    expect(loadItem(STORAGE_KEYS.habitLogs, null)).toBeNull();
    expect(loadItem(STORAGE_KEYS.applications, [])).toEqual([{ id: "preserved" }]);
    expect(loadItem(STORAGE_KEYS.schema, 0)).toBe(SCHEMA_VERSION);
  });
});
