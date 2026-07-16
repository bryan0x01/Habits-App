"use client";

import * as React from "react";

import { DEFAULT_HABITS } from "@/lib/data/habits";
import {
  DEFAULT_ROUTINE_ID,
  VACATION_ROUTINE_ID,
  lifeRoutineTemplate,
  seedRoutines,
} from "@/lib/data/routines";
import {
  isDayFlowSnapshot,
  parseSnapshotJSON,
  serializeSnapshot,
} from "@/lib/storage";
import { SNAPSHOT_VERSION } from "@/lib/storage";
import { dateKey } from "@/lib/time";
import { applyApplicationPatch } from "@/lib/applications";
import {
  buildBlankRoutine,
  buildRoutineCopy,
  type NewRoutineInput,
} from "@/lib/routines";
import type {
  Application,
  ApplicationStatus,
  ApplicationType,
  BlockLog,
  DayFlowSnapshot,
  EnergyLog,
  EnergyMode,
  FrictionLog,
  FrictionReason,
  FlexTask,
  FlexTaskDraft,
  Habit,
  HabitCadence,
  HabitCategory,
  HabitLog,
  InterfaceColor,
  Importance,
  LogStatus,
  Priority,
  Routine,
  RoutineBlock,
  SupportNeed,
  ThemeMode,
  UserSettings,
  WeekPlan,
} from "@/lib/types";
import { uid } from "@/lib/utils";

const DEFAULT_SETTINGS: UserSettings = {
  activeRoutineId: DEFAULT_ROUTINE_ID,
  energyMode: "medium",
  minimumDay: false,
  onboarded: false,
  medicationTracking: false,
  defaultSupportNeed: "varies",
  theme: "system",
  interfaceColor: "iris",
};

const MAX_PRIORITIES = 3;

interface NewApplicationInput {
  company: string;
  role: string;
  status?: ApplicationStatus;
  type?: ApplicationType;
  priority?: Importance;
  location?: string;
  link?: string;
  deadline?: string;
  resumeVersion?: string;
  referralContact?: string;
  followUpDate?: string;
  nextAction?: string;
  notes?: string;
  appliedOn?: string;
}

interface NewHabitInput {
  name: string;
  emoji?: string;
  cadence?: HabitCadence;
  category?: HabitCategory;
  minimum?: boolean;
  tinyStart?: string;
}

export interface BlockInput {
  title: string;
  category: RoutineBlock["category"];
  day: RoutineBlock["day"];
  start: string;
  end: string;
  importance: Importance;
  tinyStart?: string;
  backup?: string;
  notificationMinutesBefore?: number;
  notes?: string;
}

interface SkipInput {
  taskType: "block" | "habit";
  refId: string;
  title: string;
  reason: FrictionReason;
  note?: string;
  date?: string;
}

export interface AppStore {
  hydrated: boolean;

  settings: UserSettings;
  routines: Routine[];
  routine: Routine;
  habits: Habit[];
  habitLogs: HabitLog[];
  blockLogs: BlockLog[];
  priorities: Priority[];
  applications: Application[];
  energyLogs: EnergyLog[];
  frictionLogs: FrictionLog[];
  flexTasks: FlexTask[];

  // Settings
  setActiveRoutine: (id: string) => void;
  setEnergyMode: (mode: EnergyMode) => void;
  setMinimumDay: (on: boolean) => void;
  setMedicationTracking: (on: boolean) => void;
  setThemeMode: (theme: ThemeMode) => void;
  setInterfaceColor: (color: InterfaceColor) => void;
  setDefaultSupportNeed: (need: SupportNeed) => void;
  supportNeed: (date?: string) => SupportNeed;
  setSupportNeed: (need: SupportNeed, date?: string) => void;
  medicationStatus: (date?: string) => EnergyLog["medication"] | null;
  setMedicationStatus: (status: EnergyLog["medication"] | null, date?: string) => void;
  completeOnboarding: () => void;
  restartOnboarding: () => void;
  setVacationMode: (on: boolean) => void;

