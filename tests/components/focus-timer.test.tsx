import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FocusTimer } from "@/components/focus-timer";

describe("FocusTimer", () => {
  it("counts from an absolute finish time so background delays do not drift", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T12:00:00Z"));
    render(<FocusTimer onDone={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "10m" }));
    expect(screen.getByRole("img", { name: "10:00 focus" })).toBeTruthy();

    vi.setSystemTime(new Date("2026-07-15T12:05:00Z"));
    act(() => vi.advanceTimersByTime(1_000));
    expect(screen.getByRole("img", { name: "4:59 focus" })).toBeTruthy();
  });

  it("lets the user stop without marking the task complete", () => {
    const onDone = vi.fn();
    render(<FocusTimer onDone={onDone} />);

    fireEvent.click(screen.getByRole("button", { name: "25m" }));
    fireEvent.click(screen.getByRole("button", { name: "Stop focus timer" }));

    expect(onDone).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "25m" })).toBeTruthy();
  });
});
