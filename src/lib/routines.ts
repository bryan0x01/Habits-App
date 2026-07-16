import type { Routine, RoutineBlock } from "@/lib/types";
import { uid } from "@/lib/utils";

export interface NewRoutineInput {
  name: string;
  emoji?: string;
  description?: string;
}

export interface RoutineDraftInput extends NewRoutineInput {
  blocks: Array<Omit<RoutineBlock, "id">>;
}

/** Build an empty, user-owned routine without mutating the store. */
export function buildBlankRoutine(
  input: NewRoutineInput,
  id = uid("routine"),
): Routine {
  return {
    id,
    name: input.name.trim(),
    emoji: input.emoji?.trim() || "🌱",
    description:
      input.description?.trim() || "A flexible routine you can shape one block at a time.",
    seeded: false,
    blocks: [],
  };
}

/** Build a reviewed routine draft and assign fresh log-safe block ids. */
export function buildRoutineFromDraft(
  input: RoutineDraftInput,
  id = uid("routine"),
  nextBlockId: () => string = () => uid("block"),
): Routine {
  return {
    ...buildBlankRoutine(input, id),
    blocks: input.blocks.map((block) => ({ ...block, id: nextBlockId() })),
  };
}

/** Deep-copy a routine and give every log-addressable block a fresh id. */
export function buildRoutineCopy(
  source: Routine,
  id = uid("routine"),
  nextBlockId: () => string = () => uid("block"),
): Routine {
  return {
    ...source,
    id,
    name: `${source.name} (copy)`,
    seeded: false,
    blocks: source.blocks.map((block) => ({ ...block, id: nextBlockId() })),
  };
}