  // Routines
  createRoutine: (input: NewRoutineInput) => string;
  duplicateRoutine: (id: string) => string | null;
  renameRoutine: (id: string, name: string) => void;
  deleteRoutine: (id: string) => void;
  addBlock: (routineId: string, input: BlockInput) => void;
  updateBlock: (routineId: string, blockId: string, patch: Partial<BlockInput>) => void;
  deleteBlock: (routineId: string, blockId: string) => void;
  addRoutineTemplate: (templateId: string) => string | null;

  // Flexible tasks
  addFlexTasks: (drafts: FlexTaskDraft[], date?: string) => void;
  setFlexTaskDone: (id: string, done: boolean) => void;
  updateFlexTask: (id: string, patch: Partial<FlexTask>) => void;
  removeFlexTask: (id: string) => void;

  // Habits
  addHabit: (input: NewHabitInput) => void;
  removeHabit: (id: string) => void;
  habitStatus: (habitId: string, date?: string) => LogStatus | null;
  setHabitStatus: (habitId: string, status: LogStatus | null, date?: string) => void;

  // Routine blocks (today)
  blockStatus: (blockId: string, date?: string) => LogStatus | null;
  setBlockStatus: (blockId: string, status: LogStatus | null, date?: string) => void;

  // Priorities
  addPriority: (text: string, date?: string) => void;
  togglePriority: (id: string) => void;
  updatePriority: (id: string, text: string) => void;
  removePriority: (id: string) => void;

  // Skips + friction
  skipTask: (input: SkipInput) => void;

  // Applications
  addApplication: (input: NewApplicationInput) => void;
  updateApplication: (id: string, patch: Partial<Application>) => void;
  removeApplication: (id: string) => void;

  // Weekly plan
  weekPlans: WeekPlan[];
  getWeekPlan: (weekKey: string) => WeekPlan;
  setWeekPlan: (weekKey: string, field: keyof Omit<WeekPlan, "weekKey">, value: string) => void;

  // Data management
  snapshot: DayFlowSnapshot;
  exportData: () => string;
  importData: (json: string) => boolean;
  importSnapshot: (snapshot: DayFlowSnapshot) => boolean;
  resetData: () => void;
}

const StoreContext = React.createContext<AppStore | null>(null);

