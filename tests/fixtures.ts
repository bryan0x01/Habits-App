import type {
  Application,
  BlockLog,
  DayFlowSnapshot,
  Habit,
  HabitLog,
  Routine,
  RoutineBlock,
} from "@/lib/types";

export function block(
  id: string,
  start: string,
  end: string,
  importance: RoutineBlock["importance"] = "high",
  overrides: Partial<RoutineBlock> = {},
): RoutineBlock {
  return {
    id,
    day: 1,
    title: id,
    start,
    end,
    category: "work",
    importance,
    ...overrides,
  };
}

export function routine(blocks: RoutineBlock[]): Routine {
  return {
    id: "routine-test",
    name: "Test week",
    description: "Fixture",
    emoji: "🧪",
    blocks,
  };
}

export function blockLog(
  blockId: string,
  date: string,
  status: BlockLog["status"] = "done",
): BlockLog {
  return { id: `log-${blockId}-${date}`, blockId, date, status, createdAt: `${date}T12:00:00Z` };
}

export function habit(id: string, overrides: Partial<Habit> = {}): Habit {
  return {
    id,
    name: id,
    emoji: "✅",
    cadence: "daily",
    category: "home",
    ...overrides,
  };
}

export function habitLog(
  habitId: string,
  date: string,
  status: HabitLog["status"] = "done",
): HabitLog {
  return { id: `log-${habitId}-${date}`, habitId, date, status, createdAt: `${date}T12:00:00Z` };
}

export function application(overrides: Partial<Application> = {}): Application {
  return {
    id: "app-1",
    company: "Example Co",
    role: "Engineer",
    status: "applied",
    createdAt: "2026-07-06T12:00:00Z",
    updatedAt: "2026-07-06T12:00:00Z",
    ...overrides,
  };
}

export function emptySnapshot(): DayFlowSnapshot {
  return {
    version: 2,
    exportedAt: "2026-07-09T12:00:00.000Z",
    settings: {
      activeRoutineId: "routine-test",
      energyMode: "medium",
      minimumDay: false,
      onboarded: true,
    },
    routines: [routine([])],
    habits: [],
    habitLogs: [],
    blockLogs: [],
    priorities: [],
    applications: [],
    energyLogs: [],
    frictionLogs: [],
    weekPlans: [],
  };
}