export function useStore(): AppStore {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = React.useState(false);
  const [settings, setSettings] = React.useState<UserSettings>(DEFAULT_SETTINGS);
  const [routines, setRoutines] = React.useState<Routine[]>(seedRoutines);
  const [habits, setHabits] = React.useState<Habit[]>(DEFAULT_HABITS);
  const [habitLogs, setHabitLogs] = React.useState<HabitLog[]>([]);
  const [blockLogs, setBlockLogs] = React.useState<BlockLog[]>([]);
  const [priorities, setPriorities] = React.useState<Priority[]>([]);
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [energyLogs, setEnergyLogs] = React.useState<EnergyLog[]>([]);
  const [frictionLogs, setFrictionLogs] = React.useState<FrictionLog[]>([]);
  const [weekPlans, setWeekPlans] = React.useState<WeekPlan[]>([]);
  const [flexTasks, setFlexTasks] = React.useState<FlexTask[]>([]);

  React.useEffect(() => {
    // Browser-only effects and Supabase hydration begin after the server pass.
    setHydrated(true);
  }, []);

  const nowIso = () => new Date().toISOString();

  /* ---- settings ---- */
  const setActiveRoutine = React.useCallback((id: string) => {
    setSettings((s) => ({
      ...s,
      activeRoutineId: id,
      ...(s.vacationMode && id !== VACATION_ROUTINE_ID ? { vacationMode: false } : {}),
    }));
  }, []);

  const setEnergyMode = React.useCallback((mode: EnergyMode) => {
    setSettings((s) => ({ ...s, energyMode: mode }));
    const key = dateKey();
    setEnergyLogs((logs) => {
      const existing = logs.find((log) => log.date === key);
      return [
        ...logs.filter((log) => log.date !== key),
        {
          id: existing?.id ?? uid("energy"),
          date: key,
          mode,
          medication: existing?.medication,
          supportNeed: existing?.supportNeed,
          createdAt: existing?.createdAt ?? nowIso(),
        },
      ];
    });
  }, []);

  const setMinimumDay = React.useCallback((on: boolean) => {
    setSettings((s) => ({ ...s, minimumDay: on }));
  }, []);

  const setMedicationTracking = React.useCallback((on: boolean) => {
    setSettings((current) => ({ ...current, medicationTracking: on }));
  }, []);

  const setThemeMode = React.useCallback((theme: ThemeMode) => {
    setSettings((current) => ({ ...current, theme }));
  }, []);

  const setInterfaceColor = React.useCallback((interfaceColor: InterfaceColor) => {
    setSettings((current) => ({ ...current, interfaceColor }));
  }, []);

  const setDefaultSupportNeed = React.useCallback((need: SupportNeed) => {
    setSettings((current) => ({ ...current, defaultSupportNeed: need }));
  }, []);

  const supportNeed = React.useCallback((date = dateKey()): SupportNeed => {
    return (
      energyLogs.find((log) => log.date === date)?.supportNeed ??
      settings.defaultSupportNeed ??
      "varies"
    );
  }, [energyLogs, settings.defaultSupportNeed]);

  const setSupportNeed = React.useCallback((need: SupportNeed, date = dateKey()) => {
    setEnergyLogs((logs) => {
      const existing = logs.find((log) => log.date === date);
      return [
        ...logs.filter((log) => log.date !== date),
        {
          id: existing?.id ?? uid("energy"),
          date,
          mode: existing?.mode ?? settings.energyMode,
          medication: existing?.medication,
          supportNeed: need,
          createdAt: existing?.createdAt ?? nowIso(),
        },
      ];
    });
  }, [settings.energyMode]);

  const medicationStatus = React.useCallback((date = dateKey()) => {
    return energyLogs.find((log) => log.date === date)?.medication ?? null;
  }, [energyLogs]);

  const setMedicationStatus = React.useCallback((status: EnergyLog["medication"] | null, date = dateKey()) => {
    setEnergyLogs((logs) => {
      const existing = logs.find((log) => log.date === date);
      if (!existing && !status) return logs;
      return [
        ...logs.filter((log) => log.date !== date),
        {
          id: existing?.id ?? uid("energy"),
          date,
          mode: existing?.mode ?? settings.energyMode,
          supportNeed: existing?.supportNeed,
          ...(status ? { medication: status } : {}),
          createdAt: existing?.createdAt ?? nowIso(),
        },
      ];
    });
  }, [settings.energyMode]);

  const completeOnboarding = React.useCallback(() => {
    setSettings((s) => ({ ...s, onboarded: true }));
  }, []);

  const restartOnboarding = React.useCallback(() => {
    setSettings((s) => ({ ...s, onboarded: false }));
  }, []);

  const setVacationMode = React.useCallback((on: boolean) => {
    if (on) {
      const vacation = lifeRoutineTemplate(VACATION_ROUTINE_ID);
      if (vacation) {
        setRoutines((list) =>
          list.some((routine) => routine.id === VACATION_ROUTINE_ID)
            ? list
            : [...list, vacation],
        );
      }
      setSettings((current) => ({
        ...current,
        vacationMode: true,
        routineBeforeVacationId:
          current.activeRoutineId === VACATION_ROUTINE_ID
            ? current.routineBeforeVacationId
            : current.activeRoutineId,
        activeRoutineId: VACATION_ROUTINE_ID,
      }));
      return;
    }

    setSettings((current) => {
      const preferred = current.routineBeforeVacationId ?? DEFAULT_ROUTINE_ID;
      const restoreId = routines.some((routine) => routine.id === preferred)
        ? preferred
        : routines.find((routine) => routine.id !== VACATION_ROUTINE_ID)?.id ?? DEFAULT_ROUTINE_ID;
      return { ...current, vacationMode: false, activeRoutineId: restoreId };
    });
  }, [routines]);

  /* ---- routines ---- */
  const createRoutine = React.useCallback((input: NewRoutineInput): string => {
    const routine = buildBlankRoutine(input);
    setRoutines((list) => [...list, routine]);
    return routine.id;
  }, []);

  const duplicateRoutine = React.useCallback((id: string): string | null => {
    const source = routines.find((routine) => routine.id === id);
    if (!source) return null;
    const copy = buildRoutineCopy(source);
    setRoutines((list) => [...list, copy]);
    return copy.id;
  }, [routines]);

  const renameRoutine = React.useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setRoutines((list) => list.map((r) => (r.id === id ? { ...r, name: trimmed } : r)));
  }, []);

  const deleteRoutine = React.useCallback((id: string) => {
    setRoutines((list) => {
      if (list.length <= 1) return list; // never delete the last routine
      const remaining = list.filter((r) => r.id !== id);
      setSettings((s) => {
        if (s.activeRoutineId !== id) return s;
        return {
          ...s,
          activeRoutineId: remaining[0].id,
          ...(id === VACATION_ROUTINE_ID ? { vacationMode: false } : {}),
        };
      });
      return remaining;
    });
  }, []);

  const addBlock = React.useCallback((routineId: string, input: BlockInput) => {
    const block: RoutineBlock = { id: uid("block"), ...input };
    setRoutines((list) =>
      list.map((r) =>
        r.id === routineId ? { ...r, blocks: [...r.blocks, block] } : r,
      ),
    );
  }, []);

  const updateBlock = React.useCallback(
    (routineId: string, blockId: string, patch: Partial<BlockInput>) => {
      setRoutines((list) =>
        list.map((r) =>
          r.id === routineId
            ? {
                ...r,
                blocks: r.blocks.map((b) =>
                  b.id === blockId ? { ...b, ...patch } : b,
                ),
              }
            : r,
        ),
      );
    },
    [],
  );

  const deleteBlock = React.useCallback((routineId: string, blockId: string) => {
    setRoutines((list) =>
      list.map((r) =>
        r.id === routineId
          ? { ...r, blocks: r.blocks.filter((b) => b.id !== blockId) }
          : r,
      ),
    );
  }, []);

  const addRoutineTemplate = React.useCallback((templateId: string): string | null => {
    const template = lifeRoutineTemplate(templateId);
    if (!template) return null;
    setRoutines((list) =>
      list.some((routine) => routine.id === templateId) ? list : [...list, template],
    );
    return templateId;
  }, []);

  /* ---- flexible tasks ---- */
  const addFlexTasks = React.useCallback((drafts: FlexTaskDraft[], date = dateKey()) => {
    const createdAt = nowIso();
    setFlexTasks((list) => [
      ...list,
      ...drafts.map((draft) => ({
        ...draft,
        id: uid("task"),
        date,
        done: false,
        createdAt,
      })),
    ]);
  }, []);

  const setFlexTaskDone = React.useCallback((id: string, done: boolean) => {
    setFlexTasks((list) => list.map((task) => (task.id === id ? { ...task, done } : task)));
  }, []);

  const updateFlexTask = React.useCallback((id: string, patch: Partial<FlexTask>) => {
    setFlexTasks((list) => list.map((task) => (task.id === id ? { ...task, ...patch } : task)));
  }, []);

  const removeFlexTask = React.useCallback((id: string) => {
    setFlexTasks((list) => list.filter((task) => task.id !== id));
  }, []);

  /* ---- habits ---- */
  const addHabit = React.useCallback((input: NewHabitInput) => {
    setHabits((list) => [
      ...list,
      {
        id: uid("habit"),
        name: input.name.trim(),
        emoji: input.emoji?.trim() || input.category || "home",
        cadence: input.cadence ?? "daily",
        category: input.category ?? "home",
        minimum: input.minimum ?? false,
        tinyStart: input.tinyStart?.trim() || undefined,
        custom: true,
      },
    ]);
  }, []);

  const removeHabit = React.useCallback((id: string) => {
    setHabits((list) => list.filter((h) => h.id !== id));
    setHabitLogs((logs) => logs.filter((l) => l.habitId !== id));
  }, []);

  const habitStatus = React.useCallback(
    (habitId: string, date = dateKey()): LogStatus | null =>
      habitLogs.find((l) => l.habitId === habitId && l.date === date)?.status ?? null,
    [habitLogs],
  );

  const setHabitStatus = React.useCallback(
    (habitId: string, status: LogStatus | null, date = dateKey()) => {
      setHabitLogs((logs) => {
        const others = logs.filter((l) => !(l.habitId === habitId && l.date === date));
        if (!status) return others;
        return [...others, { id: uid("hl"), habitId, date, status, createdAt: nowIso() }];
      });
    },
    [],
  );

  /* ---- blocks (today) ---- */
  const blockStatus = React.useCallback(
    (blockId: string, date = dateKey()): LogStatus | null =>
      blockLogs.find((l) => l.blockId === blockId && l.date === date)?.status ?? null,
    [blockLogs],
  );

  const setBlockStatus = React.useCallback(
    (blockId: string, status: LogStatus | null, date = dateKey()) => {
      setBlockLogs((logs) => {
        const others = logs.filter((l) => !(l.blockId === blockId && l.date === date));
        if (!status) return others;
        return [...others, { id: uid("bl"), blockId, date, status, createdAt: nowIso() }];
      });
    },
    [],
  );

  /* ---- priorities ---- */
  const addPriority = React.useCallback((text: string, date = dateKey()) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setPriorities((list) => {
      const todays = list.filter((p) => p.date === date);
      if (todays.length >= MAX_PRIORITIES) return list;
      return [...list, { id: uid("pri"), date, text: trimmed, done: false, createdAt: nowIso() }];
    });
  }, []);

  const togglePriority = React.useCallback((id: string) => {
    setPriorities((list) => list.map((p) => (p.id === id ? { ...p, done: !p.done } : p)));
  }, []);

  const updatePriority = React.useCallback((id: string, text: string) => {
    const trimmed = text.trim();
    setPriorities((list) =>
      list.map((p) => (p.id === id ? { ...p, text: trimmed } : p)),
    );
  }, []);

  const removePriority = React.useCallback((id: string) => {
    setPriorities((list) => list.filter((p) => p.id !== id));
  }, []);

  /* ---- friction ---- */
  const skipTask = React.useCallback(
    ({ taskType, refId, title, reason, note, date = dateKey() }: SkipInput) => {
      if (taskType === "habit") setHabitStatus(refId, "skipped", date);
      else setBlockStatus(refId, "skipped", date);

      setFrictionLogs((logs) => [
        ...logs,
        {
          id: uid("fl"),
          date,
          taskTitle: title,
          taskType,
          refId,
          reason,
          note: note?.trim() || undefined,
          createdAt: nowIso(),
        },
      ]);
    },
    [setHabitStatus, setBlockStatus],
  );

  /* ---- applications ---- */
  const addApplication = React.useCallback((input: NewApplicationInput) => {
    const ts = nowIso();
    setApplications((list) => [
      {
        id: uid("app"),
        company: input.company.trim(),
        role: input.role.trim(),
        status: input.status ?? "saved",
        type: input.type,
        priority: input.priority,
        location: input.location?.trim() || undefined,
        link: input.link?.trim() || undefined,
        deadline: input.deadline || undefined,
        resumeVersion: input.resumeVersion?.trim() || undefined,
        referralContact: input.referralContact?.trim() || undefined,
        followUpDate: input.followUpDate || undefined,
        nextAction: input.nextAction?.trim() || undefined,
        notes: input.notes?.trim() || undefined,
        appliedOn:
          input.appliedOn ??
          (input.status && input.status !== "saved" ? dateKey() : undefined),
        createdAt: ts,
        updatedAt: ts,
      },
      ...list,
    ]);
  }, []);

  const updateApplication = React.useCallback((id: string, patch: Partial<Application>) => {
    setApplications((list) =>
      list.map((a) => (a.id === id ? applyApplicationPatch(a, patch) : a)),
    );
  }, []);

  const removeApplication = React.useCallback((id: string) => {
    setApplications((list) => list.filter((a) => a.id !== id));
  }, []);

  /* ---- weekly plan ---- */
  const getWeekPlan = React.useCallback(
    (weekKey: string): WeekPlan =>
      weekPlans.find((p) => p.weekKey === weekKey) ?? {
        weekKey,
        school: "",
        health: "",
        career: "",
      },
    [weekPlans],
  );

  const setWeekPlan = React.useCallback(
    (weekKey: string, field: keyof Omit<WeekPlan, "weekKey">, value: string) => {
      setWeekPlans((list) => {
        const existing = list.find((p) => p.weekKey === weekKey);
        const base: WeekPlan =
          existing ?? { weekKey, school: "", health: "", career: "" };
        const updated: WeekPlan = { ...base, [field]: value };
        return existing
          ? list.map((p) => (p.weekKey === weekKey ? updated : p))
          : [...list, updated];
      });
    },
    [],
  );

  const snapshot = React.useMemo<DayFlowSnapshot>(
    () => ({
      version: SNAPSHOT_VERSION,
      exportedAt: new Date().toISOString(),
      settings,
      routines,
      habits,
      habitLogs,
      blockLogs,
      priorities,
      applications,
      energyLogs,
      frictionLogs,
      weekPlans,
      flexTasks,
    }),
    [
      applications,
      blockLogs,
      energyLogs,
      frictionLogs,
      habitLogs,
      habits,
      priorities,
      routines,
      settings,
      weekPlans,
      flexTasks,
    ],
  );

  /* ---- data management ---- */
  const exportData = React.useCallback(() => serializeSnapshot(snapshot), [snapshot]);

  const applySnapshot = React.useCallback((nextSnapshot: DayFlowSnapshot) => {
    if (!isDayFlowSnapshot(nextSnapshot)) return false;
    setSettings({ ...DEFAULT_SETTINGS, ...nextSnapshot.settings });
    setRoutines(nextSnapshot.routines.length > 0 ? nextSnapshot.routines : seedRoutines());
    setHabits(nextSnapshot.habits);
    setHabitLogs(nextSnapshot.habitLogs);
    setBlockLogs(nextSnapshot.blockLogs);
    setPriorities(nextSnapshot.priorities);
    setApplications(nextSnapshot.applications);
    setEnergyLogs(nextSnapshot.energyLogs);
    setFrictionLogs(nextSnapshot.frictionLogs);
    setWeekPlans(nextSnapshot.weekPlans);
    setFlexTasks(nextSnapshot.flexTasks ?? []);
    return true;
  }, []);

  const importData = React.useCallback(
    (json: string) => {
      const parsed = parseSnapshotJSON(json);
      return parsed ? applySnapshot(parsed) : false;
    },
    [applySnapshot],
  );

  const importSnapshot = React.useCallback(
    (nextSnapshot: DayFlowSnapshot) => applySnapshot(nextSnapshot),
    [applySnapshot],
  );

  const resetData = React.useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setRoutines(seedRoutines());
    setHabits(DEFAULT_HABITS);
    setHabitLogs([]);
    setBlockLogs([]);
    setPriorities([]);
    setApplications([]);
    setEnergyLogs([]);
    setFrictionLogs([]);
    setWeekPlans([]);
    setFlexTasks([]);
  }, []);

  const routine = React.useMemo(() => {
    return (
      routines.find((r) => r.id === settings.activeRoutineId) ?? routines[0]
    );
  }, [routines, settings.activeRoutineId]);

  const value: AppStore = {
    hydrated,
    settings,
    routines,
    routine,
    habits,
    habitLogs,
    blockLogs,
    priorities,
    applications,
    energyLogs,
    frictionLogs,
    flexTasks,
    snapshot,
    setActiveRoutine,
    setEnergyMode,
    setMinimumDay,
    setMedicationTracking,
    setThemeMode,
    setInterfaceColor,
    setDefaultSupportNeed,
    supportNeed,
    setSupportNeed,
    medicationStatus,
    setMedicationStatus,
    completeOnboarding,
    restartOnboarding,
    setVacationMode,
    createRoutine,
    duplicateRoutine,
    renameRoutine,
    deleteRoutine,
    addBlock,
    updateBlock,
    deleteBlock,
    addRoutineTemplate,
    addFlexTasks,
    setFlexTaskDone,
    updateFlexTask,
    removeFlexTask,
    addHabit,
    removeHabit,
    habitStatus,
    setHabitStatus,
    blockStatus,
    setBlockStatus,
    addPriority,
    togglePriority,
    updatePriority,
    removePriority,
    skipTask,
    addApplication,
    updateApplication,
    removeApplication,
    weekPlans,
    getWeekPlan,
    setWeekPlan,
    exportData,
    importData,
    importSnapshot,
    resetData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
